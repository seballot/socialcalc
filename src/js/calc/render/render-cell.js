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

   result.className += "cell"

   var contentStyle = "display: block; width:" + context.colwidth[colnum] + "px;";
   var contentClass = "cell-content " + (cell.style['content-overflow'] || '')

   if (!cell.displaystring || cell.displaystring.length == 0 || cell.displaystring == "&nbsp;") {
      result.className += " empty";
   }
   //    result.innerHTML = "<span class='" + contentClass + "' style='" + contentStyle +"'>" + "" + "</span>";
   // }
   result.innerHTML = "<span class='" + contentClass + "' style='" + contentStyle +"'>" + cell.displaystring + "</span>";

   // ALL STYLE PROPERTIES (font-weight, color etc...)
   for(var property in cell.style) {
      if (property.indexOf('border') == -1 && property.indexOf('content-overflow') == -1)
         stylestr += property + ":" + cell.style[property] + ";";
   }

   // BORDER
   if (cell.style["background-color"] && !cell.style["border"]) {
      var color = tinycolor(cell.style["background-color"]);
      if (color.getBrightness() < 230) stylestr += "border-color: " + color.lighten(5).toString() + ";";
   }
   if (cell.style['border']) {
      // result.className += " bordered";
      ['border-width', 'border-style', 'border-color'].forEach(function(property) {
         stylestr += property + ":" + cell.style[property] + ";";
      });

   }

   // COMMENT
   if (cell.comment) {
      result.title = cell.comment;
      result.className += " commented"
   }

   // READONLY
   if (cell.readonly) {
      if (!cell.comment) result.title = scc.defaultReadonlyComment;
      result.className += " read-only"
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