//
// GetViewportInfo() - returns object with viewport width and height, and scroll offsets
//
// Flanagan, JavaScript, 5th Edition, page 276
//

SocialCalc.GetViewportInfo = function () {

   var result = {};

   if (window.innerWidth) { // all but IE
      result.width = window.innerWidth;
      result.height = window.innerHeight;
      result.horizontalScroll = window.pageXOffset;
      result.verticalScroll = window.pageYOffset;
      }
   else {
      if (document.documentElement && document.documentElement.clientWidth) {
         result.width = document.documentElement.clientWidth;
         result.height = document.documentElement.clientHeight;
         result.horizontalScroll = document.documentElement.scrollLeft;
         result.verticalScroll = document.documentElement.scrollTop;
         }
      else if (document.body.clientWidth) {
         result.width = document.body.clientWidth;
         result.height = document.body.clientHeight;
         result.horizontalScroll = document.body.scrollLeft;
         result.verticalScroll = document.body.scrollTop;
         }
      }

   return result;
   }

//
// GetElementPosition(element) - returns object with left and top position of the element in the document
//
// Goodman's JavaScript & DHTML Cookbook, 2nd Edition, page 415
//

SocialCalc.GetElementPosition = function (element) {

   var offsetLeft = 0;
   var offsetTop = 0;
   while (element) {
      if (SocialCalc.GetComputedStyle(element,'position')=='relative') break;
      offsetLeft+=element.offsetLeft;
      offsetTop+=element.offsetTop;
      element=element.offsetParent;
      }
   return {left:offsetLeft, top:offsetTop};

   }

//
// GetElementPositionWithScroll(element) - returns object with left and top position of the element in the document
//

SocialCalc.GetElementPositionWithScroll = function (element) {

   var rect = element.getBoundingClientRect();
   return {
      left:rect.left,
      right:rect.right,
      top:rect.top,
      bottom:rect.bottom,
      width:rect.width?rect.width:rect.right-rect.left,
      height:rect.height?rect.height:rect.bottom-rect.top
      };

   }

//
// GetElementFixedParent(element) - checks whether element has a parent with position:fixed
//

SocialCalc.GetElementFixedParent = function(element) {

   while (element) {
      if (element.tagName=="HTML") break;
      if (SocialCalc.GetComputedStyle(element,'position')=='fixed') return element;
      element=element.parentNode;
      }
      return false;

   }



//
// LookupElement(element, array) - returns array element which is an object with "element" of element
//

SocialCalc.LookupElement = function (element, array) {

   var i;
   for (i=0; i<array.length; i++) {
      if (array[i].element == element) return array[i];
      }
   return null;

   }

//
// AssignID(obj, element, id) - Optionally assigns an ID with a prefix to the element
//

SocialCalc.AssignID = function (obj, element, id) {

   if (obj.idPrefix) { // Object must have a non-empty idPrefix attribute
      element.id = obj.idPrefix + id;
      }

   }