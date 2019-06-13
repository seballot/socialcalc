SocialCalc.CommandFill = function(sheet, saveundo, changes, cmd1, rest, cr1, cr2) {

   sheet.renderneeded = true;
   sheet.changedrendervalues = true;
   if (saveundo) changes.AddUndo("changedrendervalues"); // to take care of undone pasted spans

   var horizontal, inverse;

   if (cmd1 == "fillright") {
      horizontal = true; inverse = false; }
   else if (cmd1 == "fillleft") {
      horizontal = true; inverse = true; }
   else if (cmd1 == "filldown") {
      horizontal = false; inverse = false; }
   else if (cmd1 == "fillup") {
      horizontal = false; inverse = true; }

   var editor = SocialCalc.GetSpreadsheetControlObject().editor;

   var initialRange, finalRange;
   if (horizontal) {
      for(var i = editor.range.top; i <= editor.range.bottom; i++) {
         initialRange = { hasrange: true, top: i, bottom: i, left: editor.range2.left, right: editor.range2.right};
         finalRange   = { hasrange: true, top: i, bottom: i, left: editor.range.left,  right: editor.range.right};
         SocialCalc.CommandFill.Run(initialRange, finalRange, horizontal, inverse, sheet, saveundo, changes, rest, cr1, cr2);
      }
   } else {
      for(var i = editor.range.left; i <= editor.range.right; i++) {
         initialRange = { hasrange: true, top: editor.range2.top, bottom: editor.range2.bottom, left: i, right: i};
         finalRange   = { hasrange: true, top: editor.range.top, bottom: editor.range.bottom, left: i, right: i};
         SocialCalc.CommandFill.Run(initialRange, finalRange, horizontal, inverse, sheet, saveundo, changes, rest, cr1, cr2);
      }
   }

   editor.Range2Remove();
}

SocialCalc.CommandFill.Run = function(initialRange, finalRange, horizontal, inverse, sheet, saveundo, changes, rest, cr1, cr2) {

   var inc, startCol, startRow, endCol, endRow;

   // when selecting multiple cell and filling, we may want to increament the list like
   // selecting "1,2,3" and filling will produce "5,6,7,8..."
   inc = SocialCalc.CommandFill.IncrementAmount(sheet, initialRange, horizontal, inverse);

   if (inverse) {
      startRow = finalRange.bottom; startCol = finalRange.right; endRow = finalRange.top; endCol = finalRange.left; }
   else {
      startRow = finalRange.top; startCol = finalRange.left; endRow = finalRange.bottom; endCol = finalRange.right; }

   row = startRow; col = startCol;

   do {
      if (row < endRow) row++;
      if (row > endRow) row--;
      do {
         if (col < endCol) col++;
         if (col > endCol) col--;

         cr = SocialCalc.crToCoord(col, row);
         cell = sheet.GetAssuredCell(cr);
         if (cell.readonly) continue;
         if (saveundo) changes.AddUndo("set "+cr+" all", sheet.CellToString(cell));

         coloffset = col - startCol;
         rowoffset = row - startRow;
         basecell = sheet.GetAssuredCell(SocialCalc.crToCoord(startCol, startRow));

         if (rest == "all" || rest == "formats") {
            for (attrib in SocialCalc.CellProperties) {
               if (SocialCalc.CellProperties[attrib] == 1) continue; // copy only format attributes
               if (typeof basecell[attrib] === undefined || SocialCalc.CellProperties[attrib] == 3)
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

      } while (col != endCol)
   } while (row != endRow)
}

SocialCalc.CommandFill.IncrementAmount = function(sheet, range, horizontal, inverse) {

   function valid_datatype(type) {
     return type == "v" || type == "c";
   }
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
   return returnval;
}