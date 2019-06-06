SocialCalc.RenderRow = function(context, rownum, rowpane, linkstyle) {

   var sheetobj=context.sheetobj;

   var result=document.createElement("tr");
   var colnum, newcol, colpane, newdiv;

   if (context.showRCHeaders) {
      newcol=document.createElement("td");
      if (context.classnames) newcol.className=context.classnames.rowname;
      if (context.explicitStyles) newcol.style.cssText=context.explicitStyles.rowname;
      newcol.width=context.rownamewidth;
      newcol.height = context.rowheight[rownum];
      newcol.style.verticalAlign="top"; // to get around Safari making top of centered row number be
                                        // considered top of row (and can't get <row> position in Safari)
      newcol.innerHTML=rownum+"";

      // If neighbour is hidden, show an icon in this column.
      if (rownum < context.rowpanes[context.rowpanes.length-1].last && sheetobj.rowattribs.hide[rownum+1] == "yes") {
         // HACK: Because we likely want the icon floating at the bottom of the cell, we create an enclosing div
         // with position relative and the icon's div will be placed inside it with position: absolute and bottom: 0.
         var container = document.createElement("div");
         container.style.position = "relative";
         var unhide = document.createElement("div");
         if (context.classnames) unhide.className=context.classnames.unhidetop;
         if (context.explicitStyles) unhide.style.cssText=context.explicitStyles.unhidetop;
         var fixPosition = ((context.rowheight[rownum] - 0) - SocialCalc.Constants.defaultAssumedRowHeight);
         fixPosition = (fixPosition === 0) ? 4 : fixPosition;
         unhide.style.bottom = '-' + fixPosition + 'px';
         context.rowunhidetop[rownum] = unhide;
         container.appendChild(unhide);
         newcol.appendChild(container);
      }
      if (rownum > 1 && sheetobj.rowattribs.hide[rownum-1] == "yes") {
         var unhide = document.createElement("div");
         if (context.classnames) unhide.className=context.classnames.unhidebottom;
         if (context.explicitStyles) unhide.style.cssText=context.explicitStyles.unhidebottom;
         context.rowunhidebottom[rownum] = unhide;
         newcol.appendChild(unhide);
      }

      // add resize bar
      var resizeBar = document.createElement('div');
      resizeBar.className = context.classnames.rowresizebar;
      newcol.appendChild(resizeBar);

      result.appendChild(newcol);
   }

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         newcol=context.RenderCell(rownum, colnum, rowpane, colpane, null, linkstyle);
         if (newcol) result.appendChild(newcol);
      }
      if (colpane<context.colpanes.length-1) {
         newcol=document.createElement("td");
         newcol.className= "spacing-cell col";
         result.appendChild(newcol);
      }
   }

   // If hidden row, display: none.
   if (sheetobj.rowattribs.hide[rownum] == "yes") {
      result.style.cssText += ";display:none";
   }

   return result;
}

SocialCalc.RenderSpacingRow = function(context) {

   var colnum, newcol, colpane, w;

   var sheetobj=context.sheetobj;

   var result=document.createElement("tr");

   if (context.showRCHeaders) {
      newcol = document.createElement("td");
      newcol.width = context.rownamewidth;
      newcol.className = "spacing-cell col header";
      result.appendChild(newcol);
   }

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         newcol=document.createElement("td");
         w = context.colwidth[colnum];
         if (w) newcol.width = w;
         newcol.className = "spacing-cell col";
         if (newcol) result.appendChild(newcol);
      }
      if (colpane < context.colpanes.length-1) {
         newcol = document.createElement("td");
         newcol.className= "spacing-cell col other"
         result.appendChild(newcol);
      }
   }
   return result;
}

SocialCalc.RenderSizingRow = function(context) {

   var colpane, colnum, newcell, t;
   var sheetobj=context.sheetobj;

   var result=document.createElement("tr");

   if (context.showRCHeaders) {
      newcell=document.createElement("td");
      newcell.style.width=context.rownamewidth+"px";
      newcell.height="1";
      result.appendChild(newcell);
   }

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         newcell=document.createElement("td");
         if (sheetobj.colattribs.hide[SocialCalc.rcColname(colnum)] == "yes") {
            newcell.width="1";
         }
         else {
            t = context.colwidth[colnum];
            if (t) newcell.width=t;
         }
         newcell.height="1";
         result.appendChild(newcell);
      }
      if (colpane<context.colpanes.length-1) {
         newcell=document.createElement("td");
         newcell.className = "spacing-cell row col";
         newcell.height="1";
         result.appendChild(newcell);
      }
   }
   return result;
}