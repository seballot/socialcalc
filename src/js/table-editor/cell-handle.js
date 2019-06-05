// *************************************
//
// CellHandles class:
//
// This object creates and controls the elements around the cursor cell for dragging, etc.
//
// *************************************

SocialCalc.CellHandles = function(editor) {

   if (editor.noEdit) return; // leave us with nothing

   this.editor = editor; // the TableEditor this belongs to
   this.noCursorSuffix = false;
   this.movedmouse = false; // used to detect no-op

   this.draghandle = editor.$appContainer.find(".drag-handle")[0];
   this.dragpalette = editor.$appContainer.find(".drag-palette")[0];
   this.dragtooltip = editor.$appContainer.find(".drag-tooltip")[0];

   this.draghandle.addEventListener("mousemove", SocialCalc.CellHandlesMouseMoveOnHandle, false);
   this.draghandle.addEventListener("mousedown", SocialCalc.CellHandlesMouseDown, false);
   this.dragpalette.addEventListener("mousedown", SocialCalc.CellHandlesMouseDown, false);
   this.dragpalette.addEventListener("mousemove", SocialCalc.CellHandlesMouseMoveOnHandle, false);
}

// Methods:

SocialCalc.CellHandles.prototype.ShowCellHandles = function(show, showActions, animate) {

   var cell, cell2, position, position2;
   var editor = this.editor;
   var doshow = false;
   var row, col;
   var colinc = 1, rowinc = 1;

   if (!editor) return;
   if (!editor.ecell) return;

   do { // a block that you can "break" out of easily

      if (!show) break;

      row = editor.ecell.row;
      col = editor.ecell.col;

      if (editor.state != "start") break;
      if (row >= editor.lastvisiblerow) break;
      if (col >= editor.lastvisiblecol) break;
      if (row < editor.firstscrollingrow) break;
      if (col < editor.firstscrollingcol) break;

      // Go beyond one column if hidden.
      while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col+colinc)] == "yes") colinc++;
      // Go beyond one row if hidden.
      while (editor.context.sheetobj.rowattribs.hide[row+rowinc] == "yes") rowinc++;

      // Check colspan and rowspan.
      cell = editor.context.sheetobj.cells[SocialCalc.crToCoord(col+colinc-1, row+rowinc-1)];
      if (typeof cell != "undefined") {
         colinc += (cell.colspan || 1) - 1;
         rowinc += (cell.rowspan || 1) - 1;
      }

      this.draghandle.style.left = (editor.colpositions[col+colinc]-3)+"px";
      this.draghandle.style.top = (editor.rowpositions[row+rowinc]-3)+"px";
      this.draghandle.style.display = "block";

      if (showActions) {
         this.dragpalette.style.left = (editor.colpositions[col+colinc])+"px";
         this.dragpalette.style.top = (editor.rowpositions[row+rowinc])+"px";
         $(this.dragpalette).fadeIn(250);
      }

      doshow = true;

   }
   while (false); // only do once

   if (!doshow)
      this.draghandle.style.display = "none";
   if (!showActions) {
      if (animate) $(this.dragpalette).fadeOut(700);
      else this.dragpalette.style.display = "none";
   }

}

SocialCalc.CellHandles.prototype.DisplayTooltip = function(clientX, clientY) {

   this.dragtooltip.style.left = (clientX + 18)+"px";
   this.dragtooltip.style.top = (clientY)+"px";
   this.dragtooltip.innerHTML = SocialCalc.Constants.s_CHindicatorOperationLookup[this.dragtype];
   this.dragtooltip.style.display = "block";
}

SocialCalc.CellHandlesMouseMoveOnHandle = function(e) {

   var scc = SocialCalc.Constants;

   var event = e || window.event;
   var target = event.target || event.srcElement

   var editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
   if (!editor) return true; // we're not handling it -- let browser do default
   var cellhandles = editor.cellhandles;
   if (!cellhandles.editor) return true; // no handles

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;

   if (!editor.cellhandles.mouseDown) {
      editor.cellhandles.ShowCellHandles(true, true); // show actions

      if (cellhandles.timer) window.clearTimeout(cellhandles.timer);
      cellhandles.timer = window.setTimeout(SocialCalc.CellHandlesHoverTimeout, 1500);
   }

   return;
}

SocialCalc.CellHandlesHoverTimeout = function() {

   editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
   if (!editor) return true; // we're not handling it -- let browser do default
   var cellhandles = editor.cellhandles;
   if (cellhandles.timer) {
      window.clearTimeout(cellhandles.timer);
      cellhandles.timer = null;
   }
   editor.cellhandles.ShowCellHandles(true, false, true); // hide action with animation

}

