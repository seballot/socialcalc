///// TCT - TableControl Thumb methods

//!!!! Note: Need to make start use same code as move/stop for determining row/col, since stop will set that
//!!!! Note: Need to make start/move/stop use positioning code that corresponds closer to
//!!!!       ComputeTableControlPositions calculations.

//
// TCTDragFunctionStart(event, draginfo, dobj)
//
// TableControlThumb function for starting drag
//

SocialCalc.TCTDragFunctionStart = function(event, draginfo, dobj) {
   SocialCalc.DragFunctionStart(event, draginfo, dobj);
   $(dobj.element).addClass("dragging");
}

//
// TCTDragFunctionMove(event, draginfo, dobj)
//
SocialCalc.TCTDragFunctionMove = function(event, draginfo, dobj) {

   var control = dobj.functionobj.control;
   var editor = control.editor;
   editor.cellhandles.ShowCellHandles(false, false, false);

   // keep the thumb inside scroll area
   if (dobj.vertical) {
      draginfo.clientY = Math.max(draginfo.clientY, - draginfo.offsetY)
      draginfo.clientY = Math.min(draginfo.clientY, control.scrollareasize - draginfo.offsetY - control.thumbthickness)
   }
   else {
      draginfo.clientX = Math.max(draginfo.clientX, - draginfo.offsetX)
      draginfo.clientX = Math.min(draginfo.clientX, control.scrollareasize - draginfo.offsetX - control.thumbthickness)
   }

   // make the thumb follow the mouse
   SocialCalc.DragFunctionPosition(event, draginfo, dobj);

   var first; // first visible row/col

   editor.ComputeTableSize();

   // Get first visible row depending on thumb position
   // This calculation must be the same than in table-control.js PositionTableControlElements
   if (dobj.vertical) {

      var thumbpos = draginfo.clientY+draginfo.offsetY;
      var maxHeightPx = control.scrollareasize - control.thumbthickness;
      var pourcentHeight = thumbpos / maxHeightPx;
      pourcentHeight = Math.max(Math.min(pourcentHeight, 1),0)
      var tableVisibleScrollableHeight = editor.tableheight - editor.firstscrollingrowtop;
      var firstVisibleRowHeightToTopScrollableContainer = pourcentHeight * (editor.tableFullScrollableHeight - tableVisibleScrollableHeight);

      var heightToTop = 0, i = 1;
      while(heightToTop <= firstVisibleRowHeightToTopScrollableContainer) {
         heightToTop += editor.rowheight[i];
         i++;
      }
      first = i - 1;
      if (first <= editor.lastnonscrollingrow) first = editor.lastnonscrollingrow + 1;
      if (first > editor.context.sheetobj.attribs.lastrow) first = editor.context.sheetobj.attribs.lastrow;
      editor.context.SetRowPaneFirstLast(editor.context.rowpanes.length-1, first, first+1);
   }
   else {
      var thumbpos = draginfo.clientX+draginfo.offsetX;
      var maxWidthPx = control.scrollareasize - control.thumbthickness;
      var pourcentWidth = thumbpos / maxWidthPx;

      var tableVisibleScrollableWidth = editor.tablewidth - editor.firstscrollingcolleft;
      var firstVisibleColWidthLeftScrollableContainer = pourcentWidth * (editor.tableFullScrollableWidth - tableVisibleScrollableWidth);

      var widthToLeft = 0, i = 1;
      while(widthToLeft <= firstVisibleColWidthLeftScrollableContainer) {
         widthToLeft += editor.colwidth[i];
         i++;
      }
      first = i - 1;

      if (first <= editor.lastnonscrollingcol) first = editor.lastnonscrollingcol + 1;
      if (first > editor.context.sheetobj.attribs.lastcol) first = editor.context.sheetobj.attribs.lastcol;

      editor.context.SetColPaneFirstLast(editor.context.colpanes.length-1, first, first+1);
   }

   // while we are dragging, we prevent updating the thumb position
   control.preventRenderScrollBar = true;

   editor.FitToEditTable();
   editor.ScheduleRender();
}
//
// TCTDragFunctionStop(event, draginfo, dobj)
//

SocialCalc.TCTDragFunctionStop = function(event, draginfo, dobj) {
   // nothing to do cause we are rendering while moving
   dobj.functionobj.control.preventRenderScrollBar = false;
      $(dobj.element).removeClass("dragging");

}