// ScrollRelative(editor, vertical, amount)
//
// If vertical true, scrolls up(-)/down(+), else left(-)/right(+)

SocialCalc.ScrollRelative = function(editor, vertical, amount) {

   if (vertical) {
      editor.ScrollRelativeBoth(amount, 0);
   }
   else {
      editor.ScrollRelativeBoth(0, amount);
   }
   return;

}

// ScrollRelativeBoth(editor, vamount, hamount)
//
// Does both with one render

SocialCalc.ScrollRelativeBoth = function(editor, vamount, hamount) {

   var context=editor.context;
   var dv = vamount > 0 ? 1 : -1, dh = hamount > 0 ? 1 : -1;

   var vplen=context.rowpanes.length;
   var vlimit = vplen>1 ? context.rowpanes[vplen-2].last+1 : 1; // don't scroll past here
   if (context.rowpanes[vplen-1].first+vamount < vlimit) { // limit amount
      vamount = (-context.rowpanes[vplen-1].first) + vlimit;
   }

   var hplen=context.colpanes.length;
   var hlimit = hplen>1 ? context.colpanes[hplen-2].last+1 : 1; // don't scroll past here
   if (context.colpanes[hplen-1].first+hamount < hlimit) { // limit amount
      hamount = (-context.colpanes[hplen-1].first) + hlimit;
   }

   // Handle hidden column by finding a next one that's not hidden.
   while (context.sheetobj.colattribs.hide[SocialCalc.rcColname(context.colpanes[hplen-1].first+hamount)] == "yes") {
      hamount += dh;
      if (hamount < 1) {
         hamount = 0;
         break;
      }
   }

   // Handle hidden row by finding a next one that's not hidden.
   while (context.sheetobj.rowattribs.hide[context.rowpanes[vplen-1].first+vamount] == "yes") {
      vamount += dv;
      if (vamount < 1) {
         vamount = 0;
         break;
      }
   }

   if ((vamount==1 || vamount==-1) && hamount==0) { // special case quick scrolls
      if (vamount==1) {
         editor.ScrollTableUpOneRow();
      }
      else {
         editor.ScrollTableDownOneRow();
      }
      if (editor.ecell) editor.SetECellHeaders("selected");
      editor.SchedulePositionCalculations();
      return;
   }

   // Do a gross move and render

   if (vamount!=0 || hamount!=0) {
      context.rowpanes[vplen-1].first += vamount;
      context.rowpanes[vplen-1].last += vamount;
      context.colpanes[hplen-1].first += hamount;
      context.colpanes[hplen-1].last += hamount;
      editor.LimitLastPanes();
      editor.FitToEditTable();
      editor.ScheduleRender();
   }

}


// PageRelative(editor, vertical, direction)
//
// If vertical true, pages up(direction is -)/down(+), else left(-)/right(+)

SocialCalc.PageRelative = function(editor, vertical, direction) {

   var context=editor.context;
   var panes=vertical ? "rowpanes" : "colpanes";
   var lastpane=context[panes][context[panes].length-1];
   var lastvisible=vertical ? "lastvisiblerow" : "lastvisiblecol";
   var sizearray=vertical ? editor.rowheight : editor.colwidth;
   var defaultsize=vertical ? SocialCalc.Constants.defaultAssumedRowHeight : SocialCalc.Constants.defaultColWidth;
   var size, newfirst, totalsize, current;

   if (direction > 0) { // down/right
      newfirst = editor[lastvisible];
      if (newfirst == lastpane.first) newfirst += 1; // move at least one
   }
   else {
      if (vertical) { // calculate amount to scroll
         totalsize = editor.tableheight - (editor.firstscrollingrowtop - editor.gridposition.top);
      }
      else {
         totalsize = editor.tablewidth - (editor.firstscrollingcolleft - editor.gridposition.left);
      }
      totalsize -= sizearray[editor[lastvisible]] > 0 ? sizearray[editor[lastvisible]] : defaultsize;

      for (newfirst=lastpane.first-1; newfirst>0; newfirst--) {
         size = sizearray[newfirst] > 0 ? sizearray[newfirst] : defaultsize;
         if (totalsize < size) break;
         totalsize -= size;
      }

      current = lastpane.first;
      if (newfirst >= current) newfirst = current-1; // move at least 1
      if (newfirst < 1) newfirst = 1;
   }

   lastpane.first = newfirst;
   lastpane.last = newfirst+1;
   editor.LimitLastPanes();
   editor.FitToEditTable();
   editor.ScheduleRender();

}



