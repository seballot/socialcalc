// *************************************
//
// MouseWheel functions:
//
// *************************************

SocialCalc.MouseWheelInfo = {

   // There is only one of these -- no "new" is done.
   // The mousewheel only affects the one area the mouse pointer is over
   // The registeredElements array is used to identify items.

   // One item for each element to respond to the mousewheel, each an object with:
   //    .element, .functionobj

   registeredElements: []

}

//
// MouseWheelRegister(element, functionobj) - make element respond to mousewheel
//

SocialCalc.MouseWheelRegister = function(element, functionobj) {

   var mousewheelinfo = SocialCalc.MouseWheelInfo;

   mousewheelinfo.registeredElements.push(
      {element: element, functionobj: functionobj}
      );

   if (element.addEventListener) { // DOM Level 2 -- Firefox, et al
      element.addEventListener("DOMMouseScroll", SocialCalc.ProcessMouseWheel, false);
      element.addEventListener("mousewheel", SocialCalc.ProcessMouseWheel, false); // Opera needs this
   }
   else if (element.attachEvent) { // IE 5+
      element.attachEvent("onmousewheel", SocialCalc.ProcessMouseWheel);
   }
   else { // don't handle this
      throw SocialCalc.Constants.s_BrowserNotSupported;
   }

   return;

}

SocialCalc.ProcessMouseWheel = function(e) {

   var event = e || window.event;
   var delta;

   if (SocialCalc.Keyboard.passThru) return; // ignore

   var mousewheelinfo = SocialCalc.MouseWheelInfo;
   var ele = event.target || event.srcElement; // source object is often within what we want
   var wobj;

   for (wobj=null; !wobj && ele; ele=ele.parentNode) { // go up tree looking for one of our elements
      wobj = SocialCalc.LookupElement(ele, mousewheelinfo.registeredElements);
   }
   if (!wobj) return; // not one of our elements

   if (event.wheelDelta) delta = event.wheelDelta/40;
   else delta = -event.detail;
   if (!delta) delta = 0;

   if (wobj.functionobj && wobj.functionobj.WheelMove) wobj.functionobj.WheelMove(event, delta, mousewheelinfo, wobj);

   if (event.preventDefault) event.preventDefault();
   event.returnValue = false;

}