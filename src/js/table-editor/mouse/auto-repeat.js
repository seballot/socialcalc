//
// Handle auto-repeat of dragging the cursor into the borders of the sheet
//

SocialCalc.AutoRepeatInfo = {

   timer: null, // timer object for repeating
   mouseinfo: null, // result from SocialCalc.GridMousePosition
   repeatinterval: 1000, // milliseconds to wait between repeats
   editor: null, // editor object to use when it repeats
   repeatcallback: null // used instead of default when repeating (e.g., for cellhandles)
                        // called as: repeatcallback(newcoord, direction)

};

// Control auto-repeat. If mouseinfo==null, cancel.

SocialCalc.SetDragAutoRepeat = function(editor, mouseinfo, callback) {

   var repeatinfo = SocialCalc.AutoRepeatInfo;
   var coord, direction;

   repeatinfo.repeatcallback = callback; // null in regular case

   if (!mouseinfo) { // cancel
      if (repeatinfo.timer) { // If was repeating, stop
         window.clearTimeout(repeatinfo.timer); // cancel timer
         repeatinfo.timer = null;
         }
      repeatinfo.mouseinfo = null;
      return; // done
      }

   repeatinfo.editor = editor;

   if (repeatinfo.mouseinfo) { // check for change while repeating
      if (mouseinfo.rowheader || mouseinfo.rowfooter) {
         if (mouseinfo.row != repeatinfo.mouseinfo.row) { // changed row while dragging sidewards
            coord = SocialCalc.crToCoord(editor.ecell.col, mouseinfo.row); // change to it
            if (repeatinfo.repeatcallback) {
               if (mouseinfo.row < repeatinfo.mouseinfo.row) {
                  direction = "left";
                  }
               else if (mouseinfo.row > repeatinfo.mouseinfo.row) {
                  direction = "right";
                  }
               else {
                  direction = "";
                  }
               repeatinfo.repeatcallback(coord, direction);
               }
            else {
               editor.MoveECell(coord);
               editor.MoveECell(coord);
               editor.RangeExtend();
               editor.EditorMouseRange(coord);
               }
            }
         }
      else if (mouseinfo.colheader || mouseinfo.colfooter) {
         if (mouseinfo.col != repeatinfo.mouseinfo.col) { // changed col while dragging vertically
            coord = SocialCalc.crToCoord(mouseinfo.col, editor.ecell.row); // change to it
            if (repeatinfo.repeatcallback) {
               if (mouseinfo.row < repeatinfo.mouseinfo.row) {
                  direction = "left";
                  }
               else if (mouseinfo.row > repeatinfo.mouseinfo.row) {
                  direction = "right";
                  }
               else {
                  direction = "";
                  }
               repeatinfo.repeatcallback(coord, direction);
               }
            else {
               editor.MoveECell(coord);
               editor.RangeExtend();
               editor.EditorMouseRange(coord);
               }
            }
         }
      }

   repeatinfo.mouseinfo = mouseinfo;

   if (mouseinfo.distance < 5) repeatinfo.repeatinterval = 333;
   else if (mouseinfo.distance < 10) repeatinfo.repeatinterval = 250;
   else if (mouseinfo.distance < 25) repeatinfo.repeatinterval = 100;
   else if (mouseinfo.distance < 35) repeatinfo.repeatinterval = 75;
   else { // too far - stop repeating
      if (repeatinfo.timer) { // if repeating, cancel it
         window.clearTimeout(repeatinfo.timer); // cancel timer
         repeatinfo.timer = null;
         }
      return;
      }

   if (!repeatinfo.timer) { // start if not already running
      repeatinfo.timer = window.setTimeout(SocialCalc.DragAutoRepeat, repeatinfo.repeatinterval);
      }

   return;

   }

//
// DragAutoRepeat()
//

SocialCalc.DragAutoRepeat = function() {

   var repeatinfo = SocialCalc.AutoRepeatInfo;
   var mouseinfo = repeatinfo.mouseinfo;

   var direction, coord, cr;

   if (mouseinfo.rowheader) direction = "left";
   else if (mouseinfo.rowfooter) direction = "right";
   else if (mouseinfo.colheader) direction = "up";
   else if (mouseinfo.colfooter) direction = "down";

   if (repeatinfo.repeatcallback) {
      cr = SocialCalc.coordToCr(repeatinfo.editor.ecell.coord);
      if (direction == "left" && cr.col > 1) cr.col--;
      else if (direction == "right") cr.col++;
      else if (direction == "up" && cr.row > 1) cr.row--;
      else if (direction == "down") cr.row++;
      coord = SocialCalc.crToCoord(cr.col, cr.row);
      repeatinfo.repeatcallback(coord, direction);
      }
   else {
      coord = repeatinfo.editor.MoveECellWithKey("[a"+direction+"]shifted");
      if (coord) repeatinfo.editor.EditorMouseRange(coord);
      }

   repeatinfo.timer = window.setTimeout(SocialCalc.DragAutoRepeat, repeatinfo.repeatinterval);

   }