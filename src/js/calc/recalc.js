// ************************
//
// Recalc Loop Code
//
// ************************

//
// How recalc works:
//
// !!!!!!!!!!!!!!
//

// SocialCalc.RecalcInfo - object with global recalc info

SocialCalc.RecalcInfo = {

   sheet: null, // which sheet is being recalced

   currentState: 0, // current state
   state: {idle: 0, start_calc: 1, order: 2, calc: 3, start_wait: 4, done_wait: 5}, // allowed state values

   recalctimer: null, // value to cancel timer
   maxtimeslice: 100, // maximum milliseconds per slice of recalc time before a wait
   timeslicedelay: 1, // milliseconds to wait between recalc time slices
   starttime: 0, // when recalc started

   queue: [], // queue of sheet waiting to be recalced

   // LoadSheet: a function that returns true if started a load or false if not.
   //

   LoadSheet: function(sheetname) {return false;} // default returns not found

   }

// SocialCalc.RecalcData - object with recalc info while determining recalc order and afterward

SocialCalc.RecalcData = function() { // initialize a RecalcData object

   this.inrecalc = true; // if true, doing a recalc
   this.celllist = []; // list with all potential cells to calculate
   this.celllistitem = 0; // cell to check next when ordering
   this.calclist = null; // object which is the chained list of cells to calculate
                         // each in the form of "coord: nextcoord"
                         // e.g., if B8 is calculated right after A8, then calclist.A8=="B8"
                         // if null, need to create the list
   this.calclistlength = 0; // number of items in calclist

   this.firstcalc = null; // start of the calc list - a string or null
   this.lastcalc = null; // last one on chain (used to add more to the end)

   this.nextcalc = null; // used to keep track during background recalc to make it restartable
   this.count = 0; // number calculated

   // checkinfo is used when determining calc order:

   this.checkinfo = {}; // attributes are coords; if no attrib for a coord, it wasn't checked or doesn't need it
                        // values are RecalcCheckInfo objects while checking or TRUE when complete

   }

// SocialCalc.RecalcCheckInfo - object that stores checking info while determining recalc order

SocialCalc.RecalcCheckInfo = function() { // initialize a RecalcCheckInfo object

   this.oldcoord = null; // chain back up of cells referring to cells
   this.parsepos = 0; // which token we are up to

   // range info

   this.inrange = false; // if true, in the process of checking a range of coords
   this.inrangestart = false; // if true, have not yet filled in range loop values
   this.cr1 = null; // range first coord as a cr object
   this.cr2 = null; // range second coord as a cr object
   this.c1 = null; // range extents
   this.c2 = null;
   this.r1 = null;
   this.r2 = null;
   this.c = null; // looping values
   this.r = null;

   }

// Recalc the entire sheet

SocialCalc.RecalcSheet = function(sheet) {

   var coord, err, recalcdata;
   var scri = SocialCalc.RecalcInfo;

   if (scri.currentState != scri.state.idle) {
      scri.queue.push(sheet);
      return;
      }

   delete sheet.attribs.circularreferencecell; // reset recalc-wide things
   SocialCalc.Formula.FreshnessInfoReset();

   SocialCalc.RecalcClearTimeout();

   scri.sheet = sheet; // set values needed by background recalc
   scri.currentState = scri.state.start_calc;

   scri.starttime = new Date();

   if (sheet.statuscallback) {
      sheet.statuscallback(scri, "calcstart", null, sheet.statuscallbackparams);
      }

   SocialCalc.RecalcSetTimeout();

   }

//
// SocialCalc.RecalcSetTimeout - set a timer for next recalc step
//

SocialCalc.RecalcSetTimeout = function() {

   var scri = SocialCalc.RecalcInfo;

   scri.recalctimer = window.setTimeout(SocialCalc.RecalcTimerRoutine, scri.timeslicedelay);

   }

//
// SocialCalc.RecalcClearTimeout - cancel any timeouts
//

