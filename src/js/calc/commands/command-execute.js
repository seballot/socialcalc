

//
// errortext = SocialCalc.ExecuteSheetCommand(sheet, cmd, saveundo)
//
// cmd is a SocialCalc.Parse object.
//
// Executes commands that modify the sheet data.
// Sets sheet "needsrecalc" as needed.
// Sets sheet "changedrendervalues" as needed.
//
// The cmd string may be multiple commands, separated by newlines. In that case
// only one "step" is put on the undo stack representing all the commands.
// Note that because of this, in "set A1 text ..." and "set A1 comment ..." text is
// treated as encoded (newline => \n, \ => \b, : => \c).
//
// The commands are in the forms:
//
//    set sheet attributename value (plus lastcol and lastrow)
//    set 22 attributename value
//    set B attributename value
//    set A1 attributename value1 value2... (see each attribute in code for details)
//    set A1:B5 attributename value1 value2...
//    erase/copy/cut/paste/fillright/filldown A1:B5 all/formulas/format
//    loadclipboard save-encoded-clipboard-data
//    clearclipboard
//    merge C3:F3
//    unmerge C3
//    insertcol/insertrow C5
//    deletecol/deleterow C5:E7
//    movepaste/moveinsert A1:B5 A8 all/formulas/format (if insert, destination must be in same rows or columns or else paste done)
//    sort cr1:cr2 col1 up/down col2 up/down col3 up/down
//    name define NAME definition
//    name desc NAME description
//    name delete NAME
//    recalc
//    redisplay
//    changedrendervalues
//    startcmdextension extension rest-of-command
//    sendemail ??? eddy ???
//
// If saveundo is true, then undo information is saved in sheet.changes.
//

