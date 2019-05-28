SocialCalc.RenderColHeaders = function(context) {

   var sheetobj=context.sheetobj;

   var result=document.createElement("tr");
   var colnum, newcol;

   if (!context.showRCHeaders) return null;

   newcol=document.createElement("td");
   if (context.classnames) newcol.className=context.classnames.upperleft;
   if (context.explicitStyles) newcol.style.cssText=context.explicitStyles.upperleft;
   newcol.width=context.rownamewidth;
   result.appendChild(newcol);

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         newcol=document.createElement("td");
         if (context.classnames) newcol.className=context.classnames.colname;
         if (context.explicitStyles) newcol.style.cssText=context.explicitStyles.colname;

         // If hidden column, display: none.
         if (sheetobj.colattribs.hide[SocialCalc.rcColname(colnum)] == "yes") {
            newcol.style.cssText += ";display:none";
            }

         newcol.innerHTML=SocialCalc.rcColname(colnum);

         // If neighbour is hidden, show an icon in this column.
         if (colnum < context.colpanes[context.colpanes.length-1].last && sheetobj.colattribs.hide[SocialCalc.rcColname(colnum+1)] == "yes") {
            var unhide = document.createElement("div");
            if (context.classnames) unhide.className=context.classnames.unhideleft;
            if (context.explicitStyles) unhide.style.cssText=context.explicitStyles.unhideleft;
            context.colunhideleft[colnum] = unhide;
            newcol.appendChild(unhide);
         }
         if (colnum > 1 && sheetobj.colattribs.hide[SocialCalc.rcColname(colnum-1)] == "yes") {
            unhide = document.createElement("div");
            if (context.classnames) unhide.className=context.classnames.unhideright;
            if (context.explicitStyles) unhide.style.cssText=context.explicitStyles.unhideright;
            context.colunhideright[colnum] = unhide;
            newcol.appendChild(unhide);
         }

         // add resize bar
         var resizeBar = document.createElement('span');
         resizeBar.style.height = SocialCalc.Constants.defaultAssumedRowHeight + 'px';
         resizeBar.className = context.classnames.colresizebar;
         newcol.appendChild(resizeBar);

         result.appendChild(newcol);
         }
      if (colpane<context.colpanes.length-1) {
         newcol=document.createElement("td");
         newcol.width=context.defaultpanedividerwidth;
         if (context.classnames.panedivider) newcol.className=context.classnames.panedivider;
         if (context.explicitStyles.panedivider) newcol.style.cssText=context.explicitStyles.panedivider;
         result.appendChild(newcol);
         }
      }
   // eddy {
//   if(context.formColNames != null) {
//     for(var nodeIndex = 0;  nodeIndex < result.childNodes.length;  nodeIndex++ ) {
//       var currentCol = result.childNodes[nodeIndex];
//       if(context.formColNames[currentCol.innerText] != null) currentCol.innerText = context.formColNames[currentCol.innerText];
//     }
//   }
   // }
   return result;
   }

SocialCalc.RenderColGroup = function(context) {

   var colpane, colnum, newcol, t;
   var sheetobj=context.sheetobj;

   var result=document.createElement("colgroup");

   if (context.showRCHeaders) {
      newcol=document.createElement("col");
      newcol.width=context.rownamewidth;
      result.appendChild(newcol);
      }

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         newcol=document.createElement("col");
         if (sheetobj.colattribs.hide[SocialCalc.rcColname(colnum)] == "yes") {
            newcol.width="1";
            }
         else {
            t = context.colwidth[colnum];
            if (t) newcol.width=t;
            result.appendChild(newcol);
            }
         }
      if (colpane<context.colpanes.length-1) {
         newcol=document.createElement("col");
         newcol.width=context.defaultpanedividerwidth;
         result.appendChild(newcol);
         }
      }
   return result;
   }