SocialCalc.RecalcClearTimeout = function() {

   var scri = SocialCalc.RecalcInfo;

   if (scri.recalctimer) {
      window.clearTimeout(scri.recalctimer);
      scri.recalctimer = null;
      }

   }


//
// SocialCalc.RecalcLoadedSheet(sheetname, str, recalcneeded, live)
//
// Called when a sheet finishes loading with name, string, and t/f whether it should be recalced.
// If loaded sheet has sheet.attribs.recalc=="off", then no recalc done.
// If sheetname is null, then the sheetname waiting for will be used.
//

SocialCalc.RecalcLoadedSheet = function(sheetname, str, recalcneeded, live) {

   var sheet;
   var scri = SocialCalc.RecalcInfo;
   var scf = SocialCalc.Formula;

   sheet = SocialCalc.Formula.AddSheetToCache(sheetname || scf.SheetCache.waitingForLoading, str, live);

   if (recalcneeded && sheet && sheet.attribs.recalc!="off") { // if recalcneeded, and not manual sheet, chain in this new sheet to recalc loop
      sheet.previousrecalcsheet = scri.sheet;
      scri.sheet = sheet;
      scri.currentState = scri.state.start_calc;
      }
   scf.SheetCache.waitingForLoading = null;

   SocialCalc.RecalcSetTimeout();

   }


//
// SocialCalc.RecalcTimerRoutine - handles the actual order determination and cell-by-cell recalculation in the background
//

