//
// cellcoord = MoveECellWithKey(editor, ch)
//
// Processes an arrow key, etc., moving the edit cell.
// If not a movement key, returns null.
//

SocialCalc.MoveECellWithKey = function(editor, ch) {

   var coord, row, col, cell;
   var shifted = false;
   var delta = 1;

   if (!editor.ecell) {
      return null;
   }

   if (ch.slice(-7)=="shifted") {
      ch = ch.slice(0,-7);
      shifted = true;
   }

   row = editor.ecell.row;
   col = editor.ecell.col;
   cell = editor.context.sheetobj.cells[editor.ecell.coord];

   switch (ch) {
      case "[adown]":
         row += (cell && cell.rowspan) || 1;
         break;
      case "[aup]":
         row--;
         delta = -1;
         break;
      case "[pgdn]":
         row += editor.pageUpDnAmount - 1 + ((cell && cell.rowspan) || 1);
         break;
      case "[pgup]":
         row -= editor.pageUpDnAmount;
         delta = -1;
         break;
      case "[aright]":
         col += (cell && cell.colspan) || 1;
         break;
      case "[aleft]":
         col--;
         delta = -1;
         break;
      case "[home]":
         row = 1;
         col = 1;
         break;
      default:
         return null;
   }

   // Adjust against usermax col and row.
   if (editor.context.sheetobj.attribs.usermaxcol) col = Math.min(editor.context.sheetobj.attribs.usermaxcol, col);
   if (editor.context.sheetobj.attribs.usermaxrow) row = Math.min(editor.context.sheetobj.attribs.usermaxrow, row);

   // Handle hidden column.
   while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col)] == "yes") {
      col += delta;
      if (col < 1) {
         delta = -delta;
         col = 1;
      }
   }

   // Handle hidden row.
   while (editor.context.sheetobj.rowattribs.hide[row] == "yes") {
      row += delta;
      if (row < 1) {
         delta = -delta;
         row = 1;
      }
   }

   if (!editor.range.hasrange) {
      if (shifted)
         editor.RangeAnchor();
   }

   coord = editor.MoveECell(SocialCalc.crToCoord(col, row));

   if (editor.range.hasrange) {
      if (shifted)
         editor.RangeExtend();
      else
         editor.RangeRemove();
   }

   return coord;

}

//
// cellcoord = MoveECell(editor, newecell)
//
// Takes a coordinate and returns the new edit cell coordinate (which may be
// different if newecell is covered by a span).
//

SocialCalc.MoveECell = function(editor, newcell, ensureVisible) {

   var cell, f;
   if (typeof(ensureVisible)==='undefined') ensureVisible = true;
   var highlights = editor.context.highlights;

   // adjust against user max col/row
   var ecell = SocialCalc.coordToCr(newcell);
   if (editor.context.sheetobj.attribs.usermaxcol && ecell.col > editor.context.sheetobj.attribs.usermaxcol)
      ecell.col = editor.context.sheetobj.attribs.usermaxcol;
   if (editor.context.sheetobj.attribs.usermaxrow && ecell.row > editor.context.sheetobj.attribs.usermaxrow)
      ecell.row = editor.context.sheetobj.attribs.usermaxrow;
   newcell = SocialCalc.crToCoord(ecell.col, ecell.row);

   if (editor.ecell) {
      if (editor.ecell.coord==newcell) return newcell; // already there - don't do anything and don't tell anybody
      cell=SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);
      delete highlights[editor.ecell.coord];
      if (editor.range2.hasrange &&
        editor.ecell.row>=editor.range2.top && editor.ecell.row<=editor.range2.bottom &&
        editor.ecell.col>=editor.range2.left && editor.ecell.col<=editor.range2.right) {
         highlights[editor.ecell.coord] = "range2";
      }
      editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
      editor.SetECellHeaders(""); // set to regular col/rowname styles
      if(editor.cellhandles) editor.cellhandles.ShowCellHandles(false); // only if row/col visible
   }
   newcell = editor.context.cellskip[newcell] || newcell;
   editor.ecell = SocialCalc.coordToCr(newcell);
   editor.ecell.coord = newcell;
   cell = SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);

   ecell = editor.context.sheetobj.GetAssuredCell(editor.ecell.coord);
   SocialCalc.UpdateToolBarStateFromCell(ecell);

   highlights[newcell] = "cursor";

   for (f in editor.MoveECellCallback) { // let others know
      editor.MoveECellCallback[f](editor);
   }

   editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
   editor.SetECellHeaders("selected");

   for (f in editor.StatusCallback) { // let status line, etc., know
      editor.StatusCallback[f].func(editor, "moveecell", newcell, editor.StatusCallback[f].params);
   }

   if (editor.busy || !ensureVisible) {
      editor.ensureecell = true; // wait for when not busy
   }
   else {
      editor.ensureecell = false;
      editor.EnsureECellVisible();
   }
   editor.cellhandles.ShowCellHandles(true);

   return newcell;
}