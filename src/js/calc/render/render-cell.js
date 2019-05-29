SocialCalc.RenderCell = function(context, rownum, colnum, rowpane, colpane, noElement, linkstyle) {

   var sheetobj=context.sheetobj;

   var num, t, result, span, stylename, cell, endcell, sheetattribs, scdefaults;
   var stylestr="";

   rownum = rownum-0; // make sure a number
   colnum = colnum-0;

   var coord=SocialCalc.crToCoord(colnum, rownum);

   if (context.cellskip[coord]) { // skip if within a span
      if (context.CoordInPane(context.cellskip[coord], rowpane, colpane)) {
         return null; // span starts in this pane -- so just skip
         }
      result=noElement ? SocialCalc.CreatePseudoElement() : document.createElement("td"); // span start is scrolled away, so make a special cell
      if (context.classnames.skippedcell) result.className=context.classnames.skippedcell;
      if (context.explicitStyles.skippedcell) result.style.cssText=context.explicitStyles.skippedcell;
      result.innerHTML="&nbsp;"; // put something there so height is OK
      // !!! Really need to add borders in case there isn't anything else shown in the pane to get height
      return result;
      }

   result=noElement ? SocialCalc.CreatePseudoElement() : document.createElement("td");

   if (context.cellIDprefix) {
      result.id = context.cellIDprefix+coord;
      }

   cell=sheetobj.cells[coord];

   if (!cell) {
      cell=new SocialCalc.Cell(coord);
      }

   sheetattribs=sheetobj.attribs;
   scc=SocialCalc.Constants;

   if (cell.colspan>1) {
      span=1;
      for (num=1; num<cell.colspan; num++) {
          if (sheetobj.colattribs.hide[SocialCalc.rcColname(colnum+num)]!="yes" &&
                context.CellInPane(rownum, colnum+num, rowpane, colpane)) {
             span++;
             }
          }
      result.colSpan=span;
      }

   if (cell.rowspan>1) {
      span=1;
      for (num=1; num<cell.rowspan; num++) {
          if (sheetobj.rowattribs.hide[(rownum+num)+""]!="yes" &&
                context.CellInPane(rownum+num, colnum, rowpane, colpane))
             span++;
         }
      result.rowSpan=span;
      }

   if (cell.displaystring==undefined || sheetobj.widgetsClean == false) { // cache the display value
      cell.displaystring = SocialCalc.FormatValueForDisplay(sheetobj, cell.datavalue, coord, (linkstyle || context.defaultlinkstyle));
      }

   result.innerHTML = cell.displaystring;
   result.className += "cell"

   // num=cell.layout || sheetattribs.defaultlayout;
   // if (num && typeof(context.layouts[num]) !== "undefined") {
   //    stylestr+=context.layouts[num]; // use precomputed layout with "*"'s filled in
   //    }
   // else {
   //    stylestr+=scc.defaultCellLayout;
   //    }

   // All style properties (font-weight, color etc...)
   for(var property in cell.style) {
      stylestr += property + ":" + cell.style[property] + ";";
   }

   // get the end cell for border styling
   if (cell.colspan > 1 || cell.rowspan > 1) {
      endcell = sheetobj.cells[SocialCalc.crToCoord(colnum+(cell.colspan || 1)-1, rownum+(cell.rowspan || 1)-1)];
      }

   num=cell.bt;
   if (num && typeof(sheetobj.borderstyles[num]) !== "undefined") stylestr+="border-top:"+sheetobj.borderstyles[num]+";";

   num=typeof(endcell) != "undefined" ? endcell.br : cell.br;
   if (num && typeof(sheetobj.borderstyles[num]) !== "undefined") stylestr+="border-right:"+sheetobj.borderstyles[num]+";";
   else if (context.showGrid) {
      if (context.CellInPane(rownum, colnum+(cell.colspan || 1), rowpane, colpane))
         t=SocialCalc.crToCoord(colnum+(cell.colspan || 1), rownum);
      else t="nomatch";
      if (context.cellskip[t]) t=context.cellskip[t];
      if (!sheetobj.cells[t] || !sheetobj.cells[t].bl)
         stylestr+="border-right:"+context.gridCSS;
      }

   num=typeof(endcell) != "undefined" ? endcell.bb : cell.bb;
   if (num && typeof(sheetobj.borderstyles[num]) !== "undefined") stylestr+="border-bottom:"+sheetobj.borderstyles[num]+";";
   else if (context.showGrid) {
      if (context.CellInPane(rownum+(cell.rowspan || 1), colnum, rowpane, colpane))
         t=SocialCalc.crToCoord(colnum, rownum+(cell.rowspan || 1));
      else t="nomatch";
      if (context.cellskip[t]) t=context.cellskip[t];
      if (!sheetobj.cells[t] || !sheetobj.cells[t].bt)
         stylestr+="border-bottom:"+context.gridCSS;
      }

   num=cell.bl;
   if (num && typeof(sheetobj.borderstyles[num]) !== "undefined") stylestr+="border-left:"+sheetobj.borderstyles[num]+";";

   if (cell.comment) {
      result.title = cell.comment;
      if (context.showGrid) {
         if (context.commentClassName) {
            result.className = (result.className ? result.className+" " : "") + context.commentClassName;
            }
         stylestr+=context.commentCSS;
         }
      else {
         if (context.commentNoGridClassName) {
            result.className = (result.className ? result.className+" " : "") + context.commentNoGridClassName;
            }
         stylestr+=context.commentNoGridCSS;
         }
      }

   if (cell.readonly) {
      if (!cell.comment) {
         result.title = context.readonlyComment;
         }
      if (context.showGrid) {
         if (context.readonlyClassName) {
            result.className = (result.className ? result.className+" " : "") + context.readonlyClassName;
            }
         stylestr+=context.readonlyCSS;
         }
      else {
         if (context.readonlyNoGridClassName) {
            result.className = (result.className ? result.className+" " : "") + context.readonlyNoGridClassName;
            }
         stylestr+=context.readonlyNoGridCSS;
         }
      }

   result.style.cssText=stylestr;

   //!!!!!!!!!
   // NOTE: csss is not supported yet.
   // csss needs to be parsed into pieces to override just the attributes specified, not all with assignment to cssText.
   if (cell.cssc !== undefined) {
      noElement ? (result.className = (result.className ? result.className + ' ' : '') + cell.cssc) : result.classList.add(cell.cssc);
   }

   t = context.highlights[coord];
   if (t) { // this is a highlit cell: Override style appropriately
      if (t=="cursor") t += context.cursorsuffix; // cursor can take alternative forms
      if (context.highlightTypes[t].className) {
         result.className = (result.className ? result.className+" " : "") + context.highlightTypes[t].className;
         }
      SocialCalc.setStyles(result, context.highlightTypes[t].style);
      }

   // If hidden column, display: none.
   if (sheetobj.colattribs.hide[SocialCalc.rcColname(colnum)] == "yes") {
      result.style.cssText+=";display:none";
      }

   // If hidden row, display: none.
   if (sheetobj.rowattribs.hide[rownum] == "yes") {
      result.style.cssText+=";display:none";
      }

   return result;
   }