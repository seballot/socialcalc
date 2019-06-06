////// TCPS - TableControl Pan Slider methods

//
// TCPSDragFunctionStart(event, draginfo, dobj)
//
// TableControlPaneSlider function for starting drag
//

SocialCalc.TCPSDragFunctionStart = function(event, draginfo, dobj) {

   var control = dobj.functionobj.control;
   var editor = control.editor;
   var scc = SocialCalc.Constants;

   SocialCalc.DragFunctionStart(event, draginfo, dobj);

   $(dobj.element).addClass('dragging');
   var selector = ".tracking-line.";
   selector += dobj.vertical ? 'horizontal' : 'vertical';
   draginfo.trackingline = control.editor.$appContainer.find(selector).clone()[0];
   draginfo.trackingline.style.display = "block";

   if (dobj.vertical) {
      row = SocialCalc.Lookup(draginfo.clientY+dobj.functionobj.control.sliderthickness, editor.rowpositions);
      draginfo.trackingline.style.top = (editor.rowpositions[row] || editor.headposition.top)+"px";

      if (editor.context.rowpanes.length-1) { // has 2 already
         editor.context.SetRowPaneFirstLast(1, editor.context.rowpanes[0].last+1, editor.context.rowpanes[0].last+1);
         editor.FitToEditTable();
         editor.ScheduleRender();
      }
   }
   else {
      col = SocialCalc.Lookup(draginfo.clientX+dobj.functionobj.control.sliderthickness, editor.colpositions);
      draginfo.trackingline.style.top = editor.headposition.top+"px";
      draginfo.trackingline.style.left = (editor.colpositions[col] || editor.headposition.left)+"px";
      if (editor.context.colpanes.length-1) { // has 2 already
         editor.context.SetColPaneFirstLast(1, editor.context.colpanes[0].last+1, editor.context.colpanes[0].last+1);
         editor.FitToEditTable();
         editor.ScheduleRender();
      }
   }

   editor.griddiv.appendChild(draginfo.trackingline);

}

//
// TCPSDragFunctionMove(event, draginfo, dobj)
//

SocialCalc.TCPSDragFunctionMove = function(event, draginfo, dobj) {

   var row, col, max, min;
   var control = dobj.functionobj.control;
   var sliderthickness = control.sliderthickness;
   var editor = control.editor;

   if (dobj.vertical) {
      draginfo.clientY = Math.max(draginfo.clientY, editor.headposition.top - $(control.paneslider).height() - draginfo.offsetY)
      draginfo.clientY = Math.min(draginfo.clientY, control.scrollareasize - draginfo.offsetY)

      row = SocialCalc.Lookup(draginfo.clientY+sliderthickness, editor.rowpositions);
      // Handle hidden row.
      while (editor.context.sheetobj.rowattribs.hide[row] == "yes") row++;

      draginfo.trackingline.style.top = (editor.rowpositions[row] || editor.headposition.top)+"px";
   }
   else {
      draginfo.clientX = Math.max(draginfo.clientX, editor.headposition.left - $(control.paneslider).width() - draginfo.offsetX)
      draginfo.clientX = Math.min(draginfo.clientX, control.scrollareasize - draginfo.offsetX)

      col = SocialCalc.Lookup(draginfo.clientX+sliderthickness, editor.colpositions);
      // Handle hidden column.
      while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col)] == "yes") col++;

      draginfo.trackingline.style.left = (editor.colpositions[col] || editor.headposition.left)+"px";
   }

   SocialCalc.DragFunctionPosition(event, draginfo, dobj);

}

//
// TCPSDragFunctionStop(event, draginfo, dobj)
//

SocialCalc.TCPSDragFunctionStop = function(event, draginfo, dobj) {

   var row, col, max, min, dc;
   var control = dobj.functionobj.control;
   var sliderthickness = control.sliderthickness;
   var editor = control.editor;

   if (dobj.vertical) {
      row = SocialCalc.Lookup(draginfo.clientY+sliderthickness, editor.rowpositions);
      if (row>editor.context.sheetobj.attribs.lastrow) row=editor.context.sheetobj.attribs.lastrow; // can't extend sheet here

      // Handle hidden row.
      while (editor.context.sheetobj.rowattribs.hide[row] == "yes") row++;

     editor.EditorScheduleSheetCommands('pane row ' + row, true, false);
   }
   else {
      col = SocialCalc.Lookup(draginfo.clientX+sliderthickness, editor.colpositions);
      if (col>editor.context.sheetobj.attribs.lastcol) col=editor.context.sheetobj.attribs.lastcol; // can't extend sheet here

      // Handle hidden column.
      while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col)] == "yes") col++;

      editor.EditorScheduleSheetCommands('pane col ' + col, true, false);
   }

   $(dobj.element).removeClass('dragging');
   draginfo.trackingline.style.display = "none";
}