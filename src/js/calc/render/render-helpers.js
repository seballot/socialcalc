// Functions:

SocialCalc.PrecomputeSheetFontsAndLayouts = function(context) {

   var defaultfont, parts, layoutre, dparts, sparts, num, s, i;
   var sheetobj = context.sheetobj;
   var attribs =  sheetobj.attribs;

   if (attribs.defaultfont) {
      defaultfont = sheetobj.fonts[attribs.defaultfont];
      defaultfont = defaultfont.replace(/^\*/,SocialCalc.Constants.defaultCellFontStyle);
      defaultfont = defaultfont.replace(/(.+)\*(.+)/,"$1"+SocialCalc.Constants.defaultCellFontSize+"$2");
      defaultfont = defaultfont.replace(/\*$/,SocialCalc.Constants.defaultCellFontFamily);
      parts=defaultfont.match(/^(\S+? \S+?) (\S+?) (\S.*)$/);
      context.defaultfontstyle = parts[1];
      context.defaultfontsize = parts[2];
      context.defaultfontfamily = parts[3];
      }

   for (num=1; num<sheetobj.fonts.length; num++) { // precompute fonts by filling in the *'s
      s=sheetobj.fonts[num];
      s=s.replace(/^\*/,context.defaultfontstyle);
      s=s.replace(/(.+)\*(.+)/,"$1"+context.defaultfontsize+"$2");
      s=s.replace(/\*$/,context.defaultfontfamily);
      parts=s.match(/^(\S+?) (\S+?) (\S+?) (\S.*)$/);

      if (!parts) continue

      context.fonts[num] = {style: parts[1], weight: parts[2], size: parts[3], family: parts[4]};

      }

   layoutre = /^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/;
   dparts = SocialCalc.Constants.defaultCellLayout.match(layoutre); // get built-in defaults

   if (attribs.defaultlayout) {
      sparts = sheetobj.layouts[attribs.defaultlayout].match(layoutre); // get sheet defaults, if set
      }
   else {
      sparts = ["", "*", "*", "*", "*", "*"];
      }

   for (num=1; num<sheetobj.layouts.length; num++) { // precompute layouts by filling in the *'s
      s=sheetobj.layouts[num];
      parts = s.match(layoutre);

      if (!parts) continue

      for (i=1; i<=5; i++) {
         if (parts[i]=="*") {
            parts[i] = (sparts[i] != "*" ? sparts[i] : dparts[i]); // if *, sheet default or built-in
            }
         }
      context.layouts[num] = "padding:"+parts[1]+" "+parts[2]+" "+parts[3]+" "+parts[4]+
         ";vertical-align:"+parts[5]+";";
      }

   context.needprecompute = false;

   }

SocialCalc.CalculateCellSkipData = function(context) {

   var row, col, coord, cell, contextcell, colspan, rowspan, skiprow, skipcol, skipcoord;

   var sheetobj=context.sheetobj;
   var sheetrowattribs=sheetobj.rowattribs;
   var sheetcolattribs=sheetobj.colattribs;
   context.maxrow=0;
   context.maxcol=0;
   context.cellskip = {}; // reset

   // Calculate cellskip data

   for (row=1; row<=sheetobj.attribs.lastrow; row++) {
      for (col=1; col<=sheetobj.attribs.lastcol; col++) { // look for spans and set cellskip for skipped cells
         coord=SocialCalc.crToCoord(col, row);
         cell=sheetobj.cells[coord];
         // don't look at undefined cells (they have no spans) or skipped cells
         if (cell===undefined || context.cellskip[coord]) continue;
         colspan=cell.colspan || 1;
         rowspan=cell.rowspan || 1;
         if (colspan>1 || rowspan>1) {
            for (skiprow=row; skiprow<row+rowspan; skiprow++) {
               for (skipcol=col; skipcol<col+colspan; skipcol++) { // do the setting on individual cells
                  skipcoord=SocialCalc.crToCoord(skipcol,skiprow);
                  if (skipcoord==coord) { // for coord, remember row and col
                     context.coordToCR[coord]={row: row, col: col};
                     }
                  else { // for other cells, flag with coord of here
                     context.cellskip[skipcoord]=coord;
                     }
                  if (skiprow>context.maxrow) maxrow=skiprow;
                  if (skipcol>context.maxcol) maxcol=skipcol;
                  }
               }
            }
         }
      }

   context.needcellskip = false;

   }

SocialCalc.CalculateColWidthData = function(context) {

   var colnum, colname, colwidth, totalwidth;

   var sheetobj=context.sheetobj;
   var sheetcolattribs=sheetobj.colattribs;

   // Calculate column width data

   totalwidth=context.showRCHeaders ? context.rownamewidth-0 : 0;
   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         colname=SocialCalc.rcColname(colnum);
         if (sheetobj.colattribs.hide[colname] == "yes") {
            context.colwidth[colnum] = 0;
            }
         else {
            colwidth = sheetobj.colattribs.width[colname] || sheetobj.attribs.defaultcolwidth || SocialCalc.Constants.defaultColWidth;
            if (colwidth=="blank" || colwidth=="auto") colwidth="";
            context.colwidth[colnum]=colwidth+"";
            totalwidth+=(colwidth && ((colwidth-0)>0)) ? (colwidth-0) : 10;
            }
         }
      }
   context.totalwidth = totalwidth;

   }

SocialCalc.CalculateRowHeightData = function(context) {
  var rownum, rowheight, totalheight;
  var sheetobj = context.sheetobj;

  // Calculate row height data
  totalheight = context.showRCHeaders ? context.pixelsPerRow : 0;
  for (rowpane = 0; rowpane < context.rowpanes.length; rowpane++) {
    for (rownum = context.rowpanes[rowpane].first; rownum <= context.rowpanes[rowpane].last; rownum++) {
      if (sheetobj.rowattribs.hide[rownum] === "yes") {
        context.rowheight[rownum] = 0;
      } else {
        rowheight = sheetobj.rowattribs.height[rownum] || sheetobj.attribs.defaultrowheight || SocialCalc.Constants.defaultAssumedRowHeight;
        if (rowheight === "blank" || rowheight === "auto") rowheight = "";
        context.rowheight[rownum] = rowheight+"";
        totalheight += (rowheight && ((rowheight - 0) > 0)) ? (rowheight-0) : 10;
      }
    }
  }
  context.totalheight = totalheight;

}


SocialCalc.CoordInPane = function(context, coord, rowpane, colpane) {
   var coordToCR = context.coordToCR[coord];
   if (!coordToCR || !coordToCR.row || !coordToCR.col) throw "Bad coordToCR for "+coord;
   return context.CellInPane(coordToCR.row, coordToCR.col, rowpane, colpane);
   }


SocialCalc.CellInPane = function(context, row, col, rowpane, colpane) {
   var panerowlimits = context.rowpanes[rowpane];
   var panecollimits = context.colpanes[colpane];
   if (!panerowlimits || !panecollimits) throw "CellInPane called with unknown panes "+rowpane+"/"+colpane;
   if (row < panerowlimits.first || row > panerowlimits.last) return false;
   if (col < panecollimits.first || col > panecollimits.last) return false;
   return true;
   }

SocialCalc.CreatePseudoElement = function() {
   return {style:{cssText:""}, innerHTML: "", className: ""};
   }