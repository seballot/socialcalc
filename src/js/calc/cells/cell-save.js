//
// line = SocialCalc.CellToString(sheet, cell)
//

SocialCalc.CellToString = function(sheet, cell) {

   var cell, line = "", value, formula, t, r, b, l, xlt;
   if (!cell) return line;

   // Value
   value = SocialCalc.encodeForSave(cell.datavalue);
   if (cell.datatype=="v") {
      if (cell.valuetype=="n") line += ":v:"+value;
      else line += ":vt:"+cell.valuetype+":"+value;
   }
   else if (cell.datatype=="t") {
      if (cell.valuetype==SocialCalc.Constants.textdatadefaulttype) line += ":t:"+value;
      else line += ":vt:"+cell.valuetype+":"+value;
   }
   else {
      formula = SocialCalc.encodeForSave(cell.formula);
      if (cell.datatype=="f")      line += ":vtf:"+cell.valuetype+":"+value+":"+formula;
      else if (cell.datatype=="c") line += ":vtc:"+cell.valuetype+":"+value+":"+formula;
   }

   // Style
   if (sheet.xlt) { // if have canonical save info
      xlt = sheet.xlt;
      if (cell.style) line += ":s:"+xlt.stylesxlat[cell.styleId];
      if (cell.textvalueformat) line += ":tvf:"+xlt.valueformatsxlat[cell.textvalueformat];
      if (cell.nontextvalueformat) line += ":ntvf:"+xlt.valueformatsxlat[cell.nontextvalueformat];
   }
   else {
      if (cell.style) line += ":s:"+cell.styleId;
      if (cell.textvalueformat) line += ":tvf:"+cell.textvalueformat;
      if (cell.nontextvalueformat) line += ":ntvf:"+cell.nontextvalueformat;
   }

   // Other
   if (cell.readonly) line += ":ro:yes";
   if (cell.errors)   line += ":e:"+SocialCalc.encodeForSave(cell.errors);
   if (cell.colspan)  line += ":colspan:"+cell.colspan;
   if (cell.rowspan)  line += ":rowspan:"+cell.rowspan;
   if (cell.cssc)     line += ":cssc:"+cell.cssc;
   if (cell.csss)     line += ":csss:"+SocialCalc.encodeForSave(cell.csss);
   if (cell.mod)      line += ":mod:"+cell.mod;
   if (cell.comment)  line += ":comment:"+SocialCalc.encodeForSave(cell.comment);

   return line;
}