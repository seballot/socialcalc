//
// GetEditorCellElement(editor, row, col)
//
// Returns an object with element, the table cell element in the DOM that corresponds to row and column,
// as well as rowpane and colpane, the panes with the cell.
// If no such element, then returns null;
//

SocialCalc.GetEditorCellElement = function(editor, row, col) {

  var headerColOffset = 0;
  var headerRowOffset = 0;
   //Adjust for row/col headers
   if (editor.context.showRCHeaders == false) {
     var headerColOffset = -1;
     var headerRowOffset = -1;
   }
   var rowpane, colpane, c, coord;
   var rowindex = 0;
   var colindex = 0;

   for (rowpane=0; rowpane<editor.context.rowpanes.length; rowpane++) {
      if (row >= editor.context.rowpanes[rowpane].first && row <= editor.context.rowpanes[rowpane].last) {
         for (colpane=0; colpane<editor.context.colpanes.length; colpane++) {
            if (col >= editor.context.colpanes[colpane].first && col <= editor.context.colpanes[colpane].last) {
               rowindex += row - editor.context.rowpanes[rowpane].first + 2;
               for (c=editor.context.colpanes[colpane].first; c<=col; c++) {
                  coord=editor.context.cellskip[SocialCalc.crToCoord(c,row)];
                  if (!coord || !editor.context.CoordInPane(coord, rowpane, colpane)) // don't count col-spanned cells
                     colindex++;
                  }
               return {
                  element: editor.griddiv.firstChild.lastChild.childNodes[rowindex +headerRowOffset].childNodes[colindex + headerColOffset],
                  rowpane: rowpane, colpane: colpane};
               }
            for (c=editor.context.colpanes[colpane].first; c<=editor.context.colpanes[colpane].last; c++) {
               coord=editor.context.cellskip[SocialCalc.crToCoord(c,row)];
               if (!coord || !editor.context.CoordInPane(coord, rowpane, colpane)) // don't count col-spanned cells
                  colindex++;
               }
            colindex += 1;
            }
         }
      rowindex += editor.context.rowpanes[rowpane].last - editor.context.rowpanes[rowpane].first + 1 + 1;
      }

   return null;
}



SocialCalc.EnsureECellVisible = function(editor) {

   var vamount = 0;
   var hamount = 0;

   if (editor.ecell.row > editor.lastnonscrollingrow) {
      if (editor.ecell.row < editor.firstscrollingrow) {
         vamount = editor.ecell.row - editor.firstscrollingrow - Math.floor((editor.lastvisiblerow - editor.firstscrollingrow)/2);
         }
      else if (editor.ecell.row + 1 > editor.lastvisiblerow) {
         vamount = editor.ecell.row - editor.lastvisiblerow + Math.floor((editor.lastvisiblerow - editor.firstscrollingrow)/2);
         }
      }
   if (editor.ecell.col > editor.lastnonscrollingcol) {
      if (editor.ecell.col < editor.firstscrollingcol) {
         hamount = editor.ecell.col - editor.firstscrollingcol - Math.floor((editor.lastvisiblecol - editor.firstscrollingcol)/2);
         }
      else if (editor.ecell.col + 1 > editor.lastvisiblecol) {
        hamount = editor.ecell.col- editor.lastvisiblecol + Math.floor((editor.lastvisiblecol - editor.firstscrollingcol)/2);
         }
      }

   if (vamount!=0 || hamount!=0) {
      editor.ScrollRelativeBoth(vamount, hamount);
      }
   else {
      editor.cellhandles.ShowCellHandles(true);
      }

   }

SocialCalc.ReplaceCell = function(editor, cell, row, col) {

   var newelement, a;
   if (!cell) return;
   newelement = editor.context.RenderCell(row, col, cell.rowpane, cell.colpane, true, null);
   if (newelement && cell.element) { // skip hidden cells
      // Don't use a real element and replaceChild, which seems to have focus issues with IE, Firefox, and speed issues
      cell.element.innerHTML = newelement.innerHTML;
      cell.element.style.cssText = "";
      cell.element.className = newelement.className;
      for (a in newelement.style) {
         if (newelement.style[a]!="cssText")
            cell.element.style[a] = newelement.style[a];
         }
      }
   }


SocialCalc.UpdateCellCSS = function(editor, cell, row, col) {

   var newelement, a;
   if (!cell) return;
   newelement = editor.context.RenderCell(row, col, cell.rowpane, cell.colpane, true, null);
   if (newelement) {
      cell.element.style.cssText = "";
      cell.element.className = newelement.className;
      for (a in newelement.style) {
         if (newelement.style[a]!="cssText")
            cell.element.style[a] = newelement.style[a];
         }
      }
   }


SocialCalc.SetECellHeaders = function(editor, selected) {

   // eddy SetECellHeaders {
   if(editor.context.showRCHeaders === false) return;
   // } SetECellHeaders
   var ecell = editor.ecell;
   var context = editor.context;

   var rowpane, colpane, first, last;
   var rowindex = 0;
   var colindex = 0;
   var headercell;

   if (!ecell) return;

   // Handle ecell on a hidden column/row.
   while (context.sheetobj.colattribs.hide[SocialCalc.rcColname(ecell.col)] == "yes") {
      ecell.col++;
      }
   while (context.sheetobj.rowattribs.hide[ecell.row] == "yes") {
      ecell.row++;
      }

   ecell.coord = SocialCalc.crToCoord(ecell.col, ecell.row);

   for (rowpane=0; rowpane<context.rowpanes.length; rowpane++) {
      first = context.rowpanes[rowpane].first;
      last = context.rowpanes[rowpane].last;
      if (ecell.row >= first && ecell.row <= last) {
         var i = 2+rowindex+ecell.row-first
         if (editor.fullgrid !== null && i >= 0) {
            headercell = editor.fullgrid.childNodes[1].childNodes[i].childNodes[0];
            if (headercell) {
               if (context.classnames) headercell.className=context.classnames[selected+"rowname"];
               if (context.explicitStyles) headercell.style.cssText=context.explicitStyles[selected+"rowname"];
               headercell.style.verticalAlign="top"; // to get around Safari making top of centered row number be
                                                     // considered top of row (and can't get <row> position in Safari)
               }
            }
         }
      rowindex += last - first + 1 + 1;
      }

   for (colpane=0; colpane<context.colpanes.length; colpane++) {
      first = context.colpanes[colpane].first;
      last = context.colpanes[colpane].last;
      if (ecell.col >= first && ecell.col <= last) {
         var i = 1+colindex+ecell.col-first
         if (editor.fullgrid !== null && i >= 0) {
            headercell = editor.fullgrid.childNodes[1].childNodes[1].childNodes[i];
            if (headercell) {
               if (context.classnames) headercell.className=context.classnames[selected+"colname"];
               if (context.explicitStyles) headercell.style.cssText=context.explicitStyles[selected+"colname"];
               }
            }
         }
      colindex += last - first + 1 + 1;
      }
   }

//
// ECellReadonly(editor, ecoord)
//
// Returns true if ecoord is readonly (or ecell if missing).
//

SocialCalc.ECellReadonly = function(editor, ecoord) {

   if (!ecoord && editor.ecell) {
      ecoord = editor.ecell.coord;
      }

   if (!ecoord) return false;

   var cell = editor.context.sheetobj.cells[ecoord];
   return cell && cell.readonly;

   }