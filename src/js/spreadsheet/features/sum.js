SocialCalc.SpreadsheetControlDoSum = function() {

   var cmd, cell, row, col, sel, cr, foundvalue;

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var editor = spreadsheet.editor;
   var sheet = editor.context.sheetobj;

   if (editor.range.hasrange) {
      sel = SocialCalc.crToCoord(editor.range.left, editor.range.top)+
         ":"+SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
      cmd = "set "+SocialCalc.crToCoord(editor.range.right, editor.range.bottom+1)+
         " formula sum("+sel+")";
      }
   else {
      row = editor.ecell.row - 1;
      col = editor.ecell.col;
      if (row<=1) {
         cmd = "set "+editor.ecell.coord+" constant e#REF! 0 #REF!";
         }
      else {
         foundvalue = false;
         while (row>0) {
            cr = SocialCalc.crToCoord(col, row);
            cell = sheet.GetAssuredCell(cr);
            if (!cell.datatype || cell.datatype=="t") {
               if (foundvalue) {
                  row++;
                  break;
                  }
               }
            else {
               foundvalue = true;
               }
            row--;
            }
         cmd = "set "+editor.ecell.coord+" formula sum("+
            SocialCalc.crToCoord(col,row)+":"+SocialCalc.crToCoord(col, editor.ecell.row-1)+")";
         }
      }

   editor.EditorScheduleSheetCommands(cmd, true, false);

   }