SocialCalc.ExecuteSheetCommand = function(sheet, cmd, saveundo) {

   var cmdstr, cmd1, rest, what, attrib, num, pos, pos2, errortext, undostart, val;
   var cr1, cr2, col, row, cr, cell, newcell;
   var fillright, rowstart, colstart, crbase, rowoffset, coloffset, basecell;
   var clipsheet, cliprange, numcols, numrows, attribtable;
   var colend, rowend, newcolstart, newrowstart, newcolend, newrowend, rownext, colnext, colthis, cellnext;
   var lastrow, lastcol, rowbefore, colbefore, oldformula, oldcr;
   var cols, dirs, lastsortcol, i, sortlist, sortcells, sortvalues, sorttypes;
   var sortfunction, slen, valtype, originalrow, sortedcr;
   var name, v1, v2;
   var cmdextension;
   var col, row, editor, undoNum, trackLine;

   var attribs = sheet.attribs;
   var changes = sheet.changes;
   var cellProperties = SocialCalc.CellProperties;
   var scc = SocialCalc.Constants;
   var cellChanged = false;

   var ParseRange =
      function() {
         var prange = SocialCalc.ParseRange(what);
         cr1 = prange.cr1;
         cr2 = prange.cr2;
         if (cr2.col > attribs.lastcol) attribs.lastcol = cr2.col;
         if (cr2.row > attribs.lastrow) attribs.lastrow = cr2.row;
      };

   errortext = "";

   cmdstr = cmd.RestOfStringNoMove();
   if (saveundo) sheet.changes.AddDo(cmdstr);

   cmd1 = cmd.NextToken();
   switch (cmd1) {

      case "set":
         what = cmd.NextToken();
         attrib = cmd.NextToken();
         rest = cmd.RestOfString();
         undostart = "set "+what+" "+attrib;

         if (what=="sheet") {
            sheet.renderneeded = true;
            switch (attrib) {
               case "defaultcolwidth":
                  if (saveundo) changes.AddUndo(undostart, attribs[attrib]);
                  attribs[attrib] = rest;
                  break;
               case "defaultcolor":
               case "defaultbgcolor":
                  if (saveundo) changes.AddUndo(undostart, sheet.GetAttributeString("color", attribs[attrib]));
                  attribs[attrib] = sheet.MapAttributeToId("color", rest);
                  break;
               case "defaultlayout":
                  if (saveundo) changes.AddUndo(undostart, sheet.GetAttributeString("layout", attribs[attrib]));
                  attribs[attrib] = sheet.MapAttributeToId("layout", rest);
                  break;
               case "defaultfont":
                  if (saveundo) changes.AddUndo(undostart, sheet.GetAttributeString("font", attribs[attrib]));
                  if (rest=="* * *") rest = ""; // all default
                  attribs[attrib] = sheet.MapAttributeToId("font", rest);
                  break;
               case "defaulttextformat":
               case "defaultnontextformat":
                  if (saveundo) changes.AddUndo(undostart, sheet.GetAttributeString("cellformat", attribs[attrib]));
                  attribs[attrib] = sheet.MapAttributeToId("cellformat", rest);
                  break;
               case "defaulttextvalueformat":
               case "defaultnontextvalueformat":
                  if (saveundo) changes.AddUndo(undostart, sheet.GetAttributeString("valueformat", attribs[attrib]));
                  attribs[attrib] = sheet.MapAttributeToId("valueformat", rest);
                  for (cr in sheet.cells) { // forget all cached display strings
                     delete sheet.cells[cr].displaystring;
                  }
                  break;
               case "lastcol":
               case "lastrow":
                  if (saveundo) changes.AddUndo(undostart, attribs[attrib]-0);
                  num = rest-0;
                  if (typeof num == "number") attribs[attrib] = num > 0 ? num : 1;
                  break;
               case "recalc":
                  if (saveundo) changes.AddUndo(undostart, attribs[attrib]);
                  if (rest == "off") {
                     attribs.recalc = rest; // manual recalc, not auto
                  }
                  else { // all values other than "off" mean "on"
                     delete attribs.recalc;
                  }
                  break;
               case "usermaxcol":
               case "usermaxrow":
                  if (saveundo) changes.AddUndo(undostart, attribs[attrib]-0);
                  num = rest-0;
                  if (typeof num == "number") attribs[attrib] = num > 0 ? num : 0;
                  break;
               default:
                  errortext = scc.s_escUnknownSheetCmd+cmdstr;
                  break;
            }
         }

         else if (/^[a-z]{1,2}(:[a-z]{1,2})?$/i.test(what)) { // col attributes
            sheet.renderneeded = true;

            what = what.toUpperCase();
            pos = what.indexOf(":");
            if (pos>=0) {
               cr1 = SocialCalc.coordToCr(what.substring(0,pos)+"1");
               cr2 = SocialCalc.coordToCr(what.substring(pos+1)+"1");
            }
            else {
               cr1 = SocialCalc.coordToCr(what+"1");
               cr2 = cr1;
            }
            for (col=cr1.col; col <= cr2.col; col++) {
               if (attrib=="width") {
                  cr = SocialCalc.rcColname(col);
                  if (saveundo) changes.AddUndo("set "+cr+" width", sheet.colattribs.width[cr]);
                  if (rest.length > 0 ) {
                     sheet.colattribs.width[cr] = rest;
                  }
                  else {
                     delete sheet.colattribs.width[cr];
                  }
               }
               else if (attrib=="hide") {
                  sheet.hiddencolrow = "col";
                  cr = SocialCalc.rcColname(col);
                  if (saveundo) changes.AddUndo("set "+cr+" hide", sheet.colattribs.hide[cr]);
                  if (rest.length > 0) {
                     sheet.colattribs.hide[cr] = rest;
                  }
                  else {
                     delete sheet.colattribs.hide[cr];
                  }
               }
            }
         }

         else if (/^\d+(:\d+)?$/i.test(what)) { // row attributes
            sheet.renderneeded = true;
            what = what.toUpperCase();
            pos = what.indexOf(":");
            if (pos>=0) {
               cr1 = SocialCalc.coordToCr("A"+what.substring(0,pos));
               cr2 = SocialCalc.coordToCr("A"+what.substring(pos+1));
            }
            else {
               cr1 = SocialCalc.coordToCr("A"+what);
               cr2 = cr1;
            }
            for (row=cr1.row; row <= cr2.row; row++) {
               if (attrib=="height") {
                  if (saveundo) changes.AddUndo("set "+row+" height", sheet.rowattribs.height[row]);
                  if (rest.length > 0 ) {
                     sheet.rowattribs.height[row] = rest;
                  }
                  else {
                     delete sheet.rowattribs.height[row];
                  }
               }
               else if (attrib=="hide") {
                  sheet.hiddencolrow = "row";
                  if (saveundo) changes.AddUndo("set "+row+" hide", sheet.rowattribs.hide[row]);
                  if (rest.length > 0) {
                     sheet.rowattribs.hide[row] = rest;
                  }
                  else {
                     delete sheet.rowattribs.hide[row];
                  }
               }
            }
         }

         else if (/^[a-z]{1,2}\d+(:[a-z]{1,2}\d+)?$/i.test(what)) { // cell attributes
            cellChanged = true;
            ParseRange();
            if (cr1.row!=cr2.row || cr1.col!=cr2.col || sheet.celldisplayneeded || sheet.renderneeded) { // not one cell
               sheet.renderneeded = true;
               sheet.celldisplayneeded = "";
            }
            else {
               sheet.celldisplayneeded = SocialCalc.crToCoord(cr1.col, cr1.row);
            }
            for (row=cr1.row; row <= cr2.row; row++) {
               for (col=cr1.col; col <= cr2.col; col++) {
                  cr = SocialCalc.crToCoord(col, row);
                  cell=sheet.GetAssuredCell(cr);
                  if (cell.readonly && attrib!="readonly") continue;
                  if (saveundo) changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));
                  if (attrib=="value") { // set coord value type numeric-value
                     pos = rest.indexOf(" ");
                     cell.datavalue = rest.substring(pos+1)-0;
                     delete cell.errors;
                     cell.datatype = "v";
                     cell.valuetype = rest.substring(0,pos);
                     delete cell.displaystring;
                     delete cell.parseinfo;
                     attribs.needsrecalc = "yes";
                  }
                  else if (attrib=="text") { // set coord text type text-value
                     pos = rest.indexOf(" ");
                     cell.datavalue = SocialCalc.decodeFromSave(rest.substring(pos+1));
                     delete cell.errors;
                     cell.datatype = "t";
                     cell.valuetype = rest.substring(0,pos);
                     delete cell.displaystring;
                     delete cell.parseinfo;
                     attribs.needsrecalc = "yes";
                  }
                  else if (attrib=="formula") { // set coord formula formula-body-less-initial-=
                     cell.datavalue = 0; // until recalc
                     delete cell.errors;
                     cell.datatype = "f";
                     if(SocialCalc._app && cell.valuetype != "e#N/A") cell.prevvaluetype = cell.valuetype;  // repaint when widgets added/removed
                     cell.valuetype = "e#N/A"; // until recalc
                     cell.formula = rest;
                     delete cell.displaystring;
                     delete cell.parseinfo;
                     attribs.needsrecalc = "yes";
                  }
                  else if (attrib=="constant") { // set coord constant type numeric-value source-text
                     pos = rest.indexOf(" ");
                     pos2 = rest.substring(pos+1).indexOf(" ");
                     cell.datavalue = rest.substring(pos+1,pos+1+pos2)-0;
                     cell.valuetype = rest.substring(0,pos);
                     if (cell.valuetype.charAt(0)=="e") { // error
                        cell.errors = cell.valuetype.substring(1);
                     }
                     else {
                        delete cell.errors;
                     }
                     cell.datatype = "c";
                     cell.formula = rest.substring(pos+pos2+2);
                     delete cell.displaystring;
                     delete cell.parseinfo;
                     attribs.needsrecalc = "yes";
                  }
                  else if (attrib=="empty") { // erase value
                     cell.datavalue = "";
                     delete cell.errors;
                     cell.datatype = null;
                     cell.formula = "";
                     cell.valuetype = "b";
                     delete cell.displaystring;
                     delete cell.parseinfo;
                     attribs.needsrecalc = "yes";
                  }
                  else if (attrib=="all") { // set coord all :this:val1:that:val2...
                     if (rest.length>0) {
                        cell = new SocialCalc.Cell(cr);
                        sheet.CellFromStringParts(cell, rest.split(":"), 1);
                        sheet.cells[cr] = cell;
                     }
                     else {
                        delete sheet.cells[cr];
                     }
                     attribs.needsrecalc = "yes";
                  }
                  else if (attrib=="textvalueformat" || attrib=="nontextvalueformat") {
                     cell[attrib] = sheet.MapAttributeToId("valueformat", rest);
                     delete cell.displaystring;
                  }
                  else if (attrib=="cssc") {
                     rest = rest.replace(/[^a-zA-Z0-9\-]/g, "");
                     cell.cssc = rest;
                  }
                  else if (attrib=="csss") {
                     rest = rest.replace(/\n/g, "");
                     cell.csss = rest;
                  }
                  else if (attrib=="mod") {
                     rest = rest.replace(/[^yY]/g, "").toLowerCase();
                     cell.mod = rest;
                  }
                  else if (attrib=="comment") {
                     cell.comment = SocialCalc.decodeFromSave(rest);
                  }
                  else if (attrib=="readonly") {
                     cell.readonly = rest.toLowerCase()=="yes";
                  }
                  else if (attrib=="style.border") {
                     if (rest && rest != "null") {
                        cell.style.border = rest;
                        if (!cell.style['border-width']) cell.style['border-width'] = '1px';
                        if (!cell.style['border-style']) cell.style['border-style'] = 'solid';
                        if (!cell.style['border-color']) cell.style['border-color'] = scc.defaultCellBorderOnColor;
                     } else {
                        delete cell.style.border;
                     }
                  }
                  else if (attrib.split('.')[0] == 'style') { // exple: style.font-weight
                     if (rest && rest != "null") cell.style[attrib.split('.')[1]] = rest; // save the attribute value in the cell (useful to use for rendering)
                     else delete cell.style[attrib.split('.')[1]];
                     cell.styleId = sheet.MapAttributeToId("style", cell.style);
                  }
                  else {
                     errortext = scc.s_escUnknownSetCoordCmd+cmdstr;
                  }
               }
            }

         }
         break;

      case "merge":
         sheet.renderneeded = true;
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         ParseRange();
         cell=sheet.GetAssuredCell(cr1.coord);
         if (cell.readonly) break;

         // check whether merged cells other than cr1 contain data and clear them
         for (row=cr1.row; row <= cr2.row; row++) {
            for (col=cr1.col; col <= cr2.col; col++) {
               if (!(row == cr1.row && col == cr1.col)){ // skip top left cell
                   quashedCellCoord = SocialCalc.crToCoord(col, row);
                   quashedCell = sheet.GetAssuredCell(quashedCellCoord);
                   // save quashed cell value for undo
                   if (saveundo) changes.AddUndo("set "+quashedCellCoord+" all", sheet.CellToString(quashedCell));
                   delete sheet.cells[quashedCellCoord]; // delete cell
               }
            }
         }


         if (saveundo) changes.AddUndo("unmerge "+cr1.coord);

         if (cr2.col > cr1.col) cell.colspan = cr2.col - cr1.col + 1;
         else delete cell.colspan;
         if (cr2.row > cr1.row) cell.rowspan = cr2.row - cr1.row + 1;
         else delete cell.rowspan;

         sheet.changedrendervalues = true;

         break;

      case "unmerge":
         sheet.renderneeded = true;
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         ParseRange();
         cell=sheet.GetAssuredCell(cr1.coord);
         if (cell.readonly) break;
         if (saveundo) changes.AddUndo("merge "+cr1.coord+":"+SocialCalc.crToCoord(cr1.col+(cell.colspan||1)-1, cr1.row+(cell.rowspan||1)-1));

         delete cell.colspan;
         delete cell.rowspan;

         sheet.changedrendervalues = true;

         break;

      case "erase":
      case "cut":
         sheet.renderneeded = true;
         sheet.changedrendervalues = true;
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         ParseRange();

         if (saveundo) changes.AddUndo("changedrendervalues"); // to take care of undone pasted spans
         if (cmd1=="cut") { // save copy of whole thing before erasing
            if (saveundo) changes.AddUndo("loadclipboard", SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard));
            SocialCalc.Clipboard.clipboard = SocialCalc.CreateSheetSave(sheet, what);
         }

         for (row = cr1.row; row <= cr2.row; row++) {
            for (col = cr1.col; col <= cr2.col; col++) {
               cr = SocialCalc.crToCoord(col, row);
               cell=sheet.GetAssuredCell(cr);
               if (cell.readonly) continue;
               if (saveundo) changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));
               if (rest=="all") {
                  delete sheet.cells[cr];
               }
               else if (rest == "formulas") {
                  cell.datavalue = "";
                  cell.datatype = null;
                  cell.formula = "";
                  cell.valuetype = "b";
                  delete cell.errors;
                  delete cell.displaystring;
                  delete cell.parseinfo;
                  if (cell.comment) { // comments are considered content for erasing
                     delete cell.comment;
                  }
               }
               else if (rest == "formats") {
                  newcell = new SocialCalc.Cell(cr); // create a new cell without attributes
                  newcell.datavalue = cell.datavalue; // copy existing values
                  newcell.datatype = cell.datatype;
                  newcell.formula = cell.formula;
                  newcell.valuetype = cell.valuetype;
                  if (cell.comment) {
                     newcell.comment = cell.comment;
                  }
                  sheet.cells[cr] = newcell; // replace
               }
            }
         }
         attribs.needsrecalc = "yes";
         break;

      case "fillright":
      case "filldown":
      case "fillup":
      case "fillleft":
         sheet.renderneeded = true;
         sheet.changedrendervalues = true;
         if (saveundo) changes.AddUndo("changedrendervalues"); // to take care of undone pasted spans
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         ParseRange();

         function increment_amount(horizontal, inverse) {
            function valid_datatype(type) {
              return type == "v" || type == "c";
         }
            var editor = SocialCalc.GetSpreadsheetControlObject().editor;
            var range = editor.range2;
            var returnval = undefined;

            if (range.hasrange) {
               var startcell, endcell;
               startcell = sheet.GetAssuredCell(SocialCalc.crToCoord(range.left, range.top))
               if (horizontal /*&& range.left != range.right*/)
                  endcell = sheet.GetAssuredCell(SocialCalc.crToCoord(range.left + 1, range.top))
               else /*if (!horizontal && (range.bottom - range.top == 1) && range.left == range.right)*/
                  endcell = sheet.GetAssuredCell(SocialCalc.crToCoord(range.left, range.top + 1))

               if (valid_datatype(startcell.datatype) && valid_datatype(endcell.datatype))
                  returnval =  endcell.datavalue - startcell.datavalue;
            }
            editor.Range2Remove();
            return returnval;
         }

         var inc, horizontal, inverse, crStart, crEnd;

         if (cmd1 == "fillright") {
            horizontal = true; inverse = false; }
         else if (cmd1 == "fillleft") {
            horizontal = true; inverse = true; }
         else if (cmd1 == "filldown") {
            horizontal = false; inverse = false; }
         else if (cmd1 == "fillup") {
            horizontal = false; inverse = true; }

         // when selecting multiple cell and filling, we may want to increament the list like
         // selecting "1,2,3" and filling will produce "5,6,7,8..."
         inc = increment_amount(horizontal, inverse);

         if (inverse) {
            crStart = cr2; crEnd = cr1; }
         else {
            crStart = cr1; crEnd = cr2; }

         row = crStart.row; col = crStart.col;

         do {
            if (row < crEnd.row) row++;
            if (row > crEnd.row) row--;
            do {
               if (col < crEnd.col) col++;
               if (col > crEnd.col) col--;

               cr = SocialCalc.crToCoord(col, row);
               cell = sheet.GetAssuredCell(cr);
               if (cell.readonly) continue;
               if (saveundo) changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));

               coloffset = col - crStart.col;
               rowoffset = row - crStart.row;
               basecell = sheet.GetAssuredCell(SocialCalc.crToCoord(crStart.col, crStart.row));

               if (rest == "all" || rest == "formats") {
                  for (attrib in cellProperties) {
                     if (cellProperties[attrib] == 1) continue; // copy only format attributes
                     if (typeof basecell[attrib] === undefined || cellProperties[attrib] == 3)
                        delete cell[attrib];
                     else
                        cell[attrib] = basecell[attrib];
                  }
               }
               if (rest == "all" || rest == "formulas") {

                  if (inc !== undefined)
                     cell.datavalue = basecell.datavalue + (horizontal ? coloffset : rowoffset)*inc;
                  else
                     cell.datavalue = basecell.datavalue;

                  cell.datatype = basecell.datatype;
                  cell.valuetype = basecell.valuetype;
                  if (cell.datatype == "f")  // offset relative coords, even in sheet references
                     cell.formula = SocialCalc.OffsetFormulaCoords(basecell.formula, coloffset, rowoffset);
                  else
                     cell.formula = basecell.formula;
                  delete cell.parseinfo;
                  cell.errors = basecell.errors;
               }
               delete cell.displaystring;

            } while (col != crEnd.col)
         } while (row != crEnd.row)

         attribs.needsrecalc = "yes";
         break;

      case "copy":
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         if (saveundo) changes.AddUndo("loadclipboard", SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard));
         SocialCalc.Clipboard.clipboard = SocialCalc.CreateSheetSave(sheet, what);
         break;

      case "loadclipboard":
         rest = cmd.RestOfString();
         if (saveundo) changes.AddUndo("loadclipboard", SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard));
         SocialCalc.Clipboard.clipboard = SocialCalc.decodeFromSave(rest);
         break;

      case "clearclipboard":
         if (saveundo) changes.AddUndo("loadclipboard", SocialCalc.encodeForSave(SocialCalc.Clipboard.clipboard));
         SocialCalc.Clipboard.clipboard = "";
         break;

      case "paste":
         sheet.renderneeded = true;
         sheet.changedrendervalues = true;
         if (saveundo) changes.AddUndo("changedrendervalues"); // to take care of undone pasted spans
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         ParseRange();
         if (!SocialCalc.Clipboard.clipboard) {
            break;
         }
         clipsheet = new SocialCalc.Sheet(); // load clipboard contents as another sheet
         console.log("sheet save", SocialCalc.Clipboard.clipboard);
         clipsheet.ParseSheetSave(SocialCalc.Clipboard.clipboard);
         cliprange = SocialCalc.ParseRange(clipsheet.copiedfrom);
         numcols = Math.max(cr2.col - cr1.col + 1, cliprange.cr2.col - cliprange.cr1.col + 1);
         numrows = Math.max(cr2.row - cr1.row + 1, cliprange.cr2.row - cliprange.cr1.row + 1);
         if (cr1.col+numcols-1 > attribs.lastcol) attribs.lastcol = cr1.col+numcols-1;
         if (cr1.row+numrows-1 > attribs.lastrow) attribs.lastrow = cr1.row+numrows-1;

         for (row = cr1.row; row < cr1.row+numrows; row++) {
            for (col = cr1.col; col < cr1.col+numcols; col++) {
               cr = SocialCalc.crToCoord(col, row);
               cell=sheet.GetAssuredCell(cr);
               if (cell.readonly) continue;
               if (saveundo) changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));
               var currentClipCol = cliprange.cr1.col + ((col-cr1.col) % (cliprange.cr2.col - cliprange.cr1.col + 1));
               var currentClipRow = cliprange.cr1.row + ((row-cr1.row) % (cliprange.cr2.row - cliprange.cr1.row + 1));
               crbase = SocialCalc.crToCoord(currentClipCol, currentClipRow);
               basecell = clipsheet.GetAssuredCell(crbase);

               if (rest == "all" || rest == "formats") {
                  // get source width and hidden attribute and copy to sheet
                  if (row == cr1.row) { // only need 1st row of cols
                     // col attributes
                     sourceColname = SocialCalc.rcColname(cliprange.cr1.col + ((col-cr1.col) % (cliprange.cr2.col - cliprange.cr1.col + 1)));
                     colWidth = clipsheet.colattribs.width[sourceColname];
                     colHide = clipsheet.colattribs.hide[sourceColname];
                     if (colWidth != null) sheet.colattribs.width[SocialCalc.rcColname(col)] = colWidth;
                     if (colHide != null) sheet.colattribs.hide[SocialCalc.rcColname(col)] = colHide;
                  }
                  if (col == cr1.col) {  // only need 1st col or rows
                     // row attributes
                     sourceRow = cliprange.cr1.row + ((row-cr1.row) % (cliprange.cr2.row - cliprange.cr1.row + 1));
                     rowHide = clipsheet.rowattribs.hide[sourceRow];
                     if (rowHide != null) {
                        // if source row is hidden
                        // set dest row hidden
                        sheet.rowattribs.hide[row] = rowHide;
                     }
                  }
                  for (attrib in cellProperties) {
                     if (cellProperties[attrib] == 1) continue; // copy only format attributes
                     if (typeof basecell[attrib] === undefined || cellProperties[attrib] == 3) delete cell[attrib];
                     else {
                        cell[attrib] = basecell[attrib];
                        // attribtable = SocialCalc.CellPropertiesTable[attrib];
                        // if (attribtable && basecell[attrib]) { // table indexes to expand to strings since other sheet may have diff indexes
                        //    cell[attrib] = sheet.MapAttributeToId(attribtable, clipsheet.GetAttributeString(attribtable, basecell[attrib]));
                        // }
                        // else { // these are not table indexes
                        //    cell[attrib] = basecell[attrib];
                        // }
                     }
                  }
               }
               if (rest == "all" || rest == "formulas") {
                  cell.datavalue = basecell.datavalue;
                  cell.datatype = basecell.datatype;
                  cell.valuetype = basecell.valuetype;
                  if (cell.datatype == "f") { // offset relative coords, even in sheet references
                     cell.formula = SocialCalc.OffsetFormulaCoords(basecell.formula, col - currentClipCol, row - currentClipRow);
                  }
                  else {
                     cell.formula = basecell.formula;
                  }
                  delete cell.parseinfo;
                  cell.errors = basecell.errors;
                  if (basecell.comment) { // comments are pasted as part of content, though not filled, etc.
                     cell.comment = basecell.comment;
                  }
                  else if (cell.comment) {
                     delete cell.comment;
                  }
               }
               delete cell.displaystring;
            }
         }

         attribs.needsrecalc = "yes";
         break;

      case "sort": // sort cr1:cr2 col1 up/down col2 up/down col3 up/down
         sheet.renderneeded = true;
         sheet.changedrendervalues = true;
         if (saveundo) changes.AddUndo("changedrendervalues"); // to take care of undone pasted spans
         what = cmd.NextToken();
         ParseRange();
         cols = []; // get columns and sort directions (or "")
         dirs = [];
         lastsortcol = 0;
         for (i=0; i<=3; i++) {
            cols[i] = cmd.NextToken();
            dirs[i] = cmd.NextToken();
            if (cols[i]) lastsortcol = i;
         }

         sortcells = {}; // a copy of the data which will replace the original, but in the new order
         sortlist = []; // an array of 0, 1, ..., nrows-1 needed for sorting
         sortvalues = []; // values to be sorted corresponding to sortlist
         sorttypes = []; // basic types of the values

         for (row = cr1.row; row <= cr2.row; row++) { // fill in the sort info
            for (col = cr1.col; col <= cr2.col; col++) {
               cr = SocialCalc.crToCoord(col, row);
               cell=sheet.cells[cr];
               if (cell) { // only copy non-empty cells
                  sortcells[cr] = sheet.CellToString(cell);
                  if (saveundo) changes.AddUndo("set "+cr+" all", sortcells[cr]);
               }
               else {
                  if (saveundo) changes.AddUndo("set "+cr+" all");
               }
            }
            sortlist.push(sortlist.length);
            sortvalues.push([]);
            sorttypes.push([]);
            slast = sorttypes.length-1;
            for (i = 0; i <= lastsortcol; i++) {
               cr = cols[i] + row; // get cr on this row in sort col
               cell = sheet.GetAssuredCell(cr);
               val = cell.datavalue;
               valtype = cell.valuetype.charAt(0) || "b";
               if (valtype == "t") val = val.toLowerCase();
               sortvalues[slast].push(val);
               sorttypes[slast].push(valtype);
            }
         }

         sortfunction = function(a, b) { // a comparison function that can handle all the type variations
            var i, a1, b1, ta, cresult;
            for (i=0; i<=lastsortcol; i++) {
               if (dirs[i] == "up") { // handle sort direction
                  a1 = a; b1 = b;
               }
               else {
                  a1 = b; b1 = a;
               }
               ta = sorttypes[a1][i];
               tb = sorttypes[b1][i];
               if (ta == "t") { // numbers < text < errors, blank always last no matter what dir
                  if (tb == "t") {
                     a1 = sortvalues[a1][i];
                     b1 = sortvalues[b1][i];
                     cresult = a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                  }
                  else if (tb == "n") {
                     cresult = 1;
                  }
                  else if (tb == "b") {
                     cresult = dirs[i] == "up" ? -1 : 1;
                  }
                  else if (tb == "e") {
                     cresult = -1;
                  }
               }
               else if (ta == "n") {
                  if (tb == "t") {
                     cresult = -1;
                  }
                  else if (tb == "n") {
                     a1 = sortvalues[a1][i]-0; // force to numeric, just in case
                     b1 = sortvalues[b1][i]-0;
                     cresult = a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                  }
                  else if (tb == "b") {
                     cresult = dirs[i] == "up" ? -1 : 1;
                  }
                  else if (tb == "e") {
                     cresult = -1;
                  }
               }
               else if (ta == "e") {
                  if (tb == "e") {
                     a1 = sortvalues[a1][i];
                     b1 = sortvalues[b1][i];
                     cresult = a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                  }
                  else if (tb == "b") {
                     cresult = dirs[i] == "up" ? -1 : 1;
                  }
                  else {
                     cresult = 1;
                  }
               }
               else if (ta == "b") {
                  if (tb == "b") {
                     cresult = 0;
                  }
                  else {
                     cresult = dirs[i] == "up" ? 1 : -1;
                  }
               }
               if (cresult) { // return if tested not equal, otherwise do next column
                  return cresult;
               }
            }
            cresult = a > b ? 1 : (a < b ? -1 : 0); // equal - return position in original to maintain it
            return cresult;
         }

         sortlist.sort(sortfunction);

         for (row = cr1.row; row <= cr2.row; row++) { // copy original rows into sorted positions
            originalrow = sortlist[row-cr1.row]; // relative position where it was in original
            for (col = cr1.col; col <= cr2.col; col++) {
               cr = SocialCalc.crToCoord(col, row);
               sortedcr = SocialCalc.crToCoord(col, originalrow+cr1.row); // original cell to be put in new place
               if (sortcells[sortedcr]) {
                  cell = new SocialCalc.Cell(cr);
                  sheet.CellFromStringParts(cell, sortcells[sortedcr].split(":"), 1);
                  if (cell.datatype == "f") { // offset coord refs, even to ***relative*** coords in other sheets
                     cell.formula = SocialCalc.OffsetFormulaCoords(cell.formula, 0, (row-cr1.row)-originalrow);
                  }
                  sheet.cells[cr] = cell;
               }
               else {
                  delete sheet.cells[cr];
               }
            }
         }

         attribs.needsrecalc = "yes";
         break;

      case "insertcol":
      case "insertrow":
         sheet.renderneeded = true;
         sheet.changedrendervalues = true;
         sheet.widgetsClean = false; //  force widgets to repaint - update cell reference in widget HTML
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         ParseRange();

         if (cmd1 == "insertcol") {
            coloffset = 1;
            colend = cr1.col;
            rowoffset = 0;
            rowend = 1;
            newcolstart = cr1.col;
            newcolend = cr1.col;
            newrowstart = 1;
            newrowend = attribs.lastrow;
            if (saveundo) changes.AddUndo("deletecol "+cr1.coord);
         }
         else {
            coloffset = 0;
            colend = 1;
            rowoffset = 1;
            rowend = cr1.row;
            newcolstart = 1;
            newcolend = attribs.lastcol;
            newrowstart = cr1.row;
            newrowend = cr1.row;
            if (saveundo) changes.AddUndo("deleterow "+cr1.coord);
         }

         for (row=attribs.lastrow; row >= rowend; row--) { // copy the cells forward
            for (col=attribs.lastcol; col >= colend; col--) {
               crbase = SocialCalc.crToCoord(col, row);
               cr = SocialCalc.crToCoord(col+coloffset, row+rowoffset);
               if (!sheet.cells[crbase]) { // copying empty cell
                  delete sheet.cells[cr]; // delete anything that may have been there
               }
               else { // overwrite existing cell with moved contents
                  sheet.cells[cr] = sheet.cells[crbase];
               }
            }
         }

         for (row=newrowstart; row <= newrowend; row++) { // fill the "new" empty cells
            for (col=newcolstart; col <= newcolend; col++) {
               cr = SocialCalc.crToCoord(col, row);
               cell = new SocialCalc.Cell(cr);
               sheet.cells[cr] = cell;
               crbase = SocialCalc.crToCoord(col-coloffset, row-rowoffset); // copy attribs of the one before (0 gives you A or 1)
               basecell = sheet.GetAssuredCell(crbase);
               for (attrib in cellProperties) {
                  if (cellProperties[attrib] == 2) { // copy only format attributes
                     cell[attrib] = basecell[attrib];
                  }
               }
            }
         }

         for (cr in sheet.cells) { // update cell references to moved cells in calculated formulas
             cell = sheet.cells[cr];
             if (cell && cell.datatype == "f") {
                cell.formula = SocialCalc.AdjustFormulaCoords(cell.formula, cr1.col, coloffset, cr1.row, rowoffset);
             }
             if (cell) {
                delete cell.parseinfo;
             }
          }

         for (name in sheet.names) { // update cell references to moved cells in names
            if (sheet.names[name]) { // works with "A1", "A1:A20", and "=formula" forms
               v1 = sheet.names[name].definition;
               v2 = "";
               if (v1.charAt(0) == "=") {
                  v2 = "=";
                  v1 = v1.substring(1);
               }
               sheet.names[name].definition = v2 +
                  SocialCalc.AdjustFormulaCoords(v1, cr1.col, coloffset, cr1.row, rowoffset);
            }
         }

         for (row = attribs.lastrow; row >= rowend && cmd1 == "insertrow"; row--) { // copy the row attributes forward
            rownext = row + rowoffset;
            for (attrib in sheet.rowattribs) {
               val = sheet.rowattribs[attrib][row];
               if (sheet.rowattribs[attrib][rownext] != val) { // make assignment only if different
                  if (val) {
                     sheet.rowattribs[attrib][rownext] = val;
                  }
                  else {
                     delete sheet.rowattribs[attrib][rownext];
                  }
               }
            }
         }

         for (col = attribs.lastcol; col >= colend && cmd1 == "insertcol"; col--) { // copy the column attributes forward
            colthis = SocialCalc.rcColname(col);
            colnext = SocialCalc.rcColname(col + coloffset);
            for (attrib in sheet.colattribs) {
               val = sheet.colattribs[attrib][colthis];
               if (sheet.colattribs[attrib][colnext] != val) { // make assignment only if different
                  if (val) {
                     sheet.colattribs[attrib][colnext] = val;
                  }
                  else {
                     delete sheet.colattribs[attrib][colnext];
                  }
               }
            }
         }

         // Expand merged cells if the new row/col is in between

         var tempRenderContext = new SocialCalc.RenderContext(sheet)
         tempRenderContext.CalculateCellSkipData()

         var cellsToExpand = {} // Keep track of all merge spans we've expanded
                                // so we don't expand one twice
         for (var skipCell in tempRenderContext.cellskip) {
             var skipCellCR = SocialCalc.coordToCr(skipCell)
               , mergerCellCoords = tempRenderContext.cellskip[skipCell]
             // for insertcol we check if the newly inserted col has
             // has any spans. This can only mean, that those cells
             // are part of a row span
             if (cmd1 === "insertcol" && skipCellCR.col === newcolstart) {
                if (!cellsToExpand[mergerCellCoords]) {
                    sheet.GetAssuredCell(mergerCellCoords).colspan += coloffset
                 }
                cellsToExpand[mergerCellCoords] = true
             }
             // for insertrow it's the same method
             if (cmd1 === "insertrow" && skipCellCR.row === newrowstart) {
                if (!cellsToExpand[mergerCellCoords]) {
                    sheet.GetAssuredCell(mergerCellCoords).rowspan += rowoffset
                 }
                cellsToExpand[mergerCellCoords] = true
             }
         }

         attribs.lastcol += coloffset;
         attribs.lastrow += rowoffset;
         attribs.needsrecalc = "yes";
         break;

      case "deletecol":
      case "deleterow":
         sheet.renderneeded = true;
         sheet.changedrendervalues = true;
         sheet.widgetsClean = false; // update cell reference in widget HTML - force widgets to repaint
         what = cmd.NextToken();
         rest = cmd.RestOfString();
         lastcol = attribs.lastcol; // save old values since ParseRange sets...
         lastrow = attribs.lastrow;
         ParseRange();

         if (cmd1 == "deletecol") {
            coloffset = cr1.col - cr2.col - 1;
            rowoffset = 0;
            colstart = cr2.col + 1;
            rowstart = 1;
         }
         else {
            coloffset = 0;
            rowoffset = cr1.row - cr2.row - 1;
            colstart = 1;
            rowstart = cr2.row + 1;
         }

         for (row=rowstart; row <= lastrow - rowoffset; row++) { // check for readonly cells
            for (col=colstart; col <= lastcol - coloffset; col++) {
               cr = SocialCalc.crToCoord(col+coloffset, row+rowoffset);
               cell = sheet.cells[cr];
               if (cell && cell.readonly) {
                    errortext = "Unable to remove " + (cmd1 == "deletecol" ? "column" : "row") + ", because cell " + cell.coord + " is locked";
                    return errortext;
            }
         }
         }

         for (row=rowstart; row <= lastrow - rowoffset; row++) { // copy the cells backwards - extra so no dup of last set
            for (col=colstart; col <= lastcol - coloffset; col++) {
               cr = SocialCalc.crToCoord(col+coloffset, row+rowoffset);
               if (saveundo && (row<rowstart-rowoffset || col<colstart  -coloffset)) { // save cells that are overwritten as undo info
                  cell = sheet.cells[cr];
                  if (!cell) { // empty cell
                     changes.AddUndo("erase "+cr+" all");
                  }
                  else {
                     changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));
                  }
               }
               crbase = SocialCalc.crToCoord(col, row);
               cell = sheet.cells[crbase];
               if (!cell) { // copying empty cell
                  delete sheet.cells[cr]; // delete anything that may have been there
               }
               else { // overwrite existing cell with moved contents
                  sheet.cells[cr] = cell;
               }
            }
         }

         //!!! multiple deletes isn't setting #REF!; need to fix up #REF!'s on undo but only those!

         for (cr in sheet.cells) { // update cell references to moved cells in calculated formulas
             cell = sheet.cells[cr];
             if (cell) {
                if (cell.datatype == "f") {
                   oldformula = cell.formula;
                   cell.formula = SocialCalc.AdjustFormulaCoords(oldformula, cr1.col, coloffset, cr1.row, rowoffset);
                   if (cell.formula != oldformula) {
                      delete cell.parseinfo;
                      if (saveundo && cell.formula.indexOf("#REF!")!=-1) { // save old version only if removed coord
                         oldcr = SocialCalc.coordToCr(cr);
                         changes.AddUndo("set "+SocialCalc.rcColname(oldcr.col-coloffset)+(oldcr.row-rowoffset)+
                                         " formula "+oldformula);
                      }
                   }
                }
                else {
                   delete cell.parseinfo;
                }
             }
          }

         for (name in sheet.names) { // update cell references to moved cells in names
            if (sheet.names[name]) { // works with "A1", "A1:A20", and "=formula" forms
               v1 = sheet.names[name].definition;
               v2 = "";
               if (v1.charAt(0) == "=") {
                  v2 = "=";
                  v1 = v1.substring(1);
               }
               sheet.names[name].definition = v2 +
                  SocialCalc.AdjustFormulaCoords(v1, cr1.col, coloffset, cr1.row, rowoffset);
            }
         }

         for (row = rowstart; row <= lastrow - rowoffset && cmd1 == "deleterow"; row++) { // copy the row attributes backwards
            rowbefore = row + rowoffset;
            for (attrib in sheet.rowattribs) {
               val = sheet.rowattribs[attrib][row];
               if (sheet.rowattribs[attrib][rowbefore] != val) { // make assignment only if different
                  if (saveundo) changes.AddUndo("set "+rowbefore+" "+attrib, sheet.rowattribs[attrib][rowbefore]);
                  if (val) {
                     sheet.rowattribs[attrib][rowbefore] = val;
                  }
                  else {
                     delete sheet.rowattribs[attrib][rowbefore];
                  }
               }
            }
         }

         for (col = colstart; col <= lastcol - coloffset && cmd1 == "deletecol"; col++) { // copy the column attributes backwards
            colthis = SocialCalc.rcColname(col);
            colbefore = SocialCalc.rcColname(col + coloffset);
            for (attrib in sheet.colattribs) {
               val = sheet.colattribs[attrib][colthis];
               if (sheet.colattribs[attrib][colbefore] != val) { // make assignment only if different
                  if (saveundo) changes.AddUndo("set "+colbefore+" "+attrib, sheet.colattribs[attrib][colbefore]);
                  if (val) {
                     sheet.colattribs[attrib][colbefore] = val;
                  }
                  else {
                     delete sheet.colattribs[attrib][colbefore];
                  }
               }
            }
         }

         // Shrink merged cells if the new row/col was in between

         var tempRenderContext = new SocialCalc.RenderContext(sheet)
         tempRenderContext.CalculateCellSkipData()

         var cellsToShrink = {} // Keep track of shrinked cells, so we don't do it twice
         for (var skipCell in tempRenderContext.cellskip) {
             var skipCellCR = SocialCalc.coordToCr(skipCell)
               , mergerCellCoords = tempRenderContext.cellskip[skipCell]
               , mergerCellCR = tempRenderContext.coordToCR[mergerCellCoords]
             // for deletecol we check if the removed col any spans that
             // are from younger cols and shrink those
             if (cmd1 === "deletecol" && skipCellCR.col === colstart+coloffset && mergerCellCR.col < skipCellCR.col) {
                if (!cellsToShrink[mergerCellCoords]) {
                    sheet.GetAssuredCell(mergerCellCoords).colspan += coloffset
                 }
                cellsToShrink[mergerCellCoords] = true
             }
             // for insertrow it's the same method
             if (cmd1 === "deleterow" && skipCellCR.row === rowstart+rowoffset && mergerCellCR.row < skipCellCR.row) {
                if (!cellsToShrink[mergerCellCoords]) {
                    sheet.GetAssuredCell(mergerCellCoords).rowspan += rowoffset
                 }
                cellsToShrink[mergerCellCoords] = true
             }
         }

         if (saveundo) {
            if (cmd1 == "deletecol") {
               for (col=cr1.col; col<=cr2.col; col++) {
                  changes.AddUndo("insertcol "+SocialCalc.rcColname(cr1.col));
               }
            }
            else {
               for (row=cr1.row; row<=cr2.row; row++) {
                  changes.AddUndo("insertrow "+cr1.row);
               }
            }
         }

         if (cmd1 == "deletecol") {
            if (cr1.col <= lastcol) { // shrink sheet unless deleted phantom cols off the end
               if (cr2.col <= lastcol) {
                  attribs.lastcol += coloffset;
               }
               else {
                  attribs.lastcol = cr1.col - 1;
               }
            }
         }
         else {
            if (cr1.row <= lastrow) { // shrink sheet unless deleted phantom rows off the end
               if (cr2.row <= lastrow) {
                  attribs.lastrow += rowoffset;
               }
               else {
                  attribs.lastrow = cr1.row - 1;
               }
            }
         }
         attribs.needsrecalc = "yes";
         break;

      case "movepaste":
      case "moveinsert":

         var movingcells, dest, destcr, inserthoriz, insertvert, pushamount, movedto;

         sheet.renderneeded = true;
         sheet.changedrendervalues = true;
         if (saveundo) changes.AddUndo("changedrendervalues"); // to take care of undone pasted spans
         what = cmd.NextToken();
         dest = cmd.NextToken();
         rest = cmd.RestOfString(); // rest is all/formulas/formats
         if (rest=="") rest = "all";

         ParseRange();

         destcr = SocialCalc.coordToCr(dest);

         coloffset = destcr.col - cr1.col;
         rowoffset = destcr.row - cr1.row;
         numcols = cr2.col - cr1.col + 1;
         numrows = cr2.row - cr1.row + 1;

         // get a copy of moving cells and erase from where they were

         movingcells = {};

         for (row = cr1.row; row <= cr2.row; row++) {
            for (col = cr1.col; col <= cr2.col; col++) {
               cr = SocialCalc.crToCoord(col, row);
               cell=sheet.GetAssuredCell(cr);
               if (cell.readonly) continue;
               if (saveundo) changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));

               if (!sheet.cells[cr]) { // if had nothing
                  continue; // don't save anything
               }
               movingcells[cr] = new SocialCalc.Cell(cr); // create new cell to copy

               for (attrib in cellProperties) { // go through each property
                  if (typeof cell[attrib] === undefined) { // don't copy undefined things and no need to delete
                     continue;
                  }
                  else {
                     movingcells[cr][attrib] = cell[attrib]; // copy for potential moving
                  }
                  if (rest == "all") {
                     delete cell[attrib];
                  }
                  if (rest == "formulas") {
                     if (cellProperties[attrib] == 1 || cellProperties[attrib] == 3) {
                        delete cell[attrib];
                     }
                  }
                  if (rest == "formats") {
                     if (cellProperties[attrib] == 2) {
                        delete cell[attrib];
                     }
                  }
               }
               if (rest == "formulas") { // leave pristene deleted cell
                  cell.datavalue = "";
                  cell.datatype = null;
                  cell.formula = "";
                  cell.valuetype = "b";
               }
               if (rest == "all") { // leave nothing for move all
                  delete sheet.cells[cr];
               }
            }
         }

         // if moveinsert, check destination OK, and calculate pushing parameters

         if (cmd1 == "moveinsert") {
            inserthoriz = false;
            insertvert = false;
            if (rowoffset==0 && (destcr.col < cr1.col || destcr.col > cr2.col)) {
               if (destcr.col < cr1.col) { // moving left
                  pushamount = cr1.col - destcr.col;
                  inserthoriz = -1;
               }
               else {
                  destcr.col -= 1;
                  coloffset = destcr.col - cr2.col;
                  pushamount = destcr.col - cr2.col;
                  inserthoriz = 1;
               }
            }
            else if (coloffset==0 && (destcr.row < cr1.row || destcr.row > cr2.row)) {
               if (destcr.row < cr1.row) { // moving up
                  pushamount = cr1.row - destcr.row;
                  insertvert = -1;
               }
               else {
                  destcr.row -= 1;
                  rowoffset = destcr.row - cr2.row;
                  pushamount = destcr.row - cr2.row;
                  insertvert = 1;
               }
            }
            else {
               cmd1 = "movepaste"; // not allowed right now - ignore
            }
         }

         // push any cells that need pushing

         movedto = {}; // remember what was moved where

         if (insertvert) {
            for (row = 0; row < pushamount; row++) {
               for (col = cr1.col; col <= cr2.col; col++) {
                  if (insertvert < 0) {
                     crbase = SocialCalc.crToCoord(col, destcr.row+pushamount-row-1); // from cell
                     cr = SocialCalc.crToCoord(col, cr2.row-row); // to cell
                  }
                  else {
                     crbase = SocialCalc.crToCoord(col, destcr.row-pushamount+row+1); // from cell
                     cr = SocialCalc.crToCoord(col, cr1.row+row); // to cell
                  }

                  basecell = sheet.GetAssuredCell(crbase);
                  if (saveundo) changes.AddUndo("set "+crbase+" all", sheet.CellToString(basecell));

                  cell = sheet.GetAssuredCell(cr);
                  if (rest == "all" || rest == "formats") {
                     for (attrib in cellProperties) {
                        if (cellProperties[attrib] == 1) continue; // copy only format attributes
                        if (typeof basecell[attrib] === undefined || cellProperties[attrib] == 3) {
                           delete cell[attrib];
                        }
                        else {
                           cell[attrib] = basecell[attrib];
                        }
                     }
                  }
                  if (rest == "all" || rest == "formulas") {
                     cell.datavalue = basecell.datavalue;
                     cell.datatype = basecell.datatype;
                     cell.valuetype = basecell.valuetype;
                     cell.formula = basecell.formula;
                     delete cell.parseinfo;
                     cell.errors = basecell.errors;
                  }
                  delete cell.displaystring;

                  movedto[crbase] = cr; // old crbase is now at cr
               }
            }
         }
         if (inserthoriz) {
            for (col = 0; col < pushamount; col++) {
               for (row = cr1.row; row <= cr2.row; row++) {
                  if (inserthoriz < 0) {
                     crbase = SocialCalc.crToCoord(destcr.col+pushamount-col-1, row);
                     cr = SocialCalc.crToCoord(cr2.col-col, row);
                  }
                  else {
                     crbase = SocialCalc.crToCoord(destcr.col-pushamount+col+1, row);
                     cr = SocialCalc.crToCoord(cr1.col+col, row);
                  }

                  basecell = sheet.GetAssuredCell(crbase);
                  if (saveundo) changes.AddUndo("set "+crbase+" all", sheet.CellToString(basecell));

                  cell = sheet.GetAssuredCell(cr);
                  if (rest == "all" || rest == "formats") {
                     for (attrib in cellProperties) {
                        if (cellProperties[attrib] == 1) continue; // copy only format attributes
                        if (typeof basecell[attrib] === undefined || cellProperties[attrib] == 3) {
                           delete cell[attrib];
                        }
                        else {
                           cell[attrib] = basecell[attrib];
                        }
                     }
                  }
                  if (rest == "all" || rest == "formulas") {
                     cell.datavalue = basecell.datavalue;
                     cell.datatype = basecell.datatype;
                     cell.valuetype = basecell.valuetype;
                     cell.formula = basecell.formula;
                     delete cell.parseinfo;
                     cell.errors = basecell.errors;
                  }
                  delete cell.displaystring;

                  movedto[crbase] = cr; // old crbase is now at cr
               }
            }
         }

         // paste moved cells into new place

         if (destcr.col+numcols-1 > attribs.lastcol) attribs.lastcol = destcr.col+numcols-1;
         if (destcr.row+numrows-1 > attribs.lastrow) attribs.lastrow = destcr.row+numrows-1;

         for (row = cr1.row; row < cr1.row+numrows; row++) {
            for (col = cr1.col; col < cr1.col+numcols; col++) {
               cr = SocialCalc.crToCoord(col+coloffset, row+rowoffset);
               cell=sheet.GetAssuredCell(cr);
               if (cell.readonly) continue;
               if (saveundo) changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));

               crbase = SocialCalc.crToCoord(col, row); // get old cell to move

               movedto[crbase] = cr; // old crbase (moved cell) will now be at cr (destination)

               if (rest == "all" && !movingcells[crbase]) { // moving an empty cell
                  delete sheet.cells[cr]; // make the cell empty
                  continue;
               }

               basecell = movingcells[crbase];
               if (!basecell) basecell = sheet.GetAssuredCell(crbase);

               if (rest == "all" || rest == "formats") {
                  for (attrib in cellProperties) {
                     if (cellProperties[attrib] == 1) continue; // copy only format attributes
                     if (typeof basecell[attrib] === undefined || cellProperties[attrib] == 3) {
                        delete cell[attrib];
                     }
                     else {
                        cell[attrib] = basecell[attrib];
                     }
                  }
               }
               if (rest == "all" || rest == "formulas") {
                  cell.datavalue = basecell.datavalue;
                  cell.datatype = basecell.datatype;
                  cell.valuetype = basecell.valuetype;
                  cell.formula = basecell.formula;
                  delete cell.parseinfo;
                  cell.errors = basecell.errors;
                  if (basecell.comment) { // comments are pasted as part of content, though not filled, etc.
                     cell.comment = basecell.comment;
                  }
                  else if (cell.comment) {
                     delete cell.comment;
                  }
               }
               delete cell.displaystring;
            }
         }

         // do fixups

         for (cr in sheet.cells) { // update cell references to moved cells in calculated formulas
             cell = sheet.cells[cr];
             if (cell) {
                if (cell.datatype == "f") {
                   oldformula = cell.formula;
                   cell.formula = SocialCalc.ReplaceFormulaCoords(oldformula, movedto);
                   if (cell.formula != oldformula) {
                      delete cell.parseinfo;
                      if (saveundo && !movedto[cr]) { // moved cells are already saved for undo
                         changes.AddUndo("set "+cr+" formula "+oldformula);
                      }
                   }
                }
                else {
                   delete cell.parseinfo;
                }
             }
          }

         for (name in sheet.names) { // update cell references to moved cells in names
            if (sheet.names[name]) { // works with "A1", "A1:A20", and "=formula" forms
               v1 = sheet.names[name].definition;
               oldformula = v1;
               v2 = "";
               if (v1.charAt(0) == "=") {
                  v2 = "=";
                  v1 = v1.substring(1);
               }
               sheet.names[name].definition = v2 +
                  SocialCalc.ReplaceFormulaCoords(v1, movedto);
               if (saveundo && sheet.names[name].definition != oldformula) { // save changes
                  changes.AddUndo("name define "+name+" "+oldformula);
               }
            }
         }

         attribs.needsrecalc = "yes";
         break;

      case "name":
         what = cmd.NextToken();
         name = cmd.NextToken();
         rest = cmd.RestOfString();

         name = name.toUpperCase().replace(/[^A-Z0-9_\.]/g, "");
         if (name == "") break; // must have something

         if (what == "define") {
            if (rest == "") break; // must have something
            if (sheet.names[name]) { // already exists
               if (saveundo) changes.AddUndo("name define "+name+" "+sheet.names[name].definition);
               sheet.names[name].definition = rest;
            }
            else { // new
               if (saveundo) changes.AddUndo("name delete "+name);
               sheet.names[name] = {definition: rest, desc: ""};
            }
         }
         else if (what == "desc") {
            if (sheet.names[name]) { // must already exist
               if (saveundo) changes.AddUndo("name desc "+name+" "+sheet.names[name].desc);
               sheet.names[name].desc = rest;
            }
         }
         else if (what == "delete") {
            if (saveundo) {
               if (sheet.names[name].desc) changes.AddUndo("name desc "+name+" "+sheet.names[name].desc);
               changes.AddUndo("name define "+name+" "+sheet.names[name].definition);
            }
            delete sheet.names[name];
         }
         attribs.needsrecalc = "yes";

         break;

      case "recalc":
         attribs.needsrecalc = "yes"; // request recalc
         sheet.recalconce = true; // even if turned off
         break;

      case "redisplay":
         sheet.renderneeded = true;
         break;

      case "changedrendervalues": // needed for undo sometimes
         sheet.changedrendervalues = true;
         break;

      case "pane":

         name = cmd.NextToken().toUpperCase();
         undoNum = 1;
         editor = SocialCalc.GetSpreadsheetControlObject().editor;

         if (name.toUpperCase() === 'ROW') {
            row = parseInt(cmd.NextToken(), 10);

            if (typeof(editor.context.rowpanes[1]) !== 'undefined' && typeof(editor.context.rowpanes[1].first) === 'number') {
             undoNum = editor.context.rowpanes[1].first;
            }
            if (saveundo) changes.AddUndo('pane row ' + undoNum);

            // Handle hidden row.
            while (editor.context.sheetobj.rowattribs.hide[row] == 'yes') {
               row++;
            }

            if ((!row || row<=editor.context.rowpanes[0].first) && editor.context.rowpanes.length>1) { // set to no panes, leaving first pane settings
               editor.context.rowpanes.length = 1;
            } else if (editor.context.rowpanes.length-1 && !editor.timeout) { // has 2 already
               // not waiting for position calc (so positions could be wrong)
               editor.context.SetRowPaneFirstLast(0, editor.context.rowpanes[0].first, row-1);
               editor.context.SetRowPaneFirstLast(1, row, row);
            } else {
               editor.context.SetRowPaneFirstLast(0, editor.context.rowpanes[0].first, row-1);
               editor.context.SetRowPaneFirstLast(1, row, row);
            }

            // remove tracklingine
            if (editor.griddiv) {
               //trackingline-horizon
               trackLine = document.getElementById('trackingline-vertical');
               if (trackLine) {
                  editor.griddiv.removeChild(trackLine);
                  editor.FitToEditTable();
               }
            }

         } else {

            col = parseInt(cmd.NextToken(), 10);

            if (typeof(editor.context.colpanes[1]) !== 'undefined' && typeof(editor.context.colpanes[1].first) === 'number') {
                 undoNum = editor.context.colpanes[1].first;
            }
               if (saveundo) changes.AddUndo('pane col ' + undoNum);

               // Handle hidden column.
               while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col)] == 'yes') {
                 col++;
            }

               if ((!col || col<=editor.context.colpanes[0].first) && editor.context.colpanes.length > 1) { // set to no panes, leaving first pane settings
                 editor.context.colpanes.length = 1;
            } else if (editor.context.colpanes.length-1 && !editor.timeout) { // has 2 already
                 // not waiting for position calc (so positions could be wrong)
                 editor.context.SetColPaneFirstLast(0, editor.context.colpanes[0].first, col-1);
                 editor.context.SetColPaneFirstLast(1, col, col);
            } else {
                 editor.context.SetColPaneFirstLast(0, editor.context.colpanes[0].first, col-1);
                 editor.context.SetColPaneFirstLast(1, col, col);
            }

               // remove tracklingine
               if (editor.griddiv) {
                 trackLine = document.getElementById('trackingline-horizon');
                 if (trackLine) {
                   editor.griddiv.removeChild(trackLine);
                   editor.FitToEditTable();
              }
            }
         }

         sheet.renderneeded = true;

         break;

      case "startcmdextension": // startcmdextension extension rest-of-command
         name = cmd.NextToken();
         cmdextension = sheet.sci.CmdExtensionCallbacks[name];
         if (cmdextension) {
            cmdextension.func(name, cmdextension.data, sheet, cmd, saveundo);
         }
         break;

      case "settimetrigger":
      case "sendemail":
      case "submitform":
        // email/form/timetrigger handled by server, so ignore here
        break;

      default:
         errortext = scc.s_escUnknownCmd+cmdstr;
         break;

   }
}