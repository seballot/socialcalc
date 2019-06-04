// *************************************
//
// CellHandles class:
//
// This object creates and controls the elements around the cursor cell for dragging, etc.
//
// *************************************

SocialCalc.CellHandles = function(editor) {

   var scc = SocialCalc.Constants;
   var functions;

   if (editor.noEdit) return; // leave us with nothing

   this.editor = editor; // the TableEditor this belongs to

   this.noCursorSuffix = false;

   this.movedmouse = false; // used to detect no-op

   this.draghandle = document.createElement("div");
   SocialCalc.setStyles(this.draghandle, "display:none;position:absolute;zIndex:8;border:1px solid white;width:4px;height:4px;fontSize:1px;backgroundColor:#0E93D8;cursor:default;");
   this.draghandle.innerHTML = '&nbsp;';
   editor.toplevel.appendChild(this.draghandle);
   SocialCalc.AssignID(editor, this.draghandle, "draghandle");

   var imagetype = "png";
   if (navigator.userAgent.match(/MSIE 6\.0/)) {
      imagetype = "gif";
      }

   this.dragpalette = document.createElement("div");
   SocialCalc.setStyles(this.dragpalette, "display:none;position:absolute;zIndex:8;width:90px;height:90px;fontSize:1px;textAlign:center;cursor:default;"+
      "backgroundImage:url("+SocialCalc.Constants.defaultImagePrefix+"drag-handles."+imagetype+");");
   this.dragpalette.innerHTML = '&nbsp;';
   editor.toplevel.appendChild(this.dragpalette);
   SocialCalc.AssignID(editor, this.dragpalette, "dragpalette");

   this.dragtooltip = document.createElement("div");
   SocialCalc.setStyles(this.dragtooltip, "display:none;position:absolute;zIndex:9;border:1px solid black;width:100px;height:auto;fontSize:10px;backgroundColor:#FFFFFF;");
   this.dragtooltip.innerHTML = '&nbsp;';
   editor.toplevel.appendChild(this.dragtooltip);
   SocialCalc.AssignID(editor, this.dragtooltip, "dragtooltip");

   this.fillinghandle = document.createElement("div");
   SocialCalc.setStyles(this.fillinghandle, "display:none;position:absolute;zIndex:9;border:1px solid black;width:auto;height:14px;fontSize:10px;backgroundColor:#FFFFFF;");
   this.fillinghandle.innerHTML = '&nbsp;';
   editor.toplevel.appendChild(this.fillinghandle);
   SocialCalc.AssignID(editor, this.fillinghandle, "fillinghandle");

   if (this.draghandle.addEventListener) { // DOM Level 2 -- Firefox, et al
      this.draghandle.addEventListener("mousemove", SocialCalc.CellHandlesMouseMoveOnHandle, false);
      this.dragpalette.addEventListener("mousedown", SocialCalc.CellHandlesMouseDown, false);
      this.dragpalette.addEventListener("mousemove", SocialCalc.CellHandlesMouseMoveOnHandle, false);
      }
   else if (this.draghandle.attachEvent) { // IE 5+
      this.draghandle.attachEvent("onmousemove", SocialCalc.CellHandlesMouseMoveOnHandle);
      this.dragpalette.attachEvent("onmousedown", SocialCalc.CellHandlesMouseDown);
      this.dragpalette.attachEvent("onmousemove", SocialCalc.CellHandlesMouseMoveOnHandle);
      }
   else { // don't handle this
      throw "Browser not supported";
      }

   }

// Methods:

SocialCalc.CellHandles.prototype.ShowCellHandles = function(show, moveshow) {return SocialCalc.ShowCellHandles(this, show, moveshow);};

// Functions:

