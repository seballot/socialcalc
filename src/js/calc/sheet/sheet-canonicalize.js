//
// SocialCalc.CanonicalizeSheet(sheetobj, full)
//
// Goes through the sheet and fills in sheetobj.xlt with the following:
//
//   .maxrow, .maxcol - lastrow and lastcol are as small as possible
//   .newlayouts - new version of sheetobj.layouts without unused ones and all in ascending order
//   .layoutsxlat - maps old layouts index to new one
//   same ".new" and ".xlat" for fonts, colors, borderstyles, cell and value formats
//   .namesorder - array with names sorted
//
// If full or SocialCalc.Constants.doCanonicalizeSheet are not true, then the values will leave things unchanged (to save time, etc.)
//
// sheetobj.xlt should be deleted when you are finished using it
//

SocialCalc.CanonicalizeSheet = function(sheetobj, full) {

   var l, coord, cr, cell, filled, an, a, newa, newxlat, used, ahash, i, v;
   var maxrow = 0;
   var maxcol = 0;
   var alist = ["borderstyle", "cellformat", "color", "font", "layout", "valueformat"];

   var xlt = {};

   xlt.namesorder = []; // always return a sorted list
   for (a in sheetobj.names) {
      xlt.namesorder.push(a);
   }
   xlt.namesorder.sort();

   if (!SocialCalc.Constants.doCanonicalizeSheet || !full) { // return make-no-changes values if not wanted
      for (an=0; an<alist.length; an++) {
         a = alist[an];
         xlt["new"+a+"s"] = sheetobj[a+"s"];
         l = sheetobj[a+"s"].length;
         newxlat = new Array(l);
         newxlat[0] = "";
         for (i=1; i<l; i++) {
            newxlat[i] = i;
         }
         xlt[a+"sxlat"] = newxlat;
      }

      xlt.maxrow = sheetobj.attribs.lastrow;
      xlt.maxcol = sheetobj.attribs.lastcol;

      sheetobj.xlt = xlt;

      return;
   }

   for (an=0; an<alist.length; an++) {
      a = alist[an];
      xlt[a+"sUsed"] = {};
   }

   var colorsUsed = xlt.colorsUsed;
   var borderstylesUsed = xlt.borderstylesUsed;
   var fontsUsed = xlt.fontsUsed;
   var layoutsUsed = xlt.layoutsUsed;
   var cellformatsUsed = xlt.cellformatsUsed;
   var valueformatsUsed = xlt.valueformatsUsed;

   for (coord in sheetobj.cells) { // check all cells to see which values are used
      cr = SocialCalc.coordToCr(coord);
      cell = sheetobj.cells[coord];
      filled = false;

      if (cell.valuetype && cell.valuetype!="b") filled = true;

      if (cell.color) {
         colorsUsed[cell.color] = 1;
         filled = true;
      }

      if (cell.bgcolor) {
         colorsUsed[cell.bgcolor] = 1;
         filled = true;
      }

      if (cell.bt) {
         borderstylesUsed[cell.bt] = 1;
         filled = true;
      }
      if (cell.br) {
         borderstylesUsed[cell.br] = 1;
         filled = true;
      }
      if (cell.bb) {
         borderstylesUsed[cell.bb] = 1;
         filled = true;
      }
      if (cell.bl) {
         borderstylesUsed[cell.bl] = 1;
         filled = true;
      }

      if (cell.layout) {
         layoutsUsed[cell.layout] = 1;
         filled = true;
      }

      if (cell.font) {
         fontsUsed[cell.font] = 1;
         filled = true;
      }

      if (cell.cellformat) {
         cellformatsUsed[cell.cellformat] = 1;
         filled = true;
      }

      if (cell.textvalueformat) {
         valueformatsUsed[cell.textvalueformat] = 1;
         filled = true;
      }

      if (cell.nontextvalueformat) {
         valueformatsUsed[cell.nontextvalueformat] = 1;
         filled = true;
      }

      if (filled) {
         if (cr.row > maxrow) maxrow = cr.row;
         if (cr.col > maxcol) maxcol = cr.col;
      }
   }

   for (i=0; i<SocialCalc.sheetfieldsxlat.length; i++) { // do sheet values, too
      v = sheetobj.attribs[SocialCalc.sheetfieldsxlat[i]];
      if (v) {
         xlt[SocialCalc.sheetfieldsxlatxlt[i]+"sUsed"][v] = 1;
      }
   }

   a = {"height": 1, "hide": 1}; // look at explicit row settings
   for (v in a) {
      for (cr in sheetobj.rowattribs[v]) {
         if (cr > maxrow) maxrow = cr;
      }
   }
   a = {"hide": 1, "width": 1}; // look at explicit col settings
   for (v in a) {
      for (coord in sheetobj.colattribs[v]) {
         cr = SocialCalc.coordToCr(coord+"1");
         if (cr.col > maxcol) maxcol = cr.col;
      }
   }

   for (an=0; an<alist.length; an++) { // go through the attribs we want
      a = alist[an];

      newa = [];
      used = xlt[a+"sUsed"];
      for (v in used) {
         newa.push(sheetobj[a+"s"][v]);
      }
      newa.sort();
      newa.unshift("");

      newxlat = [""];
      ahash = sheetobj[a+"hash"];

      for (i=1; i<newa.length; i++) {
         newxlat[ahash[newa[i]]] = i;
      }

      xlt[a+"sxlat"] = newxlat;
      xlt["new"+a+"s"] = newa;

   }

   xlt.maxrow = maxrow || 1;
   xlt.maxcol = maxcol || 1;

   sheetobj.xlt = xlt; // leave for use by caller

}