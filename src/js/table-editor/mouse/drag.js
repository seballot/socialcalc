// *************************************
//
// Dragging functions:
//
// *************************************

SocialCalc.DragInfo = {

   // There is only one of these -- no "new" is done.
   // Only one dragging operation can be active at a time.
   // The registeredElements array is used to decide which item to drag.

   // One item for each draggable thing, each an object with:
   //    .element, .vertical, .horizontal, .functionobj, .parent

   registeredElements: [],

   // Items used during a drag

   draggingElement: null, // item being processed (.element is the actual element)
   startX: 0,
   startY: 0,
   startZ: 0,
   clientX: 0, // modifyable version to restrict movement
   clientY: 0,
   offsetX: 0,
   offsetY: 0,
   relativeOffset: {left:0,top:0} // retrieved at drag start

   }

//
// DragRegister(element, vertical, horizontal, functionobj, parent) - make element draggable
//
// The functionobj defaults to moving the element contrained only by vertical and horizontal settings.
//

SocialCalc.DragRegister = function(element, vertical, horizontal, functionobj, parent) {

   var draginfo = SocialCalc.DragInfo;

   if (!functionobj) {
      functionobj = {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
                     MouseUp: SocialCalc.DragFunctionPosition,
                     Disabled: null};
      }

   draginfo.registeredElements.push(
      {element: element, vertical: vertical, horizontal: horizontal, functionobj: functionobj, parent: parent}
      );

   if (element.addEventListener) { // DOM Level 2 -- Firefox, et al
      element.addEventListener("mousedown", SocialCalc.DragMouseDown, false);
      }
   else if (element.attachEvent) { // IE 5+
      element.attachEvent("onmousedown", SocialCalc.DragMouseDown);
      }
   else { // don't handle this
      throw SocialCalc.Constants.s_BrowserNotSupported;
      }

   }

//
// DragUnregister(element) - remove object from list
//

SocialCalc.DragUnregister = function(element) {

   var draginfo = SocialCalc.DragInfo;

   var i;

   if (!element) return;

   for (i=0; i<draginfo.registeredElements.length; i++) {
      if (draginfo.registeredElements[i].element == element) {
         draginfo.registeredElements.splice(i,1);
         if (element.removeEventListener) { // DOM Level 2 -- Firefox, et al
            element.removeEventListener("mousedown", SocialCalc.DragMouseDown, false);
            }
         else { // IE 5+
            element.detachEvent("onmousedown", SocialCalc.DragMouseDown);
            }
         return;
         }
      }

   return; // ignore if not in list

   }

//
// DragMouseDown(event)
//

SocialCalc.DragMouseDown = function(event) {

   var e = event || window.event;

   var draginfo = SocialCalc.DragInfo;

   var dobj = SocialCalc.LookupElement(e.target || e.srcElement, draginfo.registeredElements);
   if (!dobj) return;

   if (dobj && dobj.functionobj && dobj.functionobj.Disabled) {
      if (dobj.functionobj.Disabled(e, draginfo, dobj)) {
         return;
         }
      }

   draginfo.draggingElement = dobj;
   if (dobj.parent) {
      draginfo.relativeOffset = SocialCalc.GetElementPositionWithScroll(dobj.parent);
      }
   draginfo.clientX = e.clientX - draginfo.relativeOffset.left;
   draginfo.clientY = e.clientY - draginfo.relativeOffset.top;
   draginfo.startX = draginfo.clientX;
   draginfo.startY = draginfo.clientY;
   draginfo.startZ = dobj.element.style.zIndex;
   draginfo.offsetX = 0;
   draginfo.offsetY = 0;

   dobj.element.style.zIndex = "100";
   SocialCalc.SetMouseMoveUp(SocialCalc.DragMouseMove,
           SocialCalc.DragMouseUp,
           dobj.element,
           e);
   if (dobj && dobj.functionobj && dobj.functionobj.MouseDown) dobj.functionobj.MouseDown(e, draginfo, dobj);

   return false;

   }

//
// DragMouseMove(event)
//

SocialCalc.DragMouseMove = function(event) {

   var e = event || window.event;

   var draginfo = SocialCalc.DragInfo;
   var dobj = draginfo.draggingElement;

   draginfo.clientX = e.clientX - draginfo.relativeOffset.left;
   draginfo.clientY = e.clientY - draginfo.relativeOffset.top;
   SocialCalc.StopPropagation(e);
   if (dobj && dobj.functionobj && dobj.functionobj.MouseMove) dobj.functionobj.MouseMove(e, draginfo, dobj);
   return false;
   }

//
// DragMouseUp(event)
//

SocialCalc.DragMouseUp = function(event) {

   var e = event || window.event;

   var draginfo = SocialCalc.DragInfo;
   var dobj = draginfo.draggingElement;

   draginfo.clientX = e.clientX - draginfo.relativeOffset.left;
   draginfo.clientY = e.clientY - draginfo.relativeOffset.top;

   dobj.element.style.zIndex = draginfo.startZ;

   if (dobj && dobj.functionobj && dobj.functionobj.MouseUp) dobj.functionobj.MouseUp(e, draginfo, dobj);
   SocialCalc.RemoveMouseMoveUp(SocialCalc.DragMouseMove,
        SocialCalc.DragMouseUp,
        dobj.element, e);
   draginfo.draggingElement = null;
   return false;
   }

//
// DragFunctionStart(event, draginfo, dobj)
//

SocialCalc.DragFunctionStart = function(event, draginfo, dobj) {

   var element = dobj.functionobj.positionobj || dobj.element;

   draginfo.offsetY = parseInt(element.style.top) - draginfo.clientY;
   draginfo.offsetX = parseInt(element.style.left) - draginfo.clientX;

   }

//
// DragFunctionPosition(event, draginfo, dobj)
//

SocialCalc.DragFunctionPosition = function(event, draginfo, dobj) {

   var element = dobj.functionobj.positionobj || dobj.element;

   if (dobj.vertical) element.style.top = (draginfo.clientY + draginfo.offsetY)+"px";
   if (dobj.horizontal) element.style.left = (draginfo.clientX + draginfo.offsetX)+"px";

   }