SocialCalc.ShowCellHandles = function(cellhandles, show, moveshow) {

   var cell, cell2, position, position2;
   var editor = cellhandles.editor;
   var doshow = false;
   var row, col;
   var colinc = 1, rowinc = 1;

   if (!editor) return;
   if (!editor.ecell) return;

   do { // a block that can you can "break" out of easily

      if (!show) break;

      row = editor.ecell.row;
      col = editor.ecell.col;

      if (editor.state != "start") break;
      if (row >= editor.lastvisiblerow) break;
      if (col >= editor.lastvisiblecol) break;
      if (row < editor.firstscrollingrow) break;
      if (col < editor.firstscrollingcol) break;

      // Go beyond one column if hidden.
      while (editor.context.sheetobj.colattribs.hide[SocialCalc.rcColname(col+colinc)] == "yes") {
         colinc++;
         }

      // Go beyond one row if hidden.
      while (editor.context.sheetobj.rowattribs.hide[row+rowinc] == "yes") {
         rowinc++;
         }

      // Check colspan and rowspan.
      cell = editor.context.sheetobj.cells[SocialCalc.crToCoord(col+colinc-1, row+rowinc-1)];
      if (typeof cell != "undefined") {
         colinc += (cell.colspan || 1) - 1;
         rowinc += (cell.rowspan || 1) - 1;
         }

      // if (editor.rowpositions[row+rowinc]+20>editor.horizontaltablecontrol.controlborder) {
      //    break;
      //    }
      // if (editor.rowpositions[row+rowinc]-10<editor.headposition.top) {
      //    break;
      //    }
      // if (editor.colpositions[col+colinc]+20>editor.verticaltablecontrol.controlborder) {
      //    break;
      //    }
      // if (editor.colpositions[col+colinc]-30<editor.headposition.left) {
      //    break;
      //    }

      cellhandles.draghandle.style.left = (editor.colpositions[col+colinc]-1)+"px";
      cellhandles.draghandle.style.top = (editor.rowpositions[row+rowinc]-1)+"px";
      cellhandles.draghandle.style.display = "block";

      if (moveshow) {
         cellhandles.draghandle.style.display = "none";
         cellhandles.dragpalette.style.left = (editor.colpositions[col+colinc]-45)+"px";
         cellhandles.dragpalette.style.top = (editor.rowpositions[row+rowinc]-45)+"px";
         cellhandles.dragpalette.style.display = "block";
         cellhandles.dragtooltip.style.left = (editor.colpositions[col+colinc]-45)+"px";
         cellhandles.dragtooltip.style.top = (editor.rowpositions[row+rowinc]+45)+"px";
         cellhandles.dragtooltip.style.display = "none";
         }

      doshow = true;

      }
   while (false); // only do once

   if (!doshow) {
      cellhandles.draghandle.style.display = "none";
      }
   if (!moveshow) {
      cellhandles.dragpalette.style.display = "none";
      cellhandles.dragtooltip.style.display = "none";
      }

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
      editor.cellhandles.ShowCellHandles(true, true); // show move handles, too

      if (target == cellhandles.dragpalette) {
         var whichhandle = SocialCalc.SegmentDivHit([scc.CH_radius1, scc.CH_radius2], editor.cellhandles.dragpalette, clientX, clientY);
         if (whichhandle==0) { // off of active part of palette
            SocialCalc.CellHandlesHoverTimeout();
            return;
            }
         }

      if (cellhandles.timer) {
         window.clearTimeout(cellhandles.timer);
         cellhandles.timer = null;
         }
      cellhandles.timer = window.setTimeout(SocialCalc.CellHandlesHoverTimeout, 3000);
   }

   return;

   }

//
// whichsegment = SocialCalc.SegmentDivHit(segtable, divWithMouseHit, x, y)
//
// Takes segtable = [upperleft quadrant, upperright, bottomright, bottomleft]
//  where each quadrant is either:
//      0 = ignore hits here
//      number = return this value
//      array = a new segtable for this subquadrant
//
// Alternatively, segtable can be:
//  [radius 1, radius 2] and it returns 0 if no hit,
//  -1, -2, -3, -4 for inner quadrants, and +1...+4 for outer quadrants
//

SocialCalc.SegmentDivHit = function(segtable, divWithMouseHit, x, y) {

   var width = divWithMouseHit.offsetWidth;
   var height = divWithMouseHit.offsetHeight;
   var left = divWithMouseHit.offsetLeft;
   var top = divWithMouseHit.offsetTop;
   var v = 0;
   var table = segtable;
   var len = Math.sqrt(Math.pow(x-left-(width/2.0-.5), 2)+Math.pow(y-top-(height/2.0-.5), 2));

   if (table.length==2) { // type 2 segtable
      if (x >= left && x < left+width/2 && y >= top && y < top+height/2) { // upper left
         if (len <= segtable[0]) v = -1;
         else if (len <= segtable[1]) v = 1;
         }
      if (x >= left+width/2 && x < left+width && y >= top && y < top+height/2) { // upper right
         if (len <= segtable[0]) v = -2;
         else if (len <= segtable[1]) v = 2;
         }
      if (x >= left+width/2 && x < left+width && y >= top+height/2 && y < top+height) { // bottom right
         if (len <= segtable[0]) v = -3;
         else if (len <= segtable[1]) v = 3;
         }
      if (x >= left && x < left+width/2 && y >= top+height/2 && y < top+height) { // bottom right
         if (len <= segtable[0]) v = -4;
         else if (len <= segtable[1]) v = 4;
         }
      return v;
      }

   while (true) {
      if (x >= left && x < left+width/2 && y >= top && y < top+height/2) { // upper left
         quadrant += "1";
         v = table[0];
         if (typeof v == "number") {
            break;
            }
         table = v;
         width = width/2;
         height = height/2;
         continue;
         }
      if (x >= left+width/2 && x < left+width && y >= top && y < top+height/2) { // upper right
         quadrant += "2";
         v = table[1];
         if (typeof v == "number") {
            break;
            }
         table = v;
         width = width/2;
         left = left+width;
         height = height/2;
         continue;
         }
      if (x >= left+width/2 && x < left+width && y >= top+height/2 && y < top+height) { // bottom right
         quadrant += "3";
         v = table[2];
         if (typeof v == "number") {
            break;
            }
         table = v;
         width = width/2;
         left = left + width;
         height = height/2;
         top = top + height;
         continue;
         }
      if (x >= left && x < left+width/2 && y >= top+height/2 && y < top+height) { // bottom right
         quadrant += "4";
         v = table[3];
         if (typeof v == "number") {
            break;
            }
         table = v;
         width = width/2;
         height = height/2;
         top = top + height;
         continue;
         }
      return 0; // didn't match
      }

//addmsg((x-divWithMouseHit.offsetLeft)+","+(y-divWithMouseHit.offsetTop)+"="+quadrant+" "+v);
   return v;

}

