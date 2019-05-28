//
// SocialCalc.CmdGotFocus(obj)
//
// Sets SocialCalc.Keyboard.passThru: obj should be element with focus or "true"
//

SocialCalc.CmdGotFocus = function(obj) {

   SocialCalc.Keyboard.passThru = obj;

   }


//
// SocialCalc.DoButtonCmd(e, buttoninfo, bobj)
//

SocialCalc.DoButtonCmd = function(e, buttoninfo, bobj) {

   SocialCalc.DoCmd(bobj.element, bobj.functionobj.command);

   }

//
// SocialCalc.DoCmd(obj, which)
//
// xxx
//

SocialCalc.DoCmd = function(obj, which) {
   var combostr, sstr, cl, i, clele, slist, slistele, str, sele, rele, lele, ele, sortrange, nrange, rparts;
   var sheet, cell, color, bgcolor, defaultcolor, defaultbgcolor;

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var editor = spreadsheet.editor;

   switch (which) {
      case "undo":
         spreadsheet.ExecuteCommand("undo", "");
         break;

      case "redo":
         spreadsheet.ExecuteCommand("redo", "");
         break;

      case "fill-rowcolstuff":
      case "fill-text":
         cl = which.substring(5);
         clele = document.getElementById(spreadsheet.idPrefix+cl+"list");
         clele.length = 0;
         for (i=0; i<SocialCalc.SpreadsheetCmdTable[cl].length; i++) {
            clele.options[i] = new Option(SocialCalc.SpreadsheetCmdTable[cl][i].t);
            }
         which = "changed-"+cl; // fall through to changed code

      case "changed-rowcolstuff":
      case "changed-text":
         cl = which.substring(8);
         clele = document.getElementById(spreadsheet.idPrefix+cl+"list");
         slist = SocialCalc.SpreadsheetCmdTable.slists[SocialCalc.SpreadsheetCmdTable[cl][clele.selectedIndex].s]; // get sList for this command
         slistele = document.getElementById(spreadsheet.idPrefix+cl+"slist");
         slistele.length = 0; // reset
         for (i=0; i<(slist.length||0); i++) {
            slistele.options[i] = new Option(slist[i].t, slist[i].s);
            }
         return; // nothing else to do

      case "ok-rowcolstuff":
      case "ok-text":
         cl = which.substring(3);
         clele = document.getElementById(spreadsheet.idPrefix+cl+"list");
         slistele = document.getElementById(spreadsheet.idPrefix+cl+"slist");
         combostr = SocialCalc.SpreadsheetCmdTable[cl][clele.selectedIndex].c;
         sstr = slistele[slistele.selectedIndex].value;
         SocialCalc.SpreadsheetControlExecuteCommand(obj, combostr, sstr);
         break;

      case "ok-setsort":
         lele = document.getElementById(spreadsheet.idPrefix+"sortlist");
         if (lele.selectedIndex==0) {
            if (editor.range.hasrange) {
               spreadsheet.sortrange = SocialCalc.crToCoord(editor.range.left, editor.range.top) + ":" +
                          SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
               }
            else {
               spreadsheet.sortrange = editor.ecell.coord+":"+editor.ecell.coord;
               }
            }
         else {
            var val = lele.options[lele.selectedIndex].value;
            if (val == 'all') {
                var cells = spreadsheet.sheet.cells;
                var min_col = -1, max_col = -1, min_row = -1, max_row = -1;
                for (var cell_id in cells) {
                    var cr = SocialCalc.coordToCr(cell_id);
                    if (min_row == -1 || cr.row < min_row) {
                        min_row = cr.row;
                    }
                    if (min_col == -1 || cr.col < min_col) {
                        min_col = cr.col;
                    }
                    if (max_row == -1 || cr.row > max_row) {
                        max_row = cr.row;
                    }
                    if (max_col == -1 || cr.col > max_col) {
                        max_col = cr.col;
                    }
                }
                spreadsheet.sortrange = SocialCalc.crToCoord(min_col, min_row) + ":" + SocialCalc.crToCoord(max_col, max_row);
                lele.options[lele.selectedIndex].text += " (" + spreadsheet.sortrange + ")";
            } else {
                spreadsheet.sortrange = lele.options[lele.selectedIndex].value;
            }
         }
         ele = document.getElementById(spreadsheet.idPrefix+"sortbutton");
         ele.value = SocialCalc.LocalizeString("Sort ")+spreadsheet.sortrange;
         ele.style.visibility = "visible";
         SocialCalc.LoadColumnChoosers(spreadsheet);
         if (obj && obj.blur) obj.blur();
         SocialCalc.KeyboardFocus();
         return;

      case "dosort":
         if (spreadsheet.sortrange && spreadsheet.sortrange.indexOf(":")==-1) { // sortrange is a named range
            nrange = SocialCalc.Formula.LookupName(spreadsheet.sheet, spreadsheet.sortrange || "");
            if (nrange.type != "range") return;
            rparts = nrange.value.match(/^(.*)\|(.*)\|$/);
            sortrange = rparts[1] + ":" + rparts[2];
            }
         else {
            sortrange = spreadsheet.sortrange;
            }
         if (sortrange == "A1:A1") return;
         str = "sort "+sortrange+" ";
         sele = document.getElementById(spreadsheet.idPrefix+"majorsort");
         rele = document.getElementById(spreadsheet.idPrefix+"majorsortup");
         str += sele.options[sele.selectedIndex].value + (rele.checked ? " up" : " down");
         sele = document.getElementById(spreadsheet.idPrefix+"minorsort");
         if (sele.selectedIndex>0) {
           rele = document.getElementById(spreadsheet.idPrefix+"minorsortup");
           str += " "+sele.options[sele.selectedIndex].value + (rele.checked ? " up" : " down");
           }
         sele = document.getElementById(spreadsheet.idPrefix+"lastsort");
         if (sele.selectedIndex>0) {
           rele = document.getElementById(spreadsheet.idPrefix+"lastsortup");
           str += " "+sele.options[sele.selectedIndex].value + (rele.checked ? " up" : " down");
           }
         spreadsheet.ExecuteCommand(str, "");
         break;

      case "merge":
         combostr = SocialCalc.SpreadsheetCmdLookup[which] || "";
         sstr = SocialCalc.SpreadsheetCmdSLookup[which] || "";
         spreadsheet.ExecuteCommand(combostr, sstr);
         if (editor.range.hasrange) { // set ecell to upper left
            editor.MoveECell(SocialCalc.crToCoord(editor.range.left, editor.range.top));
            editor.RangeRemove();
            }
         break;

      case "movefrom":
         if (editor.range2.hasrange) { // toggle if already there
            spreadsheet.context.cursorsuffix = "";
            editor.Range2Remove();
            spreadsheet.ExecuteCommand("redisplay", "");
            }
         else if (editor.range.hasrange) { // set range2 to range or one cell
            editor.range2.top = editor.range.top;
            editor.range2.right = editor.range.right;
            editor.range2.bottom = editor.range.bottom;
            editor.range2.left = editor.range.left;
            editor.range2.hasrange = true;
            editor.MoveECell(SocialCalc.crToCoord(editor.range.left, editor.range.top));
            }
         else {
            editor.range2.top = editor.ecell.row;
            editor.range2.right = editor.ecell.col;
            editor.range2.bottom = editor.ecell.row;
            editor.range2.left = editor.ecell.col;
            editor.range2.hasrange = true;
            }
         str = editor.range2.hasrange ? "" : "off";
         ele = document.getElementById(spreadsheet.idPrefix+"button_movefrom");
         ele.src=spreadsheet.imagePrefix+"movefrom"+str+".gif";
         ele = document.getElementById(spreadsheet.idPrefix+"button_movepaste");
         ele.src=spreadsheet.imagePrefix+"movepaste"+str+".gif";
         ele = document.getElementById(spreadsheet.idPrefix+"button_moveinsert");
         ele.src=spreadsheet.imagePrefix+"moveinsert"+str+".gif";
         if (editor.range2.hasrange) editor.RangeRemove();
         break;

      case "movepaste":
      case "moveinsert":
         if (editor.range2.hasrange) {
            spreadsheet.context.cursorsuffix = "";
            combostr = which+" "+
               SocialCalc.crToCoord(editor.range2.left, editor.range2.top) + ":" +
               SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom)
               +" "+editor.ecell.coord;
            spreadsheet.ExecuteCommand(combostr, "");
            editor.Range2Remove();
            ele = document.getElementById(spreadsheet.idPrefix+"button_movefrom");
            ele.src=spreadsheet.imagePrefix+"movefromoff.gif";
            ele = document.getElementById(spreadsheet.idPrefix+"button_movepaste");
            ele.src=spreadsheet.imagePrefix+"movepasteoff.gif";
            ele = document.getElementById(spreadsheet.idPrefix+"button_moveinsert");
            ele.src=spreadsheet.imagePrefix+"moveinsertoff.gif";
            }
         break;

      case "swapcolors":
         sheet = spreadsheet.sheet;
         cell = sheet.GetAssuredCell(editor.ecell.coord);
         defaultcolor = sheet.attribs.defaultcolor ? sheet.colors[sheet.attribs.defaultcolor] : "rgb(0,0,0)";
         defaultbgcolor = sheet.attribs.defaultbgcolor ? sheet.colors[sheet.attribs.defaultbgcolor] : "rgb(255,255,255)";
         color = cell.color ? sheet.colors[cell.color] : defaultcolor; // get color
         if (color == defaultbgcolor) color = ""; // going to swap, so if same as background default, use default
         bgcolor = cell.bgcolor ? sheet.colors[cell.bgcolor] : defaultbgcolor;
         if (bgcolor == defaultcolor) bgcolor = ""; // going to swap, so if same as foreground default, use default
         spreadsheet.ExecuteCommand("set %C color "+bgcolor+"%Nset %C bgcolor "+color, "");
         break;

      default:
         combostr = SocialCalc.SpreadsheetCmdLookup[which] || "";
         sstr = SocialCalc.SpreadsheetCmdSLookup[which] || "";
         spreadsheet.ExecuteCommand(combostr, sstr);
         break;
      }

   if (obj && obj.blur) obj.blur();
   SocialCalc.KeyboardFocus();

   }

