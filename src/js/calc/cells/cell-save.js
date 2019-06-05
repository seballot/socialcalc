//
// line = SocialCalc.CellToString(sheet, cell)
//

SocialCalc.CellToString = function(sheet, cell) {

   var cell, line, value, formula, t, r, b, l, xlt;

   line = "";

   if (!cell) return line;

   value = SocialCalc.encodeForSave(cell.datavalue);
   if (cell.datatype=="v") {
      if (cell.valuetype=="n") line += ":v:"+value;
      else line += ":vt:"+cell.valuetype+":"+value;
   }
   else if (cell.datatype=="t") {
      if (cell.valuetype==SocialCalc.Constants.textdatadefaulttype)
         line += ":t:"+value;
      else line += ":vt:"+cell.valuetype+":"+value;
   }
   else {
      formula = SocialCalc.encodeForSave(cell.formula);
      if (cell.datatype=="f") {
         line += ":vtf:"+cell.valuetype+":"+value+":"+formula;
      }
      else if (cell.datatype=="c") {
         line += ":vtc:"+cell.valuetype+":"+value+":"+formula;
      }
   }
   if (cell.readonly) {
      line += ":ro:yes";
   }
   if (cell.errors) {
      line += ":e:"+SocialCalc.encodeForSave(cell.errors);
   }
   t = cell.bt || "";
   r = cell.br || "";
   b = cell.bb || "";
   l = cell.bl || "";

   if (sheet.xlt) { // if have canonical save info
      xlt = sheet.xlt;
      if (t || r || b || l)
      line += ":b:"+xlt.borderstylesxlat[t||0]+":"+xlt.borderstylesxlat[r||0]+":"+xlt.borderstylesxlat[b||0]+":"+xlt.borderstylesxlat[l||0];
      if (cell.layout) line += ":l:"+xlt.layoutsxlat[cell.layout];
      if (cell.font) line += ":f:"+xlt.fontsxlat[cell.font];
      if (cell.color) line += ":c:"+xlt.colorsxlat[cell.color];
      if (cell.bgcolor) line += ":bg:"+xlt.colorsxlat[cell.bgcolor];
      if (cell.cellformat) line += ":cf:"+xlt.cellformatsxlat[cell.cellformat];
      if (cell.textvalueformat) line += ":tvf:"+xlt.valueformatsxlat[cell.textvalueformat];
      if (cell.nontextvalueformat) line += ":ntvf:"+xlt.valueformatsxlat[cell.nontextvalueformat];
   }
   else {
      if (t || r || b || l)
      line += ":b:"+t+":"+r+":"+b+":"+l;
      if (cell.layout) line += ":l:"+cell.layout;
      if (cell.font) line += ":f:"+cell.font;
      if (cell.color) line += ":c:"+cell.color;
      if (cell.bgcolor) line += ":bg:"+cell.bgcolor;
      if (cell.cellformat) line += ":cf:"+cell.cellformat;
      if (cell.textvalueformat) line += ":tvf:"+cell.textvalueformat;
      if (cell.nontextvalueformat) line += ":ntvf:"+cell.nontextvalueformat;
   }
   if (cell.colspan) line += ":colspan:"+cell.colspan;
   if (cell.rowspan) line += ":rowspan:"+cell.rowspan;
   if (cell.cssc) line += ":cssc:"+cell.cssc;
   if (cell.csss) line += ":csss:"+SocialCalc.encodeForSave(cell.csss);
   if (cell.mod) line += ":mod:"+cell.mod;
   if (cell.comment) line += ":comment:"+SocialCalc.encodeForSave(cell.comment);

   return line;

}