SocialCalc.CellHandlesHoverTimeout = function() {

   editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
   if (!editor) return true; // we're not handling it -- let browser do default
   var cellhandles = editor.cellhandles;
   if (cellhandles.timer) {
      window.clearTimeout(cellhandles.timer);
      cellhandles.timer = null;
      }
   editor.cellhandles.ShowCellHandles(true, false); // hide move handles

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

   if (cellhandles.timer) { // cancel timer
      window.clearTimeout(cellhandles.timer);
      cellhandles.timer = null;
      }

   cellhandles.dragtooltip.innerHTML = "&nbsp;";
   cellhandles.dragtooltip.style.display = "none";

   range = editor.range;

   var whichhandle = SocialCalc.SegmentDivHit([scc.CH_radius1, scc.CH_radius2], editor.cellhandles.dragpalette, clientX, clientY);
   if (whichhandle==1 || whichhandle==-1 || whichhandle==0) {
      cellhandles.ShowCellHandles(true, false); // hide move handles
      return;
      }

   mouseinfo.ignore = true; // stop other code from looking at the mouse

   if (whichhandle==-3) {
      cellhandles.dragtype = "Fill";
//      mouseinfo.element = editor.cellhandles.fillhandle;
      cellhandles.noCursorSuffix = false;
      }
   else if (whichhandle==3) {
      cellhandles.dragtype = "FillC";
//      mouseinfo.element = editor.cellhandles.fillhandle;
      cellhandles.noCursorSuffix = false;
      }
   else if (whichhandle==-2) {
      cellhandles.dragtype = "Move";
//      mouseinfo.element = editor.cellhandles.movehandle1;
      cellhandles.noCursorSuffix = true;
      }
   else if (whichhandle==-4) {
      cellhandles.dragtype = "MoveI";
//      mouseinfo.element = editor.cellhandles.movehandle2;
      cellhandles.noCursorSuffix = false;
      }
   else if (whichhandle==2) {
      cellhandles.dragtype = "MoveC";
//      mouseinfo.element = editor.cellhandles.movehandle1;
      cellhandles.noCursorSuffix = true;
      }
   else if (whichhandle==4) {
      cellhandles.dragtype = "MoveIC";
//      mouseinfo.element = editor.cellhandles.movehandle2;
      cellhandles.noCursorSuffix = false;
      }

   cellhandles.filltype = null;

   switch (cellhandles.dragtype) {
      case "Fill":
      case "FillC":
         if (!range.hasrange) {
            editor.RangeAnchor();
            }
         editor.range2.top = editor.range.top;
         editor.range2.right = editor.range.right;
         editor.range2.bottom = editor.range.bottom;
         editor.range2.left = editor.range.left;
         editor.range2.hasrange = true;
         break;

      case "Move":
      case "MoveI":
      case "MoveC":
      case "MoveIC":
         if (!range.hasrange) {
            editor.RangeAnchor();
            }
         editor.range2.top = editor.range.top;
         editor.range2.right = editor.range.right;
         editor.range2.bottom = editor.range.bottom;
         editor.range2.left = editor.range.left;
         editor.range2.hasrange = true;
         editor.RangeRemove();
         break;

      default:
         return; // not for us
      }

   cellhandles.fillinghandle.style.left = (clientX)+"px";
   cellhandles.fillinghandle.style.top = (clientY - 17)+"px";
   cellhandles.fillinghandle.innerHTML = scc.s_CHindicatorOperationLookup[cellhandles.dragtype]+
                                         (scc.s_CHindicatorDirectionLookup[editor.cellhandles.filltype] || "");
   cellhandles.fillinghandle.style.display = "block";

   cellhandles.ShowCellHandles(true, false); // hide move handles
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

         if (result.coord == cellhandles.startingcoord) { // reset when come back
            cellhandles.filltype = null;
            cellhandles.startingX = clientX;
            cellhandles.startingY = clientY;
            }
         else {
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
               if (Math.abs(clientY - cellhandles.startingY) > 10) {
                  cellhandles.filltype = "Down";
                  }
               else if (Math.abs(clientX - cellhandles.startingX) > 10) {
                  cellhandles.filltype = "Right";
                  }
               crend.col = crstart.col; // until decide, leave it at start
               crend.row = crstart.row;
               }
            }
         result.coord = SocialCalc.crToCoord(crend.col, crend.row);
         if (result.coord!=mouseinfo.mouselastcoord) {
            editor.MoveECell(result.coord);
            editor.RangeExtend();
            }
         break;

      case "Move":
      case "MoveC":
         if (result.coord!=mouseinfo.mouselastcoord) {
            editor.MoveECell(result.coord);
            c = editor.range2.right - editor.range2.left + result.col;
            r = editor.range2.bottom - editor.range2.top + result.row;
            editor.RangeAnchor(SocialCalc.crToCoord(c, r));
            editor.RangeExtend();
            }
         break;

      case "MoveI":
      case "MoveIC":
         if (result.coord == cellhandles.startingcoord) { // reset when come back
            cellhandles.filltype = null;
            cellhandles.startingX = clientX;
            cellhandles.startingY = clientY;
            }
         else {
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
               if (Math.abs(clientY - cellhandles.startingY) > 10) {
                  cellhandles.filltype = "Vertical";
                  }
               else if (Math.abs(clientX - cellhandles.startingX) > 10) {
                  cellhandles.filltype = "Horizontal";
                  }
               crend.col = crstart.col; // until decide, leave it at start
               crend.row = crstart.row;
               }
            }
         result.coord = SocialCalc.crToCoord(crend.col, crend.row);
         if (result.coord!=mouseinfo.mouselastcoord) {
            editor.MoveECell(result.coord);
            if (!cellhandles.filltype) { // no fill type
               editor.RangeRemove();
               }
            else {
               c = editor.range2.right - editor.range2.left + crend.col;
               r = editor.range2.bottom - editor.range2.top + crend.row;
               editor.RangeAnchor(SocialCalc.crToCoord(c, r));
               editor.RangeExtend();
               }
            }
         break;

      }


   cellhandles.fillinghandle.style.left = clientX+"px";
   cellhandles.fillinghandle.style.top = (clientY - 17)+"px";
   cellhandles.fillinghandle.innerHTML = scc.s_CHindicatorOperationLookup[cellhandles.dragtype]+
                                         (scc.s_CHindicatorDirectionLookup[editor.cellhandles.filltype] || "");
   cellhandles.fillinghandle.style.display = "block";

   mouseinfo.mouselastcoord = result.coord;
   SocialCalc.StopPropagation(event);
   return;
   }