SocialCalc.CellHandlesMouseDown = function(e) {

   var scc = SocialCalc.Constants;
   var editor, result, coord, textarea, wval, range;

   var event = e || window.event;

   var mouseinfo = SocialCalc.EditorMouseInfo;

   editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
   if (!editor) return true; // we're not handling it -- let browser do default

   if (editor.busy) return; // don't do anything when busy (is this correct?)

   var cellhandles = editor.cellhandles;

   cellhandles.movedmouse = false; // detect no-op

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;

   if (cellhandles.timer) window.clearTimeout(cellhandles.timer);

   range = editor.range;

   var event = e || window.event;
   var target = event.target || event.srcElement

   mouseinfo.ignore = true; // stop other code from looking at the mouse

   cellhandles.dragtype = $(target).data('action');
   cellhandles.filltype = null;

   if (!range.hasrange) editor.RangeAnchor();
   editor.range2.top = editor.range.top;
   editor.range2.right = editor.range.right;
   editor.range2.bottom = editor.range.bottom;
   editor.range2.left = editor.range.left;
   editor.range2.hasrange = true;

   if (cellhandles.dragtype.indexOf("Fill") < 0) editor.RangeRemove();

   cellhandles.DisplayTooltip(clientX, clientY);
   cellhandles.ShowCellHandles(false, false, false); // hide move handles
   cellhandles.mouseDown = true;

   mouseinfo.editor = editor; // remember for later

   coord = editor.ecell.coord; // start with cell with handles

   cellhandles.startingcoord = coord;
   cellhandles.startingX = clientX;
   cellhandles.startingY = clientY;

   mouseinfo.mouselastcoord = coord;

   SocialCalc.KeyboardSetFocus(editor);

   if (document.addEventListener) { // DOM Level 2 -- Firefox, et al
      document.addEventListener("mousemove", SocialCalc.CellHandlesMouseMove, true); // capture everywhere
      document.addEventListener("mouseup", SocialCalc.CellHandlesMouseUp, true); // capture everywhere
   }
   else if (cellhandles.draghandle.attachEvent) { // IE 5+
      cellhandles.draghandle.setCapture();
      cellhandles.draghandle.attachEvent("onmousemove", SocialCalc.CellHandlesMouseMove);
      cellhandles.draghandle.attachEvent("onmouseup", SocialCalc.CellHandlesMouseUp);
      cellhandles.draghandle.attachEvent("onlosecapture", SocialCalc.CellHandlesMouseUp);
  }
   SocialCalc.StopPropagation(event);
   return;

}

SocialCalc.CellHandlesMouseMove = function(e) {

   var scc = SocialCalc.Constants;
   var editor, element, result, coord, now, textarea, sheetobj, cellobj, wval;
   var crstart, crend, cr, c, r;

   var event = e || window.event;

   var mouseinfo = SocialCalc.EditorMouseInfo;
   editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore
   var cellhandles = editor.cellhandles;

   element = mouseinfo.element;

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;
   result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with move
   if (!result) return;

   if (result && !result.coord) {
      SocialCalc.SetDragAutoRepeat(editor, result, SocialCalc.CellHandlesDragAutoRepeat);
      return;
   }

   SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

   if (!result.coord) return;

   crstart = SocialCalc.coordToCr(editor.cellhandles.startingcoord);
   crend = SocialCalc.coordToCr(result.coord);


   cellhandles.movedmouse = true; // did move, so not no-op

   switch (cellhandles.dragtype) {
      case "Fill":
      case "FillC":
         var diffRow = Math.abs(crend.row - crstart.row)
         var diffCol = Math.abs(crend.col - crstart.col)
         cellhandles.filltype = diffRow > diffCol ? "Vertical" : "Horizontal";

         if (cellhandles.filltype == "Vertical") // coerse to that
            crend.col = crstart.col;
         else
            crend.row = crstart.row;

         result.coord = SocialCalc.crToCoord(crend.col, crend.row);
         if (result.coord != mouseinfo.mouselastcoord) {
            editor.MoveECell(result.coord);
            editor.RangeExtend();
         }
         break;

      case "Move":
      case "MoveC":
         if (result.coord != mouseinfo.mouselastcoord) {
            editor.MoveECell(result.coord);
            c = editor.range2.right - editor.range2.left + result.col;
            r = editor.range2.bottom - editor.range2.top + result.row;
            editor.RangeAnchor(SocialCalc.crToCoord(c, r));
            editor.RangeExtend();
         }
         break;

      case "MoveI":
      case "MoveIC":
         var diffRow = Math.abs(crend.row - crstart.row)
         var diffCol = Math.abs(crend.col - crstart.col)
         if (diffRow == 0 && diffCol == 0) cellhandles.filltype = null;
         else {
            cellhandles.filltype = diffRow > diffCol ? "Vertical" : "Horizontal";
            if (cellhandles.filltype == "Vertical") { // coerse to that
               editor.context.cursorsuffix = "insertup";
               crend.col = editor.range2.left;
               if (crend.row>=editor.range2.top && crend.row<=editor.range2.bottom+1) crend.row = editor.range2.bottom+2;
            }
            else {
               editor.context.cursorsuffix = "insertleft";
               crend.row = editor.range2.top;
               if (crend.col>=editor.range2.left && crend.col<=editor.range2.right+1) crend.col = editor.range2.right+2;
            }
         }
         result.coord = SocialCalc.crToCoord(crend.col, crend.row);
         if (result.coord != mouseinfo.mouselastcoord) {
            editor.MoveECell(result.coord);
            if (!cellhandles.filltype) editor.RangeRemove();
            else {
               c = editor.range2.right - editor.range2.left + crend.col;
               r = editor.range2.bottom - editor.range2.top + crend.row;
               editor.RangeAnchor(SocialCalc.crToCoord(c, r));
               editor.RangeExtend();
            }
         }
         break;

   }

   cellhandles.DisplayTooltip(clientX, clientY);
   cellhandles.ShowCellHandles(false, false, false);

   mouseinfo.mouselastcoord = result.coord;
   SocialCalc.StopPropagation(event);
   return;
}


