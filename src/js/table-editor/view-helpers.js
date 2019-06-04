//
// FitToEditTable(editor)
//
// Figure out (through column width declarations and approximation of pixels per row)
// how many rendered rows and columns you need to be at least a little larger than
// the editor's editing area.
//

SocialCalc.FitToEditTable = function(editor) {

   var colnum, colname, colwidth, totalwidth, totalrows, rownum, rowpane, needed;

   var context=editor.context;
   var sheetobj=context.sheetobj;
   var sheetcolattribs=sheetobj.colattribs;

   // Calculate column width data

   totalwidth=context.showRCHeaders ? context.rownamewidth-0 : 0;
   for (colpane=0; colpane<context.colpanes.length-1; colpane++) { // Get width of all but last pane
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         colname=SocialCalc.rcColname(colnum);
         if (sheetobj.colattribs.hide[colname] != "yes") {
            colwidth = sheetobj.colattribs.width[colname] || sheetobj.attribs.defaultcolwidth || SocialCalc.Constants.defaultColWidth;
            if (colwidth=="blank" || colwidth=="auto") colwidth="";
            totalwidth+=(colwidth && ((colwidth-0)>0)) ? (colwidth-0) : 10;
            }
         }
      }

   for (colnum=context.colpanes[colpane].first; colnum<=10000; colnum++) { //!!! max for safety, but makes that col max!!!
      colname=SocialCalc.rcColname(colnum);
      if (sheetobj.colattribs.hide[colname] != "yes") {
         colwidth = sheetobj.colattribs.width[colname] || sheetobj.attribs.defaultcolwidth || SocialCalc.Constants.defaultColWidth;
         if (colwidth=="blank" || colwidth=="auto") colwidth="";
         totalwidth+=(colwidth && ((colwidth-0)>0)) ? (colwidth-0) : 10;
         }
      if (totalwidth > editor.tablewidth) break;
      }

   context.colpanes[colpane].last = context.sheetobj.attribs.usermaxcol || colnum;

   // Calculate row height data

   // find first visible row - Bug fix when many rows hidden - as PANEL formula hides many rows
   var firstRow = context.rowpanes[0].first;
   var lastRow = context.sheetobj.attribs.lastrow;
   while(sheetobj.rowattribs.hide[firstRow] == "yes" && firstRow <lastRow) firstRow++;
   context.rowpanes[0].first = firstRow;

   // count visible rows in pane(s)
   totalrows=context.showRCHeaders ? 1 : 0;
   for (rowpane=0; rowpane<context.rowpanes.length-1; rowpane++) { // count all panes but last one
      totalrows += context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 1;
      for (rownum=context.rowpanes[rowpane].first; rownum<=context.rowpanes[rowpane].last; rownum++) {
         if (sheetobj.rowattribs.hide[rownum] == "yes") {
            totalrows--;
            }
         }
      }

   needed = editor.tableheight - totalrows * context.pixelsPerRow; // estimate amount needed

   context.rowpanes[rowpane].last = context.sheetobj.attribs.usermaxrow || context.rowpanes[rowpane].first + Math.floor(needed / context.pixelsPerRow) - 2;

   }

//
// CalculateEditorPositions(editor)
//
// Calculate the screen positions and other values of various editing elements
// These values change and need to be recomputed when the pane first/last or cell contents change,
// as well as new column widths, etc.
//
// Note: Only call this after the grid has been rendered! You may have to wait for a timeout...
//

SocialCalc.CalculateEditorPositions = function(editor) {

   var rowpane, colpane, i;

   editor.gridposition = SocialCalc.GetElementPosition(editor.griddiv);

   var tabletopLeftCorner = $(editor.griddiv).find('tbody').children()[1].childNodes[0]; // 2nd tr 1st td
   editor.headposition = {left: tabletopLeftCorner.offsetWidth, top: tabletopLeftCorner.offsetHeight};

   editor.rowpositions = [];
   for (rowpane=0; rowpane<editor.context.rowpanes.length; rowpane++) {
      editor.CalculateRowPositions(rowpane, editor.rowpositions, editor.rowheight);
      }
   for (i=0; i<editor.rowpositions.length; i++) {
      if (editor.rowpositions[i]>editor.gridposition.top+editor.tableheight) break;
      }
   editor.lastvisiblerow = i-1;
   editor.colpositions = [];
   for (colpane=0; colpane<editor.context.colpanes.length; colpane++) {
      editor.CalculateColPositions(colpane, editor.colpositions, editor.colwidth);
      }
   for (i=0; i<editor.colpositions.length; i++) {
      if (editor.colpositions[i]>editor.gridposition.left+editor.tablewidth) break;
      }
   editor.lastvisiblecol = i-1;

   editor.firstscrollingrow = editor.context.rowpanes[editor.context.rowpanes.length-1].first;
   while (editor.context.sheetobj.rowattribs.hide[editor.firstscrollingrow] == "yes") {
      editor.firstscrollingrow++;
      }
   editor.firstscrollingrowtop = editor.rowpositions[editor.firstscrollingrow] || editor.headposition.top;
   editor.lastnonscrollingrow = editor.context.rowpanes.length-1 > 0 ?
         editor.context.rowpanes[editor.context.rowpanes.length-2].last : 0;
   editor.firstscrollingcol = editor.context.colpanes[editor.context.colpanes.length-1].first;
   while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(editor.firstscrollingcol)] == "yes") {
      editor.firstscrollingcol++;
      }
   editor.firstscrollingcolleft = editor.colpositions[editor.firstscrollingcol] || editor.headposition.left;
   editor.lastnonscrollingcol = editor.context.colpanes.length-1 > 0 ?
         editor.context.colpanes[editor.context.colpanes.length-2].last : 0;

   // Now do the table controls

   editor.verticaltablecontrol.ComputeTableControlPositions();
   editor.horizontaltablecontrol.ComputeTableControlPositions();
   }

// LimitLastPanes(editor)
//
// Makes sure that the "first" of the last panes isn't before the last of the previous pane
//

SocialCalc.LimitLastPanes = function(editor) {

   var context=editor.context;
   var plen;

   plen = context.rowpanes.length;
   if (plen>1 && context.rowpanes[plen-1].first <= context.rowpanes[plen-2].last)
       context.rowpanes[plen-1].first = context.rowpanes[plen-2].last+1;
   if (context.sheetobj.attribs.usermaxrow && context.rowpanes[plen-1].first > context.sheetobj.attribs.usermaxrow)
       context.rowpanes[plen-1].first = context.sheetobj.attribs.usermaxrow;

   plen = context.colpanes.length;
   if (plen>1 && context.colpanes[plen-1].first <= context.colpanes[plen-2].last)
       context.colpanes[plen-1].first = context.colpanes[plen-2].last+1;
   if (context.sheetobj.attribs.usermaxcol && context.colpanes[plen-1].first > context.sheetobj.attribs.usermaxcol)
       context.colpanes[plen-1].first = context.sheetobj.attribs.usermaxcol;

   }