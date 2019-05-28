
//
// EditorSheetStatusCallback(recalcdata, status, arg, editor)
//
// Called during recalc, executing commands, etc.
//

SocialCalc.EditorSheetStatusCallback = function(recalcdata, status, arg, editor) {

   var f, cell, dcmd;
   var sheetobj = editor.context.sheetobj;

   var signalstatus = function(s) {
      for (f in editor.StatusCallback) {
         if (editor.StatusCallback[f].func) {
            editor.StatusCallback[f].func(editor, s, arg, editor.StatusCallback[f].params);
            }
         }
      }

   switch (status) {

      case "startup":
         break;

      case "cmdstart":
         editor.busy = true;
         sheetobj.celldisplayneeded = "";
         break;

      case "cmdextension":
         break;

      case "cmdend":
         signalstatus(status);

         if (sheetobj.changedrendervalues) {
            editor.context.PrecomputeSheetFontsAndLayouts();
            editor.context.CalculateCellSkipData();
            sheetobj.changedrendervalues = false;
            }

         if (sheetobj.celldisplayneeded && !sheetobj.renderneeded) {
             if (sheetobj.cells[sheetobj.celldisplayneeded] && sheetobj.cells[sheetobj.celldisplayneeded].valuetype != "e#N/A") {
                cr = SocialCalc.coordToCr(sheetobj.celldisplayneeded);
                cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
                editor.ReplaceCell(cell, cr.row, cr.col); // if no value set, wait for recalc and render .
                }
             }
         if (editor.deferredCommands.length) {
            dcmd = editor.deferredCommands.shift();
            editor.EditorScheduleSheetCommands(dcmd.cmdstr, dcmd.saveundo, true);
            return;
            }
         if (sheetobj.attribs.needsrecalc &&
               (sheetobj.attribs.recalc!="off" || sheetobj.recalconce)
               && editor.recalcFunction) {
            editor.FitToEditTable();
            sheetobj.renderneeded = false; // recalc will force a render
            if (sheetobj.recalconce) delete sheetobj.recalconce; // only do once
            editor.recalcFunction(editor);
            }
         else {
            if (sheetobj.renderneeded) {
               editor.FitToEditTable();
               sheetobj.renderneeded = false;
               editor.ScheduleRender(false);
               }
            else {
               editor.SchedulePositionCalculations(); // just in case command changed positions
//               editor.busy = false;
//               signalstatus("cmdendnorender");
               }
            }

         // Handle hidden column.
         if (sheetobj.hiddencolrow == "col") {
            if (editor.ecell !== null) {
               var col = editor.ecell.col;
               while (sheetobj.colattribs.hide[SocialCalc.rcColname(col)] == "yes") {
                  col++;
                  }
               var coord = SocialCalc.crToCoord(col, editor.ecell.row);
               editor.MoveECell(coord);
               sheetobj.hiddencolrow = "";
               }
            }

         // Handle hidden row.
         if (sheetobj.hiddencolrow == "row") {
            if (editor.ecell !== null) {
               var row = editor.ecell.row;
               while (sheetobj.rowattribs.hide[row] == "yes") {
                  row++;
                  }
               var coord = SocialCalc.crToCoord(editor.ecell.col, row);
               editor.MoveECell(coord);
               sheetobj.hiddencolrow = "";
               }
            }

         return;

      case "calcstart":
         editor.busy = true;
         break;

      case "calccheckdone":
      case "calcorder":
      case "calcstep":
      case "calcloading":
      case "calcserverfunc":
         break;

      case "calcfinished":
         signalstatus(status);
         editor.ScheduleRender(false);
         return;

      case "schedrender":
         editor.busy = true; // in case got here without cmd or recalc
         break;

      case "renderdone":
         break;

      case "schedposcalc":
         editor.busy = true; // in case got here without cmd or recalc
         break;

      case "doneposcalc":
          if (editor.deferredEmailCommands.length) {
              signalstatus(status);
              var emailcmd = editor.deferredEmailCommands.shift();
              editor.EditorScheduleSheetCommands(emailcmd.cmdstr, emailcmd.saveundo, true);
              return;
              }


         if (editor.deferredCommands.length) {
            signalstatus(status);
            dcmd = editor.deferredCommands.shift();
            editor.EditorScheduleSheetCommands(dcmd.cmdstr, dcmd.saveundo, true);
            }
         else {
            editor.busy = false;
            signalstatus(status);
            if (editor.state=="start") editor.DisplayCellContents(); // make sure up to date
            }
         return;
      // eddy EditorSheetStatusCallback {
      case "emailing":
      case "confirmemailsent":
        break;
      // } EditorSheetStatusCallback eddy

      default:
       alert("Unknown status: "+status);
         break;

      }

   signalstatus(status);

   return;

   }