SocialCalc.CellHandlesMouseUp = function(e) {

   var editor, element, result, coord, now, textarea, sheetobj, cellobj, wval, cstr, cmdtype, cmdtype2;
   var crstart, crend;
   var sizec, sizer, deltac, deltar;

   var event = e || window.event;

   var mouseinfo = SocialCalc.EditorMouseInfo;
   editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore
   var cellhandles = editor.cellhandles;

   element = mouseinfo.element;

   mouseinfo.ignore = false;

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;
   result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with up

   SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

   cellhandles.mouseDown = false;
   cellhandles.noCursorSuffix = false;

   cellhandles.dragtooltip.style.display = "none";
   editor.context.cursorsuffix = "";

   if (!result) result = {};
   if (!result.coord) result.coord = editor.ecell.coord;

   switch (cellhandles.dragtype) {
      case "Fill":
      case "Move":
      case "MoveI":
         cmdtype2 = " all";
            break;
      case "FillC":
      case "MoveC":
      case "MoveIC":
         cmdtype2 = " formulas";
         break;
   }

   if (!cellhandles.movedmouse) cellhandles.dragtype = "Nothing"; // didn't move: just leave one cell selected

   switch (cellhandles.dragtype) {
      case "Nothing":
         editor.Range2Remove();
         editor.RangeRemove();
         break;

      case "Fill":
      case "FillC":

         crstart = SocialCalc.coordToCr(cellhandles.startingcoord);
         crend = SocialCalc.coordToCr(result.coord);
         if (cellhandles.filltype) {
            if (cellhandles.filltype == "Vertical") crend.col = crstart.col;
            else crend.row = crstart.row;
         }
         result.coord = SocialCalc.crToCoord(crend.col, crend.row);

         editor.MoveECell(result.coord);
         editor.RangeExtend();

         if (editor.cellhandles.filltype == "Horizontal")
            cmdtype = crend.col > crstart.col ? "right" : "left";
         else
            cmdtype = crend.row > crstart.row ? "down" : "up";

         cstr = "fill"+cmdtype+" "+SocialCalc.crToCoord(editor.range.left, editor.range.top)+
                   ":"+SocialCalc.crToCoord(editor.range.right, editor.range.bottom)+cmdtype2;
         editor.EditorScheduleSheetCommands(cstr, true, false);
         break;

      case "Move":
      case "MoveC":
         cstr = "movepaste "+
                     SocialCalc.crToCoord(editor.range2.left, editor.range2.top) + ":" +
                     SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom)
                     +" "+editor.ecell.coord+cmdtype2;
         editor.EditorScheduleSheetCommands(cstr, true, false);
         editor.Range2Remove();

         break;

      case "MoveI":
      case "MoveIC":
         sizec = editor.range2.right - editor.range2.left;
         sizer = editor.range2.bottom - editor.range2.top;
         deltac = editor.ecell.col - editor.range2.left;
         deltar = editor.ecell.row - editor.range2.top;
         cstr = "moveinsert "+
                     SocialCalc.crToCoord(editor.range2.left, editor.range2.top) + ":" +
                     SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom)
                     +" "+editor.ecell.coord+cmdtype2;
         editor.EditorScheduleSheetCommands(cstr, true, false);
         editor.Range2Remove();
         editor.RangeRemove();
         if (editor.cellhandles.filltype==" Horizontal" && deltac > 0) {
            editor.MoveECell(SocialCalc.crToCoord(editor.ecell.col-sizec-1, editor.ecell.row));
         }
         else if (editor.cellhandles.filltype==" Vertical" && deltar > 0) {
            editor.MoveECell(SocialCalc.crToCoord(editor.ecell.col, editor.ecell.row-sizer-1));
         }
         editor.RangeAnchor(SocialCalc.crToCoord(editor.ecell.col+sizec, editor.ecell.row+sizer));
         editor.RangeExtend();

         break;

   }
    SocialCalc.RemoveMouseMoveUp(SocialCalc.CellHandlesMouseMove,
            SocialCalc.CellHandlesMouseUp,
            cellhandles.draghandle,
            event);
   mouseinfo.editor = null;
   return false;
}


