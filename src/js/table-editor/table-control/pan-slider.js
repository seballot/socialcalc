////// TCPS - TableControl Pan Slider methods

//
// TCPSDragFunctionStart(event, draginfo, dobj)
//
// TableControlPaneSlider function for starting drag
//

SocialCalc.TCPSDragFunctionStart = function(event, draginfo, dobj) {

   var editor = dobj.functionobj.control.editor;
   var scc = SocialCalc.Constants;

   SocialCalc.DragFunctionStart(event, draginfo, dobj);

   draginfo.trackingline = document.createElement("div");
   draginfo.trackingline.style.height = dobj.vertical ? scc.TCPStrackinglineThickness :
      (editor.tableheight-(editor.headposition.top-editor.gridposition.top))+"px";
   draginfo.trackingline.style.width = dobj.vertical ?
      (editor.tablewidth-(editor.headposition.left-editor.gridposition.left))+"px" : scc.TCPStrackinglineThickness;
   // draginfo.trackingline.style.backgroundImage="url("+editor.imageprefix+"trackingline-"+(dobj.vertical?"v":"h")+".gif)";;
   draginfo.trackingline.style.backgroundColor = "grey";
   if (scc.TCPStrackinglineClass) draginfo.trackingline.className = scc.TCPStrackinglineClass;
   SocialCalc.setStyles(draginfo.trackingline, scc.TCPStrackinglineStyle);

   if (dobj.vertical) {
      row = SocialCalc.Lookup(draginfo.clientY+dobj.functionobj.control.sliderthickness, editor.rowpositions);
      draginfo.trackingline.style.top = (editor.rowpositions[row] || editor.headposition.top)+"px";
      draginfo.trackingline.style.left = editor.headposition.left+"px";
      draginfo.trackingline.id = 'trackingline-vertical';
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
      draginfo.trackingline.id = 'trackingline-horizon';
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
      max = control.morebuttonstart - control.minscrollingpanesize - draginfo.offsetY; // restrict movement
      if (draginfo.clientY > max) draginfo.clientY = max;
      min = editor.headposition.top - sliderthickness - draginfo.offsetY;
      if (draginfo.clientY < min) draginfo.clientY = min;

      row = SocialCalc.Lookup(draginfo.clientY+sliderthickness, editor.rowpositions);

      // Handle hidden row.
      while (editor.context.sheetobj.rowattribs.hide[row] == "yes") {
         row++;
         }

      draginfo.trackingline.style.top = (editor.rowpositions[row] || editor.headposition.top)+"px";
      }
   else {
      max = control.morebuttonstart - control.minscrollingpanesize - draginfo.offsetX;
      if (draginfo.clientX > max) draginfo.clientX = max;
      min = editor.headposition.left - sliderthickness - draginfo.offsetX;
      if (draginfo.clientX < min) draginfo.clientX = min;

      col = SocialCalc.Lookup(draginfo.clientX+sliderthickness, editor.colpositions);

      // Handle hidden column.
      while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col)] == "yes") {
         col++;
         }

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
     max = control.morebuttonstart - control.minscrollingpanesize - draginfo.offsetY; // restrict movement
     if (draginfo.clientY > max) draginfo.clientY = max;
     min = editor.headposition.top - sliderthickness - draginfo.offsetY;
     if (draginfo.clientY < min) draginfo.clientY = min;

     row = SocialCalc.Lookup(draginfo.clientY+sliderthickness, editor.rowpositions);
     if (row>editor.context.sheetobj.attribs.lastrow) row=editor.context.sheetobj.attribs.lastrow; // can't extend sheet here

     // Handle hidden row.
     while (editor.context.sheetobj.rowattribs.hide[row] == "yes") {
       row++;
     }


     editor.EditorScheduleSheetCommands('pane row ' + row, true, false);
   }
   else {
     max = control.morebuttonstart - control.minscrollingpanesize - draginfo.offsetX;
     if (draginfo.clientX > max) draginfo.clientX = max;
     min = editor.headposition.left - sliderthickness - draginfo.offsetX;
     if (draginfo.clientX < min) draginfo.clientX = min;

     col = SocialCalc.Lookup(draginfo.clientX+sliderthickness, editor.colpositions);
     if (col>editor.context.sheetobj.attribs.lastcol) col=editor.context.sheetobj.attribs.lastcol; // can't extend sheet here

     // Handle hidden column.
     while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col)] == "yes") {
       col++;
     }

     editor.EditorScheduleSheetCommands('pane col ' + col, true, false);
   }

   }