SocialCalc.CellHandlesDragAutoRepeat = function(coord, direction) {

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

   cellhandles.fillinghandle.style.display = "none";

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

   if (!cellhandles.movedmouse) { // didn't move: just leave one cell selected
      cellhandles.dragtype = "Nothing";
      }

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
            if (cellhandles.filltype=="Down") {
               crend.col = crstart.col;
               }
            else {
               crend.row = crstart.row;
               }
            }
         result.coord = SocialCalc.crToCoord(crend.col, crend.row);

         editor.MoveECell(result.coord);
         editor.RangeExtend();

         if (editor.cellhandles.filltype=="Right") {
            cmdtype = "right";
            }
         else {
            cmdtype = "down";
            }
         cstr = "fill"+cmdtype+" "+SocialCalc.crToCoord(editor.range.left, editor.range.top)+
                   ":"+SocialCalc.crToCoord(editor.range.right, editor.range.bottom)+cmdtype2;
         editor.EditorScheduleSheetCommands(cstr, true, false);
         break;

      case "Move":
      case "MoveC":
         editor.context.cursorsuffix = "";
         cstr = "movepaste "+
                     SocialCalc.crToCoord(editor.range2.left, editor.range2.top) + ":" +
                     SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom)
                     +" "+editor.ecell.coord+cmdtype2;
         editor.EditorScheduleSheetCommands(cstr, true, false);
         editor.Range2Remove();

         break;

      case "MoveI":
      case "MoveIC":
         editor.context.cursorsuffix = "";
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