SocialCalc.SpreadsheetCmdLookup = {
 'copy': 'copy %C all',
 'cut': 'cut %C all',
 'paste': 'paste %C all',
 'pasteformats': 'paste %C formats',
 'lock': 'set %C readonly yes',
 'unlock': 'set %C readonly no',
 'delete': 'erase %C formulas',
 'filldown': 'filldown %C all',
 'fillright': 'fillright %C all',
 'erase': 'erase %C all',
 'borderon': 'set %C bt %S%Nset %C br %S%Nset %C bb %S%Nset %C bl %S',
 'borderoff': 'set %C bt %S%Nset %C br %S%Nset %C bb %S%Nset %C bl %S',
 'merge': 'merge %C',
 'unmerge': 'unmerge %C',
 'align-left': 'set %C cellformat left',
 'align-center': 'set %C cellformat center',
 'align-right': 'set %C cellformat right',
 'align-default': 'set %C cellformat',
 'insertrow': 'insertrow %C',
 'insertcol': 'insertcol %C',
 'deleterow': 'deleterow %C',
 'deletecol': 'deletecol %C',
 'hiderow': 'set %H hide yes',
 'hidecol': 'set %W hide yes',
 'undo': 'undo',
 'redo': 'redo',
 'recalc': 'recalc'
 }

