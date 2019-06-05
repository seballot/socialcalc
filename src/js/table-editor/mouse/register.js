//
// Mouse stuff
//

SocialCalc.EditorMouseInfo = {

   // The registeredElements array is used to identify editor grid in which the mouse is doing things.

   // One item for each active editor, each an object with:
   //    .element, .editor

   registeredElements: [],

   editor: null, // editor being processed (between mousedown and mouseup)
   element: null, // element being processed

   ignore: false, // if true, mousedowns are ignored

   mousedowncoord: "", // coord where mouse went down for drag range
   mouselastcoord: "", // coord where mouse last was during drag
   mouseresizecol: "", // col being resized
   mouseresizeclientx: null, // where resize started
   mouseresizedisplay: null // element tracking new size
}

//
// EditorMouseRegister(editor)
//

SocialCalc.EditorMouseRegister = function(editor) {

   var mouseinfo = SocialCalc.EditorMouseInfo;
   var element = editor.fullgrid;
   var i;

   for (i=0; i<mouseinfo.registeredElements.length; i++) {
      if (mouseinfo.registeredElements[i].editor == editor) {
         if (mouseinfo.registeredElements[i].element == element) {
            return; // already set - don't do it again
         }
         break;
      }
   }

   if (i<mouseinfo.registeredElements.length) {
      mouseinfo.registeredElements[i].element = element;
   }
   else {
      mouseinfo.registeredElements.push({element: element, editor: editor});
   }

   if (element.addEventListener) { // DOM Level 2 -- Firefox, et al
      element.addEventListener("mousedown", SocialCalc.ProcessEditorMouseDown, false);
      element.addEventListener("dblclick", SocialCalc.ProcessEditorDblClick, false);
   }
   else if (element.attachEvent) { // IE 5+
      element.attachEvent("onmousedown", SocialCalc.ProcessEditorMouseDown);
      element.attachEvent("ondblclick", SocialCalc.ProcessEditorDblClick);
   }
   else { // don't handle this
      throw "Browser not supported";
   }

   mouseinfo.ignore = false; // just in case

   return;

}

//
// EditorMouseUnregister(editor)
//

SocialCalc.EditorMouseUnregister = function(editor) {

   var mouseinfo = SocialCalc.EditorMouseInfo;
   var element = editor.fullgrid;
   var i, oldelement;

   for (i=0; i<mouseinfo.registeredElements.length; i++) {
      if (mouseinfo.registeredElements[i].editor == editor) {
         break;
      }
   }

   if (i<mouseinfo.registeredElements.length) {
      oldelement = mouseinfo.registeredElements[i].element; // remove old handlers
      if (oldelement.removeEventListener) { // DOM Level 2
         oldelement.removeEventListener("mousedown", SocialCalc.ProcessEditorMouseDown, false);
         oldelement.removeEventListener("dblclick", SocialCalc.ProcessEditorDblClick, false);
      }
      else if (oldelement.detachEvent) { // IE
         oldelement.detachEvent("onmousedown", SocialCalc.ProcessEditorMouseDown);
         oldelement.detachEvent("ondblclick", SocialCalc.ProcessEditorDblClick);
      }
      mouseinfo.registeredElements.splice(i, 1);
   }

   return;

}

SocialCalc.StopPropagation = function(event) {
    if (event.stopPropagation) event.stopPropagation(); // DOM Level 2
    else event.cancelBubble = true; // IE 5+
    if (event.preventDefault) event.preventDefault(); // DOM Level 2
    else event.returnValue = false; // IE 5+
}

SocialCalc.SetMouseMoveUp = function(move, up, element, event) {
       // Event code from JavaScript, Flanagan, 5th Edition, pg. 422
   if (document.addEventListener) { // DOM Level 2 -- Firefox, et al
      document.addEventListener("mousemove", move, true); // capture everywhere
      document.addEventListener("mouseup", up, true); // capture everywhere
   }
   else if (element.attachEvent) { // IE 5+
      element.setCapture();
      element.attachEvent("onmousemove", move);
      element.attachEvent("onmouseup", up);
      element.attachEvent("onlosecapture", up);
}
    SocialCalc.StopPropagation(event);
}

SocialCalc.RemoveMouseMoveUp = function(move, up, element, event) {
    SocialCalc.StopPropagation(event);
    if (document.removeEventListener) { // DOM Level 2
   document.removeEventListener("mousemove", move, true);
   document.removeEventListener("mouseup", up, true);
 }
    else if (element.detachEvent) { // IE
   element.detachEvent("onlosecapture", up);
   element.detachEvent("onmouseup", up);
   element.detachEvent("onmousemove", move);
   element.releaseCapture();
 }
}