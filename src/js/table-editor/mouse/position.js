//
// GridMousePosition(editor, clientX, clientY)
//
// Returns an object with row and col numbers and coord (spans handled for coords),
// and rowheader/colheader true if in header (where coord will be undefined).
// If in colheader, will return coltoresize if on appropriate place in col header.
// Also, there is rowfooter (on right) and colfooter (on bottom).
// In row/col header/footer, returns "distance" as pixels over the edge.
//

SocialCalc.GridMousePosition = function(editor, clientX, clientY) {

   var row, rowpane, col, colpane, rowtoresize, coltoresize;
   var result = {};

   for (row=1; row<editor.rowpositions.length; row++) {
      if (!editor.rowheight[row]) continue; // not rendered yet -- may be above or below us
      if (editor.rowpositions[row]+editor.rowheight[row]>clientY) {
         break;
         }
      }
   for (col=1; col<editor.colpositions.length; col++) {
      if (!editor.colwidth[col]) continue;
      if (editor.colpositions[col]+editor.colwidth[col]>clientX) {
         break;
         }
      }

   result.row = row;
   result.col = col;

   if (editor.headposition && SocialCalc._app != true)  {

      if (clientX < editor.headposition.left) {
         result.rowheader = true;
         result.distance = editor.headposition.left - clientX;
         result.rowtoresize = false;
         result.rowselect = false;

         // resize bar
         for (rowtoresize=1; rowtoresize<editor.rowpositions.length; rowtoresize++) {
            if (!editor.rowheight[rowtoresize]) continue;
            if (((editor.rowpositions[rowtoresize] + editor.rowheight[rowtoresize]) - 3) <= clientY
               && ((editor.rowpositions[rowtoresize] + editor.rowheight[rowtoresize]) + 3) >= clientY) {
               result.rowtoresize = rowtoresize;
               break;
            }
         }

         // Handle unhide row.
         if (unhide = editor.context.rowunhidetop[row]) {
           pos = SocialCalc.GetElementPosition(unhide);
           if (clientX >= pos.left && clientX < pos.left+unhide.offsetWidth
               && clientY >= (editor.rowpositions[row] + editor.rowheight[row] - unhide.offsetHeight)
               && clientY < (editor.rowpositions[row] + editor.rowheight[row])) {
             result.rowtounhide = row+1;
           }
         }
         if (unhide = editor.context.rowunhidebottom[row]) {
           pos = SocialCalc.GetElementPosition(unhide);
           if (clientX >= pos.left && clientX < pos.left+unhide.offsetWidth
               && clientY >= (editor.rowpositions[row])
               && clientY < (editor.rowpositions[row] + unhide.offsetHeight)) {
             result.rowtounhide = row-1;
           }
         }
         if(result.rowtounhide == null) {  //if unhide then ignore row select & resize
           for (rowpane=0; rowpane<editor.context.rowpanes.length; rowpane++) {
             if (result.rowtoresize >= editor.context.rowpanes[rowpane].first &&
               result.rowtoresize <= editor.context.rowpanes[rowpane].last) { // visible column
               return result;
             }
           }
           result.rowselect = true;
         }
         delete result.rowtoresize;
         return result;
         }
      else if (clientY < editor.headposition.top /*&& clientY > editor.gridposition.top*/) { // > because of sizing row
         result.colheader = true;
         result.distance = editor.headposition.top - clientY;
         result.coltoresize = false;
         result.colselect = false;

         // resize bar
         for (coltoresize=1; coltoresize<editor.colpositions.length; coltoresize++) {
            if (!editor.colwidth[coltoresize]) continue;
            if (((editor.colpositions[coltoresize] + editor.colwidth[coltoresize]) - 3) <= clientX
               && ((editor.colpositions[coltoresize] + editor.colwidth[coltoresize]) + 3) >= clientX) {
               result.coltoresize = coltoresize;
               break;
            }
         }

         // Handle unhide column.
         if (unhide = editor.context.colunhideleft[col]) {
            pos = SocialCalc.GetElementPosition(unhide);
            if (clientX >= pos.left && clientX < pos.left+unhide.offsetWidth && clientY >= pos.top  && clientY < pos.top+unhide.offsetHeight) {
               result.coltounhide = col+1;
               }
            }
         if (unhide = editor.context.colunhideright[col]) {
            pos = SocialCalc.GetElementPosition(unhide);
            if (clientX >= pos.left && clientX < pos.left+unhide.offsetWidth && clientY >= pos.top  && clientY < pos.top+unhide.offsetHeight) {
               result.coltounhide = col-1;
               }
            }

         if(result.coltounhide == null) {  //if unhide then ignore col select & resize
           for (colpane=0; colpane<editor.context.colpanes.length; colpane++) {
              if (result.coltoresize >= editor.context.colpanes[colpane].first &&
                  result.coltoresize <= editor.context.colpanes[colpane].last) { // visible column
                 return result;
                 }
              }
           result.colselect = true;
           }
         delete result.coltoresize;
         return result;
         }
      else {
         result.coord = SocialCalc.crToCoord(result.col, result.row);
         if (editor.context.cellskip[result.coord]) { // handle skipped cells
            result.coord = editor.context.cellskip[result.coord];
            }
         return result;
         }
      }

   return null;

   }