SocialCalc.ScrollTableUpOneRow = function(editor) {

   var toprow, rowpane, rownum, colnum, colpane, cell, oldrownum, maxspan, newbottomrow, newrow, oldchild, bottomrownum;
   var rowneedsrefresh={};

   var context=editor.context;
   var sheetobj=context.sheetobj;
   var tableobj=editor.fullgrid;

   var tbodyobj;

   tbodyobj=tableobj.lastChild;

   toprow = context.showRCHeaders ? 2 : 1;
   for (rowpane=0; rowpane<context.rowpanes.length-1; rowpane++) {
      toprow += context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 2; // skip pane and spacing row
   }

   // abort if scrolling beyond user max row
   if (context.sheetobj.attribs.usermaxrow && (context.sheetobj.attribs.usermaxrow - context.rowpanes[rowpane].first < 1)) {
      return tableobj;
   }

   tbodyobj.removeChild(tbodyobj.childNodes[toprow]);

   context.rowpanes[rowpane].first++;
   context.rowpanes[rowpane].last++;
   editor.FitToEditTable();
   context.CalculateColWidthData(); // Just in case, since normally done in RenderSheet

   if (!context.sheetobj.attribs.usermaxrow || context.rowpanes[rowpane].last != context.sheetobj.attribs.usermaxrow) {
      newbottomrow = context.RenderRow(context.rowpanes[rowpane].last, rowpane);
      tbodyobj.appendChild(newbottomrow);
   }

   // if scrolled off a row with starting rowspans, replace rows for the largest rowspan

   maxrowspan = 1;
   oldrownum=context.rowpanes[rowpane].first - 1;

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         coord=SocialCalc.crToCoord(colnum, oldrownum);
         if (context.cellskip[coord]) continue;
         cell=sheetobj.cells[coord];
         if (cell && cell.rowspan>maxrowspan) maxrowspan=cell.rowspan;
      }
   }

   if (maxrowspan>1) {
      for (rownum=1; rownum<maxrowspan; rownum++) {
         if (rownum+oldrownum >= context.rowpanes[rowpane].last) break;
         newrow=context.RenderRow(rownum+oldrownum, rowpane);
         oldchild=tbodyobj.childNodes[toprow+rownum-1];
         tbodyobj.replaceChild(newrow,oldchild);
      }
   }

   // if added a row that includes rowspans from above, update the size of those to include new row

   bottomrownum=context.rowpanes[rowpane].last;

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         coord=context.cellskip[SocialCalc.crToCoord(colnum, bottomrownum)];
         if (!coord) continue; // only look at spanned cells
         rownum=context.coordToCR[coord].row-0;
         if (rownum==context.rowpanes[rowpane].last ||
             rownum<context.rowpanes[rowpane].first) continue; // this row (colspan) or starts above pane
         cell=sheetobj.cells[coord];
         if (cell && cell.rowspan>1) rowneedsrefresh[rownum]=true; // remember row num to update
      }
   }

   for (rownum in rowneedsrefresh) {
      newrow=context.RenderRow(rownum, rowpane);
      oldchild=tbodyobj.childNodes[(toprow+(rownum-context.rowpanes[rowpane].first))];
      tbodyobj.replaceChild(newrow,oldchild);
   }

   return tableobj;
}

SocialCalc.ScrollTableDownOneRow = function(editor) {

   var toprow, rowpane, rownum, colnum, colpane, cell, newrownum, maxspan, newbottomrow, newrow, oldchild, bottomrownum;
   var rowneedsrefresh={};

   var context=editor.context;
   var sheetobj=context.sheetobj;
   var tableobj=editor.fullgrid;

   var tbodyobj;

   tbodyobj=tableobj.lastChild;

   toprow = context.showRCHeaders ? 2 : 1;
   for (rowpane=0; rowpane<context.rowpanes.length-1; rowpane++) {
      toprow += context.rowpanes[rowpane].last - context.rowpanes[rowpane].first + 2; // skip pane and spacing row
   }

   if (!context.sheetobj.attribs.usermaxrow) {
      tbodyobj.removeChild(tbodyobj.childNodes[toprow+(context.rowpanes[rowpane].last-context.rowpanes[rowpane].first)]);
   }

   context.rowpanes[rowpane].first--;
   context.rowpanes[rowpane].last--;
   editor.FitToEditTable();
   context.CalculateColWidthData(); // Just in case, since normally done in RenderSheet

   newrow = context.RenderRow(context.rowpanes[rowpane].first, rowpane);
   tbodyobj.insertBefore(newrow, tbodyobj.childNodes[toprow]);

   // if inserted a row with starting rowspans, replace rows for the largest rowspan

   maxrowspan = 1;
   newrownum=context.rowpanes[rowpane].first;

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         coord=SocialCalc.crToCoord(colnum, newrownum);
         if (context.cellskip[coord]) continue;
         cell=sheetobj.cells[coord];
         if (cell && cell.rowspan>maxrowspan) maxrowspan=cell.rowspan;
      }
   }

   if (maxrowspan>1) {
      for (rownum=1; rownum<maxrowspan; rownum++) {
         if (rownum+newrownum > context.rowpanes[rowpane].last) break;
         newrow=context.RenderRow(rownum+newrownum, rowpane);
         oldchild=tbodyobj.childNodes[toprow+rownum];
         tbodyobj.replaceChild(newrow,oldchild);
      }
   }

   // if last row now includes rowspans or rowspans from above, update the size of those to remove deleted row

   bottomrownum=context.rowpanes[rowpane].last;

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      for (colnum=context.colpanes[colpane].first; colnum<=context.colpanes[colpane].last; colnum++) {
         coord=SocialCalc.crToCoord(colnum, bottomrownum);
         cell=sheetobj.cells[coord];
         if (cell && cell.rowspan>1) {
            rowneedsrefresh[bottomrownum]=true; // need to update this row
            continue;
         }
         coord=context.cellskip[SocialCalc.crToCoord(colnum, bottomrownum)];
         if (!coord) continue; // only look at spanned cells
         rownum=context.coordToCR[coord].row-0;
         if (rownum==bottomrownum ||
             rownum<context.rowpanes[rowpane].first) continue; // this row (colspan) or starts above pane
         cell=sheetobj.cells[coord];
         if (cell && cell.rowspan>1) rowneedsrefresh[rownum]=true; // remember row num to update
      }
   }

   for (rownum in rowneedsrefresh) {
      newrow=context.RenderRow(rownum, rowpane);
      oldchild=tbodyobj.childNodes[(toprow+(rownum-context.rowpanes[rowpane].first))];
      tbodyobj.replaceChild(newrow,oldchild);
   }

   return tableobj;
}
