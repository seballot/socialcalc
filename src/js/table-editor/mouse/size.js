SocialCalc.ProcessEditorColsizeMouseDown = function(e, ele, result) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;

   mouseinfo.mouseresizecolnum = result.coltoresize; // remember col being resized
   mouseinfo.mouseresizecol = SocialCalc.rcColname(result.coltoresize);
   mouseinfo.mousedownclientx = clientX;
   mouseinfo.mousecoltounhide = result.coltounhide;

   if (result.coltoresize) {
      var sizedisplay = document.createElement("div");
      mouseinfo.mouseresizedisplay = sizedisplay;
      sizedisplay.style.width = "auto";
      sizedisplay.style.position = "absolute";
      sizedisplay.style.zIndex = 100;
      sizedisplay.style.top = editor.headposition.top+"px";
      sizedisplay.style.left = editor.colpositions[result.coltoresize]+"px";
      sizedisplay.innerHTML = '<table cellpadding="0" cellspacing="0"><tr><td style="height:100px;'+
        'border:1px dashed black;background-color:white;width:' +
        (editor.context.colwidth[mouseinfo.mouseresizecolnum]-2) + 'px;">&nbsp;</td>'+
        '<td><div style="font-size:small;color:white;background-color:gray;padding:4px;">'+
        editor.context.colwidth[mouseinfo.mouseresizecolnum] + '</div></td></tr></table>';
      SocialCalc.setStyles(sizedisplay.firstChild.lastChild.firstChild.childNodes[0], "filter:alpha(opacity=85);opacity:.85;"); // so no warning msg with Firefox about filter

      editor.toplevel.appendChild(sizedisplay);
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

      var newsize = (editor.context.colwidth[mouseinfo.mouseresizecolnum]-0) + (clientX - mouseinfo.mousedownclientx);
      if (newsize < SocialCalc.Constants.defaultMinimumColWidth) newsize = SocialCalc.Constants.defaultMinimumColWidth;

      var sizedisplay = mouseinfo.mouseresizedisplay;
//      sizedisplay.firstChild.lastChild.firstChild.childNodes[1].firstChild.innerHTML = newsize+"";
//      sizedisplay.firstChild.lastChild.firstChild.childNodes[0].firstChild.style.width = (newsize-2)+"px";
      sizedisplay.innerHTML = '<table cellpadding="0" cellspacing="0"><tr><td style="height:100px;'+
          'border:1px dashed black;background-color:white;width:' + (newsize-2) + 'px;">&nbsp;</td>'+
          '<td><div style="font-size:small;color:white;background-color:gray;padding:4px;">'+
          newsize + '</div></td></tr></table>';
      SocialCalc.setStyles(sizedisplay.firstChild.lastChild.firstChild.childNodes[0], "filter:alpha(opacity=85);opacity:.85;"); // so no warning msg with Firefox about filter
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
      var newsize = (editor.context.colwidth[mouseinfo.mouseresizecolnum]-0) + (clientX - mouseinfo.mousedownclientx);
      if (newsize < SocialCalc.Constants.defaultMinimumColWidth) newsize = SocialCalc.Constants.defaultMinimumColWidth;

      editor.EditorScheduleSheetCommands("set "+mouseinfo.mouseresizecol+" width "+newsize, true, false);

      if (editor.timeout) window.clearTimeout(editor.timeout);
      editor.timeout = window.setTimeout(SocialCalc.FinishColRowSize, 1); // wait - Firefox 2 has a bug otherwise with next mousedown
      }

   return false;

   }


SocialCalc.FinishColRowSize = function() {

   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   if (!editor) return;

   editor.toplevel.removeChild(mouseinfo.mouseresizedisplay);
   mouseinfo.mouseresizedisplay = null;

//   editor.FitToEditTable();
//   editor.EditorRenderSheet();
//   editor.SchedulePositionCalculations();

   mouseinfo.editor = null;

   return;

   }

