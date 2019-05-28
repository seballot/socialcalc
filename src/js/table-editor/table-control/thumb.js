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

   var rowpane, colpane, row, col;

   var control = dobj.functionobj.control;
   var editor = control.editor;
   var scc = SocialCalc.Constants;

   SocialCalc.DragFunctionStart(event, draginfo, dobj);

   if (draginfo.thumbstatus) { // get rid of old one if mouseup was out of window
      if (draginfo.thumbstatus.rowmsgele) draginfo.thumbstatus.rowmsgele = null;
      if (draginfo.thumbstatus.rowpreviewele) draginfo.thumbstatus.rowpreviewele = null;
      editor.toplevel.removeChild(draginfo.thumbstatus);
      draginfo.thumbstatus = null;
      }

   draginfo.thumbstatus = document.createElement("div");

   if (dobj.vertical) {
      if (scc.TCTDFSthumbstatusvClass) draginfo.thumbstatus.className = scc.TCTDFSthumbstatusvClass;
      SocialCalc.setStyles(draginfo.thumbstatus, scc.TCTDFSthumbstatusvStyle);
      draginfo.thumbstatus.style.top = (draginfo.clientY+scc.TCTDFStopOffsetv)+"px";
      draginfo.thumbstatus.style.left = (control.controlborder-10-(editor.tablewidth/2))+"px";
      draginfo.thumbstatus.style.width = (editor.tablewidth/2)+"px";

      draginfo.thumbcontext = new SocialCalc.RenderContext(editor.context.sheetobj);
      draginfo.thumbcontext.showGrid = true;
      draginfo.thumbcontext.rowpanes = [{first: 1, last: 1}];
      var pane = editor.context.colpanes[editor.context.colpanes.length-1];
      draginfo.thumbcontext.colpanes = [{first: pane.first, last: pane.last}];
      draginfo.thumbstatus.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td valign="top" style="'+
        scc.TCTDFSthumbstatusrownumStyle+'" class="'+scc.TCTDFSthumbstatusrownumClass+
        '"><div>msg</div></td><td valign="top"><div style="overflow:hidden;">preview</div></td></tr></table>';
      draginfo.thumbstatus.rowmsgele = draginfo.thumbstatus.firstChild.firstChild.firstChild.firstChild.firstChild;
      draginfo.thumbstatus.rowpreviewele = draginfo.thumbstatus.firstChild.firstChild.firstChild.childNodes[1].firstChild;
      editor.toplevel.appendChild(draginfo.thumbstatus);
      SocialCalc.TCTDragFunctionRowSetStatus(draginfo, editor, editor.firstscrollingrow || 1);
      }
   else {
      if (scc.TCTDFSthumbstatushClass) draginfo.thumbstatus.className = scc.TCTDFSthumbstatushClass;
      SocialCalc.setStyles(draginfo.thumbstatus, scc.TCTDFSthumbstatushStyle);
      draginfo.thumbstatus.style.top = (control.controlborder+scc.TCTDFStopOffseth)+"px";
      draginfo.thumbstatus.style.left = (draginfo.clientX+scc.TCTDFSleftOffseth)+"px";
      editor.toplevel.appendChild(draginfo.thumbstatus);
      draginfo.thumbstatus.innerHTML = scc.s_TCTDFthumbstatusPrefixh+SocialCalc.rcColname(editor.firstscrollingcol);
      }

   }


//
// SocialCalc.TCTDragFunctionRowSetStatus(draginfo, editor, row)
//
// Render partial row
//

SocialCalc.TCTDragFunctionRowSetStatus = function(draginfo, editor, row) {

   var scc = SocialCalc.Constants;
   var msg = scc.s_TCTDFthumbstatusPrefixv+row+" ";

   draginfo.thumbstatus.rowmsgele.innerHTML = msg;

   draginfo.thumbcontext.rowpanes = [{first: row, last: row}];
   draginfo.thumbrowshown = row;

   var ele = draginfo.thumbcontext.RenderSheet(draginfo.thumbstatus.rowpreviewele.firstChild, {type: "html"});

   }


//
// TCTDragFunctionMove(event, draginfo, dobj)
//

