//
// result = SocialCalc.EncodeSheetAttributes(sheet)
//
// Returns the sheet's attributes in an object, each in the following form:
//
//    attribname: {def: true/false, val: full-value}
//

SocialCalc.EncodeSheetAttributes = function(sheet) {

   var value;
   var attribs = sheet.attribs;
   var result = {};

   var InitAttrib = function(name) {
      result[name] = {def: true, val: ""};
   }

   var InitAttribs = function(namelist) {
      for (var i=0; i<namelist.length; i++) {
         InitAttrib(namelist[i]);
      }
   }

   var SetAttrib = function(name, v) {
      result[name].def = false;
      result[name].val = v || value;
   }

   var SetAttribStar = function(name, v) {
      if (v=="*") return;
      result[name].def = false;
      result[name].val = v;
   }

   // sizes: colwidth, rowheight

   InitAttrib("colwidth");
   if (attribs.defaultcolwidth) {
      SetAttrib("colwidth", attribs.defaultcolwidth);
   }

   InitAttrib("rowheight");
   if (attribs.rowheight) {
      SetAttrib("rowheight", attribs.defaultrowheight);
   }

   // cellformat: textalignhoriz, numberalignhoriz

   InitAttrib("textalignhoriz");
   if (attribs.defaulttextformat) {
      SetAttrib("textalignhoriz", sheet.cellformats[attribs.defaulttextformat]);
   }

   InitAttrib("numberalignhoriz");
   if (attribs.defaultnontextformat) {
      SetAttrib("numberalignhoriz", sheet.cellformats[attribs.defaultnontextformat]);
   }

   // layout: alignvert, padtop, padright, padbottom, padleft

   InitAttribs(["alignvert", "padtop", "padright", "padbottom", "padleft"]);
   if (attribs.defaultlayout) {
      parts = sheet.layouts[attribs.defaultlayout].match(/^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/);
      SetAttribStar("padtop", parts[1]);
      SetAttribStar("padright", parts[2]);
      SetAttribStar("padbottom", parts[3]);
      SetAttribStar("padleft", parts[4]);
      SetAttribStar("alignvert", parts[5]);
   }

   // font: fontfamily, fontlook, fontsize

   InitAttribs(["fontfamily", "fontlook", "fontsize"]);
   if (attribs.defaultfont) {
      parts = sheet.fonts[attribs.defaultfont].match(/^(\*|\S+? \S+?) (\S+?) (\S.*)$/);
      SetAttribStar("fontfamily", parts[3]);
      SetAttribStar("fontsize", parts[2]);
      SetAttribStar("fontlook", parts[1]);
   }

   // color: textcolor

   InitAttrib("textcolor");
   if (attribs.defaultcolor) {
      SetAttrib("textcolor", sheet.colors[attribs.defaultcolor]);
   }

   // bgcolor: bgcolor

   InitAttrib("bgcolor");
   if (attribs.defaultbgcolor) {
      SetAttrib("bgcolor", sheet.colors[attribs.defaultbgcolor]);
   }

   // formatting: numberformat, textformat

   InitAttribs(["numberformat", "textformat"]);
   if (attribs.defaultnontextvalueformat) {
      SetAttrib("numberformat", sheet.valueformats[attribs.defaultnontextvalueformat]);
   }
   if (attribs.defaulttextvalueformat) {
      SetAttrib("textformat", sheet.valueformats[attribs.defaulttextvalueformat]);
   }

   // recalc: recalc

   InitAttrib("recalc");
   if (attribs.recalc) {
      SetAttrib("recalc", attribs.recalc);
   }

   // usermaxcol, usermaxrow
   InitAttrib("usermaxcol");
   if (attribs.usermaxcol) {
      SetAttrib("usermaxcol", attribs.usermaxcol);
   }
   InitAttrib("usermaxrow");
   if (attribs.usermaxrow) {
      SetAttrib("usermaxrow", attribs.usermaxrow);
   }

   return result;

}