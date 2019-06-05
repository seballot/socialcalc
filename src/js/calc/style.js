
SocialCalc.GetStyleNum = function(sheet, atype, style) {

   var num;

   if (style.length==0) return 0; // null means use zero, which means default or global default

   num = sheet[atype+"hash"][style];
   if (!num) {
      if (sheet[atype+"s"].length<1) sheet[atype+"s"].push("");
      num = sheet[atype+"s"].push(style) - 1;
      sheet[atype+"hash"][style] = num;
      sheet.changedrendervalues = true;
   }
   return num;

}

SocialCalc.GetStyleString = function(sheet, atype, num) {

   if (!num) return null; // zero, null, and undefined return null

   return sheet[atype+"s"][num];

}


//
// setStyles(element, cssText)
//
// Takes a pseudo style string (e.g., text-align must be textAlign) and sets
// the element's style value for each style name listed (leaving others unchanged).
// OK to call with null cssText.
//

SocialCalc.setStyles = function (element, cssText) {

   var parts, part, pos, name, value;

   if (!cssText) return;

   parts = cssText.split(";");
   for (part=0; part<parts.length; part++) {
      pos = parts[part].indexOf(":"); // find first colon (could be one in url)
      if (pos != -1) {
         name = parts[part].substring(0, pos);
         value = parts[part].substring(pos+1);
         if (name && value) { // if non-null name and value, set style
            element.style[name] = value;
         }
      }
   }
}

//
// GetComputedStyle(element, style) - returns computed style value
//
// http://blog.stchur.com/2006/06/21/css-computed-style/
//

SocialCalc.GetComputedStyle = function (element, style) {

   var computedStyle;
   if (typeof element.currentStyle != 'undefined') { // IE
      computedStyle = element.currentStyle;
   }
   else {
      computedStyle = document.defaultView.getComputedStyle(element, null);
   }
   return computedStyle[style];

}