SocialCalc.RecalcTimerRoutine = function() {

   var eresult, cell, coord, err, status;
   var starttime = new Date();
   var count = 0;
   var scf = SocialCalc.Formula;
   if (!scf) {
      return "Need SocialCalc.Formula";
      }
   var scri = SocialCalc.RecalcInfo;
   var sheet = scri.sheet;
   if (!sheet) {
      return;
      }
   var recalcdata = sheet.recalcdata || (sheet.recalcdata = {});

   var do_statuscallback = function(status, arg) { // routine to do callback if required
      if (sheet.statuscallback) {
         sheet.statuscallback(recalcdata, status, arg, sheet.statuscallbackparams);
         }
      }

   SocialCalc.RecalcClearTimeout();

   if (scri.currentState == scri.state.start_calc) {

      recalcdata = new SocialCalc.RecalcData();
      sheet.recalcdata = recalcdata;

      for (coord in sheet.cells) { // get list of cells to check for order
         if (!coord) continue;
         recalcdata.celllist.push(coord);
         }

      recalcdata.calclist = {}; // start with empty list
      scri.currentState = scri.state.order; // drop through to determining recalc order
      }

   if (scri.currentState == scri.state.order) {
      while (recalcdata.celllistitem < recalcdata.celllist.length) { // check all the cells to see if they should be on the list
         coord = recalcdata.celllist[recalcdata.celllistitem++];
         err = SocialCalc.RecalcCheckCell(sheet, coord);
         if (((new Date()) - starttime) >= scri.maxtimeslice) { // if taking too long, give up CPU for a while
            do_statuscallback("calcorder", {coord: coord, total: recalcdata.celllist.length, count: recalcdata.celllistitem});
            SocialCalc.RecalcSetTimeout();
            return;
            }
         }

      do_statuscallback("calccheckdone", recalcdata.calclistlength);

      recalcdata.nextcalc = recalcdata.firstcalc; // start at the beginning of the recalc chain
      scri.currentState = scri.state.calc; // loop through cells on next timer call
      SocialCalc.RecalcSetTimeout();
      return;
      }

   if (scri.currentState == scri.state.start_wait) { // starting to wait for something
      scri.currentState = scri.state.done_wait; // finished on next timer call
      if (scri.LoadSheet) {
         status = scri.LoadSheet(scf.SheetCache.waitingForLoading);
         if (status) { // started a load operation
            return;
            }
         }
      SocialCalc.RecalcLoadedSheet(null, "", false);
      return;
      }

   if (scri.currentState == scri.state.done_wait) {
      scri.currentState = scri.state.calc; // loop through cells on next timer call
      SocialCalc.RecalcSetTimeout();
      return;
      }

   // otherwise should be scri.state.calc

   if (scri.currentState != scri.state.calc) {
      alert("Recalc state error: "+scri.currentState+". Error in SocialCalc code.");
      }

   coord = sheet.recalcdata.nextcalc;
   while (coord) {
      cell = sheet.cells[coord];
    // app widgets need cell ID so store in parseinfo {
      if (!cell.parseinfo) { // cache parsed formula
        cell.parseinfo = scf.ParseFormulaIntoTokens(cell.formula);
        }
      cell.parseinfo.coord = coord;
    // }
      eresult = scf.evaluate_parsed_formula(cell.parseinfo, sheet, false);
      if (scf.SheetCache.waitingForLoading) { // wait until restarted
         // schedule render to run while waiting for dependent sheet to load - schedules first render of sheet
         if (scri.firstRenderScheduled != true) {
           var editor = SocialCalc.GetSpreadsheetControlObject().editor;
           editor.ScheduleRender(false);
           scri.firstRenderScheduled = true; // stop more renders because done first render of sheet
         }
         recalcdata.nextcalc = coord; // start with this cell again
         recalcdata.count += count;
         do_statuscallback("calcloading", {sheetname: scf.SheetCache.waitingForLoading});
         scri.currentState = scri.state.start_wait; // start load on next timer call
         SocialCalc.RecalcSetTimeout();
         return;
         }

      if (scf.RemoteFunctionInfo.waitingForServer) { // wait until restarted
         recalcdata.nextcalc = coord; // start with this cell again
         recalcdata.count += count;
         do_statuscallback("calcserverfunc",
            {funcname: scf.RemoteFunctionInfo.waitingForServer, coord: coord, total: recalcdata.calclistlength, count: recalcdata.count});
         scri.currentState = scri.state.done_wait; // start load on next timer call
         return; // return and wait for next recalc timer event
         }

      if (cell.datavalue != eresult.value ||
       cell.valuetype != eresult.type) { // only update if changed from last time
         cell.datavalue = eresult.value;
         cell.valuetype = eresult.type;
         delete cell.displaystring;
         sheet.recalcchangedavalue = true; // remember something changed in case other code wants to know
         }
      if (eresult.error) {
         cell.errors = eresult.error;
         }
      count++;
      coord = sheet.recalcdata.calclist[coord];

      if (((new Date()) - starttime) >= scri.maxtimeslice) { // if taking too long, give up CPU for a while
         recalcdata.nextcalc = coord; // start with next cell on chain
         recalcdata.count += count;
         do_statuscallback("calcstep", {coord: coord, total: recalcdata.calclistlength, count: recalcdata.count});
         SocialCalc.RecalcSetTimeout();
         return;
         }
      }

   recalcdata.inrecalc = false;

   sheet.reRenderCellList = sheet.recalcdata.celllist; // GUI widgets need focus - if app then only re-render non-widget cells
   delete sheet.recalcdata; // save memory and clear out for name lookup formula evaluation

   delete sheet.attribs.needsrecalc; // remember recalc done

   scri.sheet = sheet.previousrecalcsheet || null; // chain back if doing recalc of loaded sheets
   if (scri.sheet) {
      scri.currentState = scri.state.calc; // start where we left off
      SocialCalc.RecalcSetTimeout();
      return;
      }

   scf.FreshnessInfo.recalc_completed = true; // say freshness info is complete
   scri.currentState = scri.state.idle; // we are idle

   do_statuscallback("calcfinished", (new Date()) - scri.starttime);

   // Check queue for more sheets.
   if (scri.queue.length > 0) {
      sheet = scri.queue.shift();
      sheet.RecalcSheet();
      }
   }


//
// circref = SocialCalc.RecalcCheckCell(sheet, coord)
//
// Checks cell to put on calclist, looking at parsed tokens.
// Also checks cells this cell is dependent upon
// if it contains a formula with cell references.
// If circular reference, returns non-null.
//