SocialCalc.SpreadsheetCmdSLookup = {
 'borderon': '1px solid rgb(0,0,0)',
 'borderoff': ''
 }


//
// SocialCalc.SpreadsheetControlExecuteCommand(obj, combostr, sstr)
//
// xxx
//

SocialCalc.SpreadsheetControlExecuteCommand = function(obj, combostr, sstr) {

   var i, commands;
   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var eobj = spreadsheet.editor;

   var str = {};
   str.P = "%";
   str.N = "\n"
   if (eobj.range.hasrange) {
      str.R = SocialCalc.crToCoord(eobj.range.left, eobj.range.top)+
             ":"+SocialCalc.crToCoord(eobj.range.right, eobj.range.bottom);
      str.C = str.R;
      str.W = SocialCalc.rcColname(eobj.range.left) + ":" + SocialCalc.rcColname(eobj.range.right);
      str.H = eobj.range.top + ":" + eobj.range.bottom;
      }
   else if (eobj.ecell) {
      str.C = eobj.ecell.coord;
      str.R = eobj.ecell.coord+":"+eobj.ecell.coord;
      str.W = SocialCalc.rcColname(SocialCalc.coordToCr(eobj.ecell.coord).col);
      str.H = SocialCalc.coordToCr(eobj.ecell.coord).row;
      }
   else {
      str.C = 'A1'
      str.R = 'A1:A1'
      str.W = SocialCalc.rcColname(SocialCalc.coordToCr('A1').col);
      str.H = SocialCalc.coordToCr('A1').row;
      }
   str.S = sstr;
   combostr = combostr.replace(/%C/g, str.C);
   combostr = combostr.replace(/%R/g, str.R);
   combostr = combostr.replace(/%N/g, str.N);
   combostr = combostr.replace(/%S/g, str.S);
   combostr = combostr.replace(/%W/g, str.W);
   combostr = combostr.replace(/%H/g, str.H);
   combostr = combostr.replace(/%P/g, str.P);

   eobj.EditorScheduleSheetCommands(combostr, true, false);

   }