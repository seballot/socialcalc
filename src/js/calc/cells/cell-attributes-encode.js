//
// result = SocialCalc.EncodeCellAttributes(sheet, coord)
//
// Returns the cell's attributes in an object, each in the following form:
//
//    attribname: {def: true/false, val: full-value}
//

SocialCalc.EncodeCellAttributes = function(sheet, coord) {

   var value, i, b, bb;
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
      result[name].val = v || "";
      }

   var SetAttribStar = function(name, v) {
      if (v=="*") return;
      result[name].def = false;
      result[name].val = v;
      }

   var cell = sheet.GetAssuredCell(coord);

   // cellformat: alignhoriz

   InitAttrib("alignhoriz");
   if (cell.cellformat) {
      SetAttrib("alignhoriz", sheet.cellformats[cell.cellformat]);
      }

   // layout: alignvert, padtop, padright, padbottom, padleft

   InitAttribs(["alignvert", "padtop", "padright", "padbottom", "padleft"]);
   if (cell.layout) {
      parts = sheet.layouts[cell.layout].match(/^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/);
      SetAttribStar("padtop", parts[1]);
      SetAttribStar("padright", parts[2]);
      SetAttribStar("padbottom", parts[3]);
      SetAttribStar("padleft", parts[4]);
      SetAttribStar("alignvert", parts[5]);
      }

   // font: fontfamily, fontlook, fontsize

   InitAttribs(["fontfamily", "fontlook", "fontsize"]);
   if (cell.font) {
      parts = sheet.fonts[cell.font].match(/^(\*|\S+? \S+?) (\S+?) (\S.*)$/);
      SetAttribStar("fontfamily", parts[3]);
      SetAttribStar("fontsize", parts[2]);
      SetAttribStar("fontlook", parts[1]);
      }

   // color: textcolor

   InitAttrib("textcolor");
   if (cell.color) {
      SetAttrib("textcolor", sheet.colors[cell.color]);
      }

   // bgcolor: bgcolor

   InitAttrib("bgcolor");
   if (cell.bgcolor) {
      SetAttrib("bgcolor", sheet.colors[cell.bgcolor]);
      }

   // formatting: numberformat, textformat

   InitAttribs(["numberformat", "textformat"]);
   if (cell.nontextvalueformat) {
      SetAttrib("numberformat", sheet.valueformats[cell.nontextvalueformat]);
      }
   if (cell.textvalueformat) {
      SetAttrib("textformat", sheet.valueformats[cell.textvalueformat]);
      }

   // merges: colspan, rowspan

   InitAttribs(["colspan", "rowspan"]);
   SetAttrib("colspan", cell.colspan || 1);
   SetAttrib("rowspan", cell.rowspan || 1);

   // borders: bXthickness, bXstyle, bXcolor for X = t, r, b, and l

   for (i=0; i<4; i++) {
      b = "trbl".charAt(i);
      bb = "b"+b;
      InitAttrib(bb);
      SetAttrib(bb, cell[bb] ? sheet.borderstyles[cell[bb]] : "");
      InitAttrib(bb+"thickness");
      InitAttrib(bb+"style");
      InitAttrib(bb+"color");
      if (cell[bb]) {
         parts = sheet.borderstyles[cell[bb]].match(/(\S+)\s+(\S+)\s+(\S.+)/);
         SetAttrib(bb+"thickness", parts[1]);
         SetAttrib(bb+"style", parts[2]);
         SetAttrib(bb+"color", parts[3]);
         }
      }

   // misc: cssc, csss, mod

   InitAttribs(["cssc", "csss", "mod"]);
   SetAttrib("cssc", cell.cssc || "");
   SetAttrib("csss", cell.csss || "");
   SetAttrib("mod", cell.mod || "n");

   return result;

   }