SocialCalc.ProcessEditorRowsizeMouseDown = function(e, ele, result) {

   var event = e || window.event;
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   var pos = SocialCalc.GetSpreadsheetControlObject().spreadsheetDiv.firstChild.offsetHeight;
   var clientY = event.clientY - pos;

   mouseinfo.mouseresizerownum = result.rowtoresize; // remember col being resized
   mouseinfo.mouseresizerow = result.rowtoresize;
   mouseinfo.mousedownclienty = clientY;
   mouseinfo.mouserowtounhide = result.rowtounhide;

  if (result.rowtoresize) {
    var sizedisplay = document.createElement("div");
    mouseinfo.mouseresizedisplay = sizedisplay;
    sizedisplay.style.width = editor.context.totalwidth+"px";
    sizedisplay.style.height = editor.rowpositions[result.rowtoresize]+"px";
    sizedisplay.style.position = "absolute";
    sizedisplay.style.zIndex = 100;
    sizedisplay.style.top = editor.rowpositions[result.rowtoresize]+"px";
    sizedisplay.style.left = editor.headposition.left+"px";
    sizedisplay.innerHTML = '<table cellpadding="0" cellspacing="0"><tr><td style="width:100px' +
      'border:1px dashed black;background-color:white;height:' +
      (editor.context.rowheight[mouseinfo.mouseresizerownum]-2) + 'px;">&nbsp;</td>'+
      '<td><div style="font-size:small;color:white;background-color:gray;padding:4px;">'+
      editor.context.rowheight[mouseinfo.mouseresizerownum] + '</div></td></tr></table>';
    SocialCalc.setStyles(sizedisplay.firstChild.lastChild.firstChild.childNodes[0], "filter:alpha(opacity=85);opacity:.5;"); // so no warning msg with Firefox about filter

    editor.toplevel.appendChild(sizedisplay);
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
    var pos = SocialCalc.GetSpreadsheetControlObject().spreadsheetDiv.firstChild.offsetHeight;
    var clientY = event.clientY - pos;

    var newsize = (editor.context.rowheight[mouseinfo.mouseresizerownum]-0) + (clientY - mouseinfo.mousedownclienty);
    if (newsize < SocialCalc.Constants.defaultAssumedRowHeight) newsize = SocialCalc.Constants.defaultAssumedRowHeight;

    var sizedisplay = mouseinfo.mouseresizedisplay;
    sizedisplay.innerHTML = '<table cellpadding="0" cellspacing="0"><tr><td style="width:100px;'+
      'border:1px dashed black;background-color:white;height:' + (newsize-2) + 'px;">&nbsp;</td>'+
      '<td><div style="font-size:small;color:white;background-color:gray;padding:4px;">'+
      newsize + '</div></td></tr></table>';
    SocialCalc.setStyles(sizedisplay.firstChild.lastChild.firstChild.childNodes[0], "filter:alpha(opacity=85);opacity:.5;"); // so no warning msg with Firefox about filter
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
   var pos = SocialCalc.GetSpreadsheetControlObject().spreadsheetDiv.firstChild.offsetHeight;
   var clientY = event.clientY - pos;
   SocialCalc.RemoveMouseMoveUp(
       SocialCalc.ProcessEditorRowsizeMouseMove,
       SocialCalc.ProcessEditorRowsizeMouseUp,
       editor.toplevel,
       event);
   if (mouseinfo.mouserowtounhide) {
      editor.EditorScheduleSheetCommands("set "+mouseinfo.mouserowtounhide+" hide", true, false);
      }
   else if (mouseinfo.mouseresizerownum) {
     var newsize = (editor.context.rowheight[mouseinfo.mouseresizerownum]-0) + (clientY - mouseinfo.mousedownclienty);
     if (newsize < SocialCalc.Constants.defaultAssumedRowHeight) newsize = SocialCalc.Constants.defaultAssumedRowHeight;
     editor.EditorScheduleSheetCommands("set "+mouseinfo.mouseresizerownum+" height "+newsize, true, false);

     if (editor.timeout) window.clearTimeout(editor.timeout);
     editor.timeout = window.setTimeout(SocialCalc.FinishColRowSize, 1); // wait - Firefox 2 has a bug otherwise with next mousedown
   }

   return false;

   }