// do not know what is it for
SocialCalc.CellHandlesDragAutoRepeat = function(coord, direction) {
   console.log("CellHandlesDragAutoRepeat direction = ", direction)
   var mouseinfo = SocialCalc.EditorMouseInfo;
   var editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore
   var cellhandles = editor.cellhandles;

   var crstart = SocialCalc.coordToCr(editor.cellhandles.startingcoord);
   var crend = SocialCalc.coordToCr(coord);

   var newcoord, c, r;

   var vscroll = 0;
   var hscroll = 0;

   if (direction == "left") hscroll = -1;
   else if (direction == "right") hscroll = 1;
   else if (direction == "up") vscroll = -1;
   else if (direction == "down") vscroll = 1;
   editor.ScrollRelativeBoth(vscroll, hscroll);


   switch (cellhandles.dragtype) {
      case "Fill":
      case "FillC":
         if (cellhandles.filltype) { // moving and have already determined filltype
            if (cellhandles.filltype=="Down") { // coerse to that
               crend.col = crstart.col;
               if (crend.row < crstart.row) crend.row = crstart.row;
            }
            else {
               crend.row = crstart.row;
               if (crend.col < crstart.col) crend.col = crstart.col;
            }
         }
         else {
            crend.col = crstart.col; // until decide, leave it at start
            crend.row = crstart.row;
         }

         newcoord = SocialCalc.crToCoord(crend.col, crend.row);
         if (newcoord!=mouseinfo.mouselastcoord) {
            editor.MoveECell(coord);
            editor.RangeExtend();
         }
         break;

      case "Move":
      case "MoveC":
         if (coord!=mouseinfo.mouselastcoord) {
            editor.MoveECell(coord);
            c = editor.range2.right - editor.range2.left + editor.ecell.col;
            r = editor.range2.bottom - editor.range2.top + editor.ecell.row;
            editor.RangeAnchor(SocialCalc.crToCoord(c, r));
            editor.RangeExtend();
         }
         break;

      case "MoveI":
      case "MoveIC":
         if (cellhandles.filltype) { // moving and have already determined filltype
            if (cellhandles.filltype=="Vertical") { // coerse to that
               crend.col = editor.range2.left;
               if (crend.row>=editor.range2.top && crend.row<=editor.range2.bottom+1) crend.row = editor.range2.bottom+2;
            }
            else {
               crend.row = editor.range2.top;
               if (crend.col>=editor.range2.left && crend.col<=editor.range2.right+1) crend.col = editor.range2.right+2;
            }
         }
         else {
            crend.col = crstart.col; // until decide, leave it at start
            crend.row = crstart.row;
         }

         newcoord = SocialCalc.crToCoord(crend.col, crend.row);
         if (newcoord!=mouseinfo.mouselastcoord) {
            editor.MoveECell(newcoord);
            c = editor.range2.right - editor.range2.left + crend.col;
            r = editor.range2.bottom - editor.range2.top + crend.row;
            editor.RangeAnchor(SocialCalc.crToCoord(c, r));
            editor.RangeExtend();
         }
         break;

   }

   mouseinfo.mouselastcoord = newcoord;

}