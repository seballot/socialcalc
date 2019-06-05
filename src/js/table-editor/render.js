//
// ScheduleRender(editor)
//
// Do a series of timeouts to render the sheet, wait for background layout and
// rendering by the browser, and then update editor visuals, sliders, etc.
//

SocialCalc.ScheduleRender = function(editor) {
   if(editor.ignoreRender == true) return; // formDataViewer is only used for "ExecuteSheetCommand" fumctions - so skip render
   if (editor.timeout) window.clearTimeout(editor.timeout); // in case called more than once, just use latest

   SocialCalc.EditorSheetStatusCallback(null, "schedrender", null, editor);
   editor.timeout = window.setTimeout(function() { SocialCalc.DoRenderStep(editor); }, 1);

}

// DoRenderStep(editor)
//

SocialCalc.DoRenderStep = function(editor) {

   editor.timeout = null;

   editor.EditorRenderSheet();

   SocialCalc.EditorSheetStatusCallback(null, "renderdone", null, editor);

   SocialCalc.EditorSheetStatusCallback(null, "schedposcalc", null, editor);

   editor.timeout = window.setTimeout(function() { SocialCalc.DoPositionCalculations(editor); }, 1);

}

//
// SocialCalc.SchedulePositionCalculations(editor)
//

SocialCalc.SchedulePositionCalculations = function(editor) {

   SocialCalc.EditorSheetStatusCallback(null, "schedposcalc", null, editor);

   editor.timeout = window.setTimeout(function() { SocialCalc.DoPositionCalculations(editor); }, 1);

}

// DoPositionCalculations(editor)
//
// Update editor visuals, sliders, etc.
//
// Note: Only call this after the DOM objects have been modified and rendered!
//

SocialCalc.DoPositionCalculations = function(editor) {

   editor.timeout = null;

   editor.CalculateEditorPositions();
   editor.ComputeTableSize();
   editor.verticaltablecontrol.PositionTableControlElements();
   editor.horizontaltablecontrol.PositionTableControlElements();

   SocialCalc.EditorSheetStatusCallback(null, "doneposcalc", null, editor);

   if (editor.ensureecell && editor.ecell && !editor.deferredCommands.length) { // don't do if deferred cmd to execute
      editor.ensureecell = false;
      editor.EnsureECellVisible(); // this could cause another redisplay
   }

   editor.cellhandles.ShowCellHandles(true);


//!!! Need to now check to see if this positioned controls out of the editing area
//!!! (such as when there is a large wrapped cell and it pushes the pane boundary too far down).

}

SocialCalc.CalculateRowPositions = function(editor, panenum, positions, sizes) {

   var toprow, rowpane, rownum, offset, trowobj, cellposition;

   var context=editor.context;
   var sheetobj=context.sheetobj;

   var tbodyobj;

   // eddy CalculateRowPositions {
//   if (!context.showRCHeaders) throw("Needs showRCHeaders=true");
   if (!context.showRCHeaders) return;
   // } CalculateRowPositions

   tbodyobj=editor.fullgrid.lastChild;

   // Calculate start of this pane as row in this table:

   toprow = 2;
   for (rowpane=0; rowpane<panenum; rowpane++) {
      toprow += context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 2; // skip pane and spacing row
   }

   offset = 0;
   for (rownum=context.rowpanes[rowpane].first; rownum<=context.rowpanes[rowpane].last; rownum++) {
      trowobj = tbodyobj.childNodes[toprow+offset];
      offset++;
      if (!trowobj) { continue; }

      if (!positions[rownum]) {
         positions[rownum] = trowobj.firstChild.offsetTop;
         sizes[rownum] = trowobj.firstChild.offsetHeight;
      }
   }

   return;

}

SocialCalc.CalculateColPositions = function(editor, panenum, positions, sizes) {

   var leftcol, colpane, colnum, offset, trowobj, cellposition;

   var context=editor.context;
   var sheetobj=context.sheetobj;

   var tbodyobj;

   // eddy CalculateColPositions {
   // if (!context.showRCHeaders) throw("Needs showRCHeaders=true");
   if (!context.showRCHeaders) return;
   // } CalculateColPositions

   tbodyobj=editor.fullgrid.lastChild;

   // Calculate start of this pane as column in this table:

   leftcol = 1;
   for (colpane=0; colpane<panenum; colpane++) {
      leftcol += context.colpanes[colpane].last - context.colpanes[colpane].first + 2; // skip pane and spacing col
   }

   trowobj = tbodyobj.childNodes[1]; // get heading row, which has all columns
   offset = 0;
   for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
      cellposition = SocialCalc.GetElementPosition(trowobj.childNodes[leftcol+offset]);
      if (!positions[colnum]) {
         positions[colnum] = cellposition.left; // first one takes precedence
         if (trowobj.childNodes[leftcol+offset]) {
            sizes[colnum] = trowobj.childNodes[leftcol+offset].offsetWidth;
         }
      }
      offset++;
   }

   return;

}