SocialCalc.TCTDragFunctionMove = function(event, draginfo, dobj) {

   var first, msg;
   var control = dobj.functionobj.control;
   var thumbthickness = control.thumbthickness;
   var editor = control.editor;
   var scc = SocialCalc.Constants;

   if (dobj.vertical) {
      if (draginfo.clientY > control.scrollareaend - draginfo.offsetY - control.thumbthickness + 2)
         draginfo.clientY = control.scrollareaend - draginfo.offsetY - control.thumbthickness + 2;
      if (draginfo.clientY < control.scrollareastart - draginfo.offsetY - 1)
         draginfo.clientY = control.scrollareastart - draginfo.offsetY - 1;
      draginfo.thumbstatus.style.top = draginfo.clientY+"px";

      first =
         ((draginfo.clientY+draginfo.offsetY-control.scrollareastart+1)/(control.scrollareasize-control.thumbthickness))
         * (editor.context.sheetobj.attribs.lastrow-editor.lastnonscrollingrow)
         + editor.lastnonscrollingrow + 1;
      first = Math.floor(first);
      if (first <= editor.lastnonscrollingrow) first = editor.lastnonscrollingrow + 1;
      if (first > editor.context.sheetobj.attribs.lastrow) first = editor.context.sheetobj.attribs.lastrow;
//      msg = scc.s_TCTDFthumbstatusPrefixv+first;
      if (first != draginfo.thumbrowshown) {
         SocialCalc.TCTDragFunctionRowSetStatus(draginfo, editor, first);
         }
      }
   else {
      if (draginfo.clientX > control.scrollareaend - draginfo.offsetX - control.thumbthickness + 2)
         draginfo.clientX = control.scrollareaend - draginfo.offsetX - control.thumbthickness + 2;
      if (draginfo.clientX < control.scrollareastart - draginfo.offsetX - 1)
         draginfo.clientX = control.scrollareastart - draginfo.offsetX - 1;
      draginfo.thumbstatus.style.left = draginfo.clientX+"px";

      first =
         ((draginfo.clientX+draginfo.offsetX-control.scrollareastart+1)/(control.scrollareasize-control.thumbthickness))
         * (editor.context.sheetobj.attribs.lastcol-editor.lastnonscrollingcol)
         + editor.lastnonscrollingcol + 1;
      first = Math.floor(first);
      if (first <= editor.lastnonscrollingcol) first = editor.lastnonscrollingcol + 1;
      if (first > editor.context.sheetobj.attribs.lastcol) first = editor.context.sheetobj.attribs.lastcol;
      msg = scc.s_TCTDFthumbstatusPrefixh+SocialCalc.rcColname(first);
      draginfo.thumbstatus.innerHTML = msg;
      }

   SocialCalc.DragFunctionPosition(event, draginfo, dobj);

   }

//
// TCTDragFunctionStop(event, draginfo, dobj)
//

SocialCalc.TCTDragFunctionStop = function(event, draginfo, dobj) {

   var first;
   var control = dobj.functionobj.control;
   var editor = control.editor;

   if (dobj.vertical) {
      first =
         ((draginfo.clientY+draginfo.offsetY-control.scrollareastart+1)/(control.scrollareasize-control.thumbthickness))
         * (editor.context.sheetobj.attribs.lastrow-editor.lastnonscrollingrow)
         + editor.lastnonscrollingrow + 1;
      first = Math.floor(first);
      if (first <= editor.lastnonscrollingrow) first = editor.lastnonscrollingrow + 1;
      if (first > editor.context.sheetobj.attribs.lastrow) first = editor.context.sheetobj.attribs.lastrow;

      editor.context.SetRowPaneFirstLast(editor.context.rowpanes.length-1, first, first+1);
      }
   else {
      first =
         ((draginfo.clientX+draginfo.offsetX-control.scrollareastart+1)/(control.scrollareasize-control.thumbthickness))
         * (editor.context.sheetobj.attribs.lastcol-editor.lastnonscrollingcol)
         + editor.lastnonscrollingcol + 1;
      first = Math.floor(first);
      if (first <= editor.lastnonscrollingcol) first = editor.lastnonscrollingcol + 1;
      if (first > editor.context.sheetobj.attribs.lastcol) first = editor.context.sheetobj.attribs.lastcol;

      editor.context.SetColPaneFirstLast(editor.context.colpanes.length-1, first, first+1);
      }

   editor.FitToEditTable();

   if (draginfo.thumbstatus.rowmsgele) draginfo.thumbstatus.rowmsgele = null;
   if (draginfo.thumbstatus.rowpreviewele) draginfo.thumbstatus.rowpreviewele = null;
   editor.toplevel.removeChild(draginfo.thumbstatus);
   draginfo.thumbstatus = null;

   editor.ScheduleRender();

   }