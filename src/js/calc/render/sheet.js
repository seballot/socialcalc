//
// tableobj = SocialCalc.RenderSheet(context, oldtable, linkstyle)
//
// Renders a render context returning a DOM table object.
// If there is an oldtable object, it replaces it in the parent node.
// If oldtable is null, it just returns the new one.
// The linkstyle is "" or null for editing rendering
// and optionally an object passed on to formatting code.
//

SocialCalc.RenderSheet = function(context, oldtable, linkstyle) {

   var newrow, rowpane;
   var tableobj, colgroupobj, tbodyobj, parentnode;

   // do precompute stuff if necessary

   if (context.sheetobj.changedrendervalues) {
      context.needcellskip = true;
      context.needprecompute = true;
      context.sheetobj.changedrendervalues = false;
      }
   if (context.needcellskip) {
      context.CalculateCellSkipData();
      }
   if (context.needprecompute) {
      context.PrecomputeSheetFontsAndLayouts();
      }

   context.CalculateColWidthData(); // always make sure col width values are up to date
   context.CalculateRowHeightData();

   // make the table element and fill it in

   tableobj=document.createElement("table");
   context.InitializeTable(tableobj);

   colgroupobj=context.RenderColGroup();
   tableobj.appendChild(colgroupobj);

   tbodyobj=document.createElement("tbody");

   tbodyobj.appendChild(context.RenderSizingRow());

   if (context.showRCHeaders) {
      newrow=context.RenderColHeaders();
      if (newrow) tbodyobj.appendChild(newrow);
      }

   for (rowpane=0; rowpane<context.rowpanes.length; rowpane++) {
      for (rownum=context.rowpanes[rowpane].first;rownum<=context.rowpanes[rowpane].last;rownum++) {
         newrow=context.RenderRow(rownum, rowpane, linkstyle);
         tbodyobj.appendChild(newrow);
         }
      if (rowpane<context.rowpanes.length-1) {
         newrow=context.RenderSpacingRow();
         tbodyobj.appendChild(newrow);
         }
      }

   tableobj.appendChild(tbodyobj);

   if (oldtable) {
      parentnode = oldtable.parentNode;
      if (parentnode) parentnode.replaceChild(tableobj, oldtable);
      }

   return tableobj;

   }