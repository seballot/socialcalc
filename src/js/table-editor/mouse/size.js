SocialCalc.ProcessEditorColsizeMouseDown = function(e, ele, result) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;

   mouseinfo.mouseresizecolnum = result.coltoresize; // remember col being resized
   mouseinfo.colLeftPosition = editor.colpositions[result.coltoresize];
   mouseinfo.mousecoltounhide = result.coltounhide;

   if (result.coltoresize) {
      mouseinfo.mouseresizedisplay = $(editor.toplevel).find('.tracking-box-resize.vertical');
      mouseinfo.mouseresizedisplay.css('left', mouseinfo.colLeftPosition + 'px');
      mouseinfo.mouseresizedisplay.css('right', $(editor.toplevel).width() - clientX + 'px');
      mouseinfo.mouseresizedisplay.show();
   }
    SocialCalc.SetMouseMoveUp( SocialCalc.ProcessEditorColsizeMouseMove,
             SocialCalc.ProcessEditorColsizeMouseUp,
             editor.toplevel,
             event);
   return;
}


SocialCalc.ProcessEditorColsizeMouseMove = function(e) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore

   if (mouseinfo.mouseresizecolnum) {
      var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
      var clientX = event.clientX - pos.left;

      clientX = Math.max(clientX, mouseinfo.colLeftPosition + SocialCalc.Constants.defaultMinimumColWidth)
      clientX = Math.min(clientX, $(editor.toplevel).width())
      mouseinfo.mouseresizedisplay.css('right', $(editor.toplevel).width() - clientX + 'px');
   }
   SocialCalc.StopPropagation(event);
   return;
}


SocialCalc.ProcessEditorColsizeMouseUp = function(e) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore
   element = mouseinfo.element;
   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   SocialCalc.RemoveMouseMoveUp(
       SocialCalc.ProcessEditorColsizeMouseMove,
       SocialCalc.ProcessEditorColsizeMouseUp,
       editor.toplevel,
       event);

   if (mouseinfo.mousecoltounhide) {
      editor.EditorScheduleSheetCommands("set "+SocialCalc.rcColname(mouseinfo.mousecoltounhide)+" hide", true, false);
      /*
      if (editor.ecell && editor.ecell.col == mouseinfo.mousecoltounhide+1) {
         editor.MoveECell(SocialCalc.crToCoord(mouseinfo.mousecoltounhide, editor.ecell.row));
      }*/
   }
   else if (mouseinfo.mouseresizecolnum) {
      var newsize = clientX - mouseinfo.colLeftPosition;
      editor.EditorScheduleSheetCommands("set "+SocialCalc.rcColname(mouseinfo.mouseresizecolnum)+" width "+newsize, true, false);

      if (editor.timeout) window.clearTimeout(editor.timeout);
      editor.timeout = window.setTimeout(SocialCalc.FinishColRowSize, 1); // wait - Firefox 2 has a bug otherwise with next mousedown
   }

   return false;

}


SocialCalc.FinishColRowSize = function() {

   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   if (!editor) return;

   mouseinfo.mouseresizedisplay.hide();
   mouseinfo.mouseresizedisplay = null;

   // editor.FitToEditTable();
   // editor.EditorRenderSheet();
   // editor.SchedulePositionCalculations();

   mouseinfo.editor = null;

   return;
}

SocialCalc.ProcessEditorRowsizeMouseDown = function(e, ele, result) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   var clientY = event.clientY - $(editor.toplevel).offset().top;

   mouseinfo.mouseresizerownum = result.rowtoresize; // remember col being resized
   mouseinfo.rowTopPosition = editor.rowpositions[result.rowtoresize];
   mouseinfo.mouserowtounhide = result.rowtounhide;
   if (result.rowtoresize) {
      mouseinfo.mouseresizedisplay = $(editor.toplevel).find('.tracking-box-resize.horizontal');
      mouseinfo.mouseresizedisplay.css('top', mouseinfo.rowTopPosition + 'px');
      mouseinfo.mouseresizedisplay.css('bottom', $(editor.toplevel).height() - clientY + 3 + 'px');
      mouseinfo.mouseresizedisplay.show();
   }
   SocialCalc.SetMouseMoveUp(SocialCalc.ProcessEditorRowsizeMouseMove,
            SocialCalc.ProcessEditorRowsizeMouseUp,
            editor.toplevel,
            event);
   return;
}


SocialCalc.ProcessEditorRowsizeMouseMove = function(e) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore

   if (mouseinfo.mouseresizerownum) {
      var clientY = event.clientY - $(editor.toplevel).offset().top;
      clientY = Math.max(clientY, mouseinfo.rowTopPosition + SocialCalc.Constants.defaultAssumedRowHeight + 2)
      clientY = Math.min(clientY, $(editor.toplevel).height())
      mouseinfo.mouseresizedisplay.css('bottom', $(editor.toplevel).height() - clientY + 'px');
   }

   SocialCalc.StopPropagation(event);
   return;

}


SocialCalc.ProcessEditorRowsizeMouseUp = function(e) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore
   element = mouseinfo.element;
   var clientY = event.clientY - $(editor.toplevel).offset().top;
   SocialCalc.RemoveMouseMoveUp(
       SocialCalc.ProcessEditorRowsizeMouseMove,
       SocialCalc.ProcessEditorRowsizeMouseUp,
       editor.toplevel,
       event);
   if (mouseinfo.mouserowtounhide) {
      editor.EditorScheduleSheetCommands("set "+mouseinfo.mouserowtounhide+" hide", true, false);
   }
   else if (mouseinfo.mouseresizerownum) {
      var newsize = clientY - mouseinfo.rowTopPosition;
      editor.EditorScheduleSheetCommands("set "+ mouseinfo.mouseresizerownum+" height "+newsize, true, false);

      if (editor.timeout) window.clearTimeout(editor.timeout);
      editor.timeout = window.setTimeout(SocialCalc.FinishColRowSize, 1); // wait - Firefox 2 has a bug otherwise with next mousedown
   }

   return false;

}