SocialCalc.RecalcCheckCell = function(sheet, startcoord) {

   var parseinfo, ttext, ttype, i, rangecoord, circref, value, pos, pos2, cell, coordvals;
   var scf = SocialCalc.Formula;
   if (!scf) {
      return "Need SocialCalc.Formula";
      }
   var tokentype = scf.TokenType;
   var token_op = tokentype.op;
   var token_name = tokentype.name;
   var token_coord = tokentype.coord;

   var recalcdata = sheet.recalcdata;
   var checkinfo = recalcdata.checkinfo;

   var sheetref = false; // if true, a sheet reference is in effect, so don't check that
   var oldcoord = null; // coord of formula that referred to this one when checking down the tree
   var coord = startcoord; // the coord of the cell we are checking

   // Start with requested cell, and then continue down or up the dependency tree
   // oldcoord (and checkinfo[coord].oldcoord) maintains the reference stack during the tree walk
   // checkinfo[coord] maintains the stack of checking looping values, e.g., token number being checked

mainloop:
   while (coord) {
      cell = sheet.cells[coord];
      coordvals = checkinfo[coord];

      if (!cell || cell.datatype != "f" || // Don't calculate if not a formula
          (coordvals && typeof coordvals != "object")) { // Don't calc if already calculated
         coord = oldcoord; // go back up dependency tree to coord that referred to us
         if (checkinfo[coord]) oldcoord = checkinfo[coord].oldcoord;
         continue;
         }

      if (!coordvals) { // do we have checking information about this cell?
         coordvals = new SocialCalc.RecalcCheckInfo(); // no - make a place to hold it
         checkinfo[coord] = coordvals;
         }

      if (cell.errors) { // delete errors from previous recalcs
         delete cell.errors;
         }

      if (!cell.parseinfo) { // cache parsed formula
         cell.parseinfo = scf.ParseFormulaIntoTokens(cell.formula);
         }
      parseinfo = cell.parseinfo;

      for (i=coordvals.parsepos; i<parseinfo.length; i++) { // go through each token in formula

         if (coordvals.inrange) { // processing a range of coords
            if (coordvals.inrangestart) { // first time - fill in other values
               if (coordvals.cr1.col > coordvals.cr2.col) { coordvals.c1 = coordvals.cr2.col; coordvals.c2 = coordvals.cr1.col; }
               else { coordvals.c1 = coordvals.cr1.col; coordvals.c2 = coordvals.cr2.col; }
               coordvals.c = coordvals.c1 - 1; // start one before

               if (coordvals.cr1.row > coordvals.cr2.row) { coordvals.r1 = coordvals.cr2.row; coordvals.r2 = coordvals.cr1.row; }
               else { coordvals.r1 = coordvals.cr1.row; coordvals.r2 = coordvals.cr2.row; }
               coordvals.r = coordvals.r1; // start on this row
               coordvals.inrangestart = false;
               }
            else { // not first time
               }
            coordvals.c += 1; // increment column
            if (coordvals.c > coordvals.c2) { // finished the columns of this row
               coordvals.r += 1; // increment row
               if (coordvals.r > coordvals.r2) { // finished checking the entire range
                  coordvals.inrange = false;
                  continue;
                  }
               coordvals.c = coordvals.c1; // start at the beginning of next row
               }
            rangecoord = SocialCalc.crToCoord(coordvals.c, coordvals.r);

            // now check that one

            coordvals.parsepos = i; // remember our position
            coordvals.oldcoord = oldcoord; // remember back up chain
            oldcoord = coord; // come back to us
            coord = rangecoord;
            if (checkinfo[coord] && typeof checkinfo[coord] == "object") { // Circular reference
               cell.errors = SocialCalc.Constants.s_caccCircRef+startcoord; // set on original cell making the ref
               checkinfo[startcoord] = true; // this one should be calculated once at this point
               if (!recalcdata.firstcalc) {
                  recalcdata.firstcalc = startcoord;
                  }
               else {
                  recalcdata.calclist[recalcdata.lastcalc] = startcoord;
                  }
               recalcdata.lastcalc = startcoord;
               recalcdata.calclistlength++; // count number on list
               sheet.attribs.circularreferencecell = coord+"|"+oldcoord; // remember at least one circ ref
               return cell.errors;
               }
            continue mainloop;
            }

         ttype = parseinfo[i].type; // get token details
         ttext = parseinfo[i].text;
         if (ttype == token_op) { // references with sheet specifier are not checked
            if (ttext == "!") {
               sheetref = true; // found a sheet reference
               }
            else if (ttext != ":") { // for everything but a range, reset
               sheetref = false;
               }
            }

         if (ttype == token_name) { // look for named range
            value = scf.LookupName(sheet, ttext);
            if (value.type == "range") { // only need to recurse here for range, which may be just one cell
               pos = value.value.indexOf("|");
               if (pos != -1) { // range - check each cell
                  coordvals.cr1 = SocialCalc.coordToCr(value.value.substring(0,pos));
                  pos2 = value.value.indexOf("|", pos+1);
                  coordvals.cr2 = SocialCalc.coordToCr(value.value.substring(pos+1,pos2));
                  coordvals.inrange = true;
                  coordvals.inrangestart = true;
                  i = i-1; // back up so will start up again here
                  continue;
                  }
               }
            else if (value.type == "coord") { // just a coord
               ttype = token_coord; // treat as a coord inline
               ttext = value.value; // and then drop through to next test which should succeed
               }
            else { // not a defined name - probably a function
               }
            }

         if (ttype == token_coord) { // token is a coord

            if (i >= 2 // look for a range
             && parseinfo[i-1].type == token_op && parseinfo[i-1].text == ':'
             && parseinfo[i-2].type == token_coord
             && !sheetref) { // Range -- check each cell
               coordvals.cr1 = SocialCalc.coordToCr(parseinfo[i-2].text); // remember range extents
               coordvals.cr2 = SocialCalc.coordToCr(ttext);
               coordvals.inrange = true; // next time use the range looping code
               coordvals.inrangestart = true;
               i = i-1; // back up so will start up again here
               continue;
               }

            else if (!sheetref) { // Single cell reference
               if (ttext.indexOf("$") != -1) ttext = ttext.replace(/\$/g, ""); // remove any $'s
               coordvals.parsepos = i+1; // remember our position - come back on next token
               coordvals.oldcoord = oldcoord; // remember back up chain
               oldcoord = coord; // come back to us
               coord = ttext;
               if (checkinfo[coord] && typeof checkinfo[coord] == "object") { // Circular reference
                  cell.errors = SocialCalc.Constants.s_caccCircRef+startcoord; // set on original cell making the ref
                  checkinfo[startcoord] = true; // this one should be calculated once at this point
                  if (!recalcdata.firstcalc) { // add to calclist
                     recalcdata.firstcalc = startcoord;
                     }
                  else {
                     recalcdata.calclist[recalcdata.lastcalc] = startcoord;
                     }
                  recalcdata.lastcalc = startcoord;
                  recalcdata.calclistlength++; // count number on list
                  sheet.attribs.circularreferencecell = coord+"|"+oldcoord; // remember at least one circ ref
                  return cell.errors;
                  }
               continue mainloop;
               }
            }
         }

      sheetref = false; // make sure off when bump back up

      checkinfo[coord] = true; // this one is finished
      if (!recalcdata.firstcalc) { // add to calclist
         recalcdata.firstcalc = coord;
         }
      else {
         recalcdata.calclist[recalcdata.lastcalc] = coord;
         }
      recalcdata.lastcalc = coord;
      recalcdata.calclistlength++; // count number on list

      coord = oldcoord; // go back to the formula that referred to us and continue
      oldcoord = checkinfo[coord] ? checkinfo[coord].oldcoord : null;

      }

   return "";

   }