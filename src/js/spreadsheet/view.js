//
// SocialCalc.DoOnResize(spreadsheet)
//
// Processes an onResize event, setting the different views.
//

SocialCalc.DoOnResize = function(spreadsheet) {

   var v;
   var views = spreadsheet.views;

   var needresize = spreadsheet.SizeSSDiv();
   if (!needresize) return;

   for (vname in views) {
      v = views[vname].element;
      v.style.width = spreadsheet.width + "px";
      v.style.height = (spreadsheet.height-spreadsheet.nonviewheight) + "px";
   }

   spreadsheet.editor.ResizeTableEditor(spreadsheet.width, spreadsheet.height-spreadsheet.nonviewheight);

}


//
// resized = SocialCalc.SizeSSDiv(spreadsheet)
//
// Figures out a reasonable size for the spreadsheet, given any requested values and viewport.
// Sets ssdiv to that.
// Return true if different than existing values.
//

SocialCalc.SizeSSDiv = function(spreadsheet) {

   var sizes, pos, resized, nodestyle, newval;
   var fudgefactorX = 0; // for IE
   var fudgefactorY = 0;

   resized = false;

   sizes = SocialCalc.GetViewportInfo();
   pos = SocialCalc.GetElementPosition(spreadsheet.parentNode);
   pos.bottom = 0;
   pos.right = 0;

   nodestyle = spreadsheet.parentNode.style;

   if (nodestyle.marginTop) {
      pos.top += nodestyle.marginTop.slice(0,-2)-0;
   }
   if (nodestyle.marginBottom) {
      pos.bottom += nodestyle.marginBottom.slice(0,-2)-0;
   }
   if (nodestyle.marginLeft) {
      pos.left += nodestyle.marginLeft.slice(0,-2)-0;
   }
   if (nodestyle.marginRight) {
      pos.right += nodestyle.marginRight.slice(0,-2)-0;
   }

   newval = spreadsheet.requestedHeight ||
            sizes.height - (pos.top + pos.bottom + fudgefactorY) -
               (spreadsheet.requestedSpaceBelow || 0);
   if (spreadsheet.height != newval) {
      spreadsheet.height = newval;
      spreadsheet.spreadsheetDiv.style.height = newval + "px";
      resized = true;
   }
   newval = spreadsheet.requestedWidth ||
            sizes.width - (pos.left + pos.right + fudgefactorX) || 700;
   if (spreadsheet.width != newval) {
      spreadsheet.width = newval;
      spreadsheet.spreadsheetDiv.style.width = newval + "px";
      resized = true;
   }

   spreadsheet.spreadsheetDiv.style.position = "relative";

   return resized;

}

//
// result = SocialCalc.SpreadsheetControlCreateSheetHTML(spreadsheet)
//
// Returns the HTML representation of the whole spreadsheet
//

SocialCalc.SpreadsheetControlCreateSheetHTML = function(spreadsheet) {

   var context, div, ele;

   var result = "";

   context = new SocialCalc.RenderContext(spreadsheet.sheet);
   div = document.createElement("div");
   ele = context.RenderSheet(null, {type: "html"});
   div.appendChild(ele);
   delete context;
   result = div.innerHTML;
   delete ele;
   delete div;
   return result;

}

//
// result = SocialCalc.SpreadsheetControlCreateCellHTML(spreadsheet, coord, linkstyle)
//
// Returns the HTML representation of a cell. Blank is "", not "&nbsp;".
//

SocialCalc.SpreadsheetControlCreateCellHTML = function(spreadsheet, coord, linkstyle) {

   var result = "";
   var cell = spreadsheet.sheet.cells[coord];

   if (!cell) return "";

   if (cell.displaystring == undefined) {
      result = SocialCalc.FormatValueForDisplay(spreadsheet.sheet, cell.datavalue, coord, (linkstyle || spreadsheet.context.defaultHTMLlinkstyle));
   }
   else {
      result = cell.displaystring;
   }

   if (result == "&nbsp;") result = "";

   return result;

}

//
// result = SocialCalc.SpreadsheetControlCreateCellHTMLSave(spreadsheet, range, linkstyle)
//
// Returns the HTML representation of a range of cells, or the whole sheet if range is null.
// The form is:
//    version:1.0
//    coord:cell-HTML
//    coord:cell-HTML
//    ...
//
// Empty cells are skipped. The cell-HTML is encoded with ":"=>"\c", newline=>"\n", and "\"=>"\b".
//

SocialCalc.SpreadsheetControlCreateCellHTMLSave = function(spreadsheet, range, linkstyle) {

   var cr1, cr2, row, col, coord, cell, cellHTML;
   var result = [];
   var prange;

   if (range) {
      prange = SocialCalc.ParseRange(range);
   }
   else {
      prange = {cr1: {row: 1, col:1},
                cr2: {row: spreadsheet.sheet.attribs.lastrow, col: spreadsheet.sheet.attribs.lastcol}};
   }
   cr1 = prange.cr1;
   cr2 = prange.cr2;

   result.push("version:1.0");

   for (row=cr1.row; row <= cr2.row; row++) {
      for (col=cr1.col; col <= cr2.col; col++) {
         coord = SocialCalc.crToCoord(col, row);
         cell=spreadsheet.sheet.cells[coord];
         if (!cell) continue;
         if (cell.displaystring == undefined) {
            cellHTML = SocialCalc.FormatValueForDisplay(spreadsheet.sheet, cell.datavalue, coord, (linkstyle || spreadsheet.context.defaultHTMLlinkstyle));
         }
         else {
            cellHTML = cell.displaystring;
         }
         if (cellHTML == "&nbsp;") continue;
         result.push(coord+":"+SocialCalc.encodeForSave(cellHTML));
      }
   }

   result.push(""); // one extra to get extra \n
   return result.join("\n");
}
