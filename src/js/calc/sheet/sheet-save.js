//
// sheetstr = SocialCalc.CreateSheetSave(sheetobj, range, canonicalize)
//
// Creates a text representation of the sheetobj data.
// If the range is present then only those cells are saved
// (as clipboard data with "copiedfrom" set).
//

SocialCalc.CreateSheetSave = function(sheetobj, range, canonicalize) {

   var cell, cr1, cr2, row, col, coord, attrib, line, value, formula, i, t, r, b, l, name, blanklen;
   var result=[];

   var prange;

   sheetobj.CanonicalizeSheet(canonicalize || SocialCalc.Constants.doCanonicalizeSheet);
   var xlt = sheetobj.xlt;

   if (range) {
      prange = SocialCalc.ParseRange(range);
   }
   else {
      prange = {cr1: {row: 1, col:1},
                cr2: {row: xlt.maxrow, col: xlt.maxcol}};
   }
   cr1 = prange.cr1;
   cr2 = prange.cr2;

   result.push("version:1.6");

   for (row=cr1.row; row <= cr2.row; row++) {
      for (col=cr1.col; col <= cr2.col; col++) {
         coord = SocialCalc.crToCoord(col, row);
         cell=sheetobj.cells[coord];
         if (!cell) continue;
         line=sheetobj.CellToString(cell);
         if (line.length==0) continue; // ignore completely empty cells
         line="cell:"+coord+line;
         result.push(line);
      }
   }

   for (col=1; col <= xlt.maxcol; col++) {
      coord = SocialCalc.rcColname(col);
      if (sheetobj.colattribs.width[coord])
         result.push("col:"+coord+":w:"+sheetobj.colattribs.width[coord]);
      if (sheetobj.colattribs.hide[coord])
         result.push("col:"+coord+":hide:"+sheetobj.colattribs.hide[coord]);
   }

   for (row=1; row <= xlt.maxrow; row++) {
      if (sheetobj.rowattribs.height[row])
         result.push("row:"+row+":h:"+sheetobj.rowattribs.height[row]);
      if (sheetobj.rowattribs.hide[row])
         result.push("row:"+row+":hide:"+sheetobj.rowattribs.hide[row]);
   }

   line="sheet:c:"+xlt.maxcol+":r:"+xlt.maxrow;

   for (i=0; i<SocialCalc.sheetfields.length; i++) { // non-xlated values
      value = SocialCalc.encodeForSave(sheetobj.attribs[SocialCalc.sheetfields[i]]);
      if (value) line+=":"+SocialCalc.sheetfieldsshort[i]+":"+value;
   }
   for (i=0; i<SocialCalc.sheetfieldsxlat.length; i++) { // xlated values
      value = sheetobj.attribs[SocialCalc.sheetfieldsxlat[i]];
      if (value) line+=":"+SocialCalc.sheetfieldsxlatshort[i]+":"+xlt[SocialCalc.sheetfieldsxlatxlt[i]+"sxlat"][value];
   }

   result.push(line);

   for (i=1;i<xlt.newstyles.length;i++) {
      result.push("style:"+i+":"+SocialCalc.encodeForSave(xlt.newstyles[i]));
   }

   for (i=1;i<xlt.newvalueformats.length;i++) {
      result.push("valueformat:"+i+":"+SocialCalc.encodeForSave(xlt.newvalueformats[i]));
   }

   for (i=0; i<xlt.namesorder.length; i++) {
      name = xlt.namesorder[i];
      result.push("name:"+SocialCalc.encodeForSave(name).toUpperCase()+":"+
                   SocialCalc.encodeForSave(sheetobj.names[name].desc)+":"+
                   SocialCalc.encodeForSave(sheetobj.names[name].definition));
   }

   if (range) {
      result.push("copiedfrom:"+SocialCalc.crToCoord(cr1.col, cr1.row)+":"+
                  SocialCalc.crToCoord(cr2.col, cr2.row));
   }

   result.push(""); // one extra to get extra \n

   delete sheetobj.xlt; // clean up
   console.log(xlt);
   console.log(result.join("\n"));

   return result.join("\n");
}