
//
// RangeAnchor(editor, ecoord)
//
// Sets the anchor of a range to ecoord (or ecell if missing).
//

SocialCalc.RangeAnchor = function(editor, ecoord) {

   if (editor.range.hasrange) {
      editor.RangeRemove();
      }

   editor.RangeExtend(ecoord);

   }

//
// RangeExtend(editor, ecoord)
//
// Sets the other corner of the range to ecoord or, if missing, ecell.
//

SocialCalc.RangeExtend = function(editor, ecoord) {

   var a, cell, cr, coord, row, col, f;

   var highlights = editor.context.highlights;
   var range = editor.range;
   var range2 = editor.range2;

   var ecell;
   if (ecoord) {
      ecell = SocialCalc.coordToCr(ecoord);
      ecell.coord = ecoord;
      }
   else ecell = editor.ecell;

   if (!ecell) return; // just in case

   if (!range.hasrange) { // called without RangeAnchor...
      range.anchorcoord = ecell.coord;
      range.anchorrow = ecell.row;
      range.top = ecell.row;
      range.bottom = ecell.row;
      range.anchorcol = ecell.col;
      range.left = ecell.col;
      range.right = ecell.col;
      range.hasrange = true;
      }

   if (range.anchorrow < ecell.row) {
      range.top = range.anchorrow;
      range.bottom = ecell.row;
      }
   else {
      range.top = ecell.row;
      range.bottom = range.anchorrow;
      }
   if (range.anchorcol < ecell.col) {
      range.left = range.anchorcol;
      range.right = ecell.col;
      }
   else {
      range.left = ecell.col;
      range.right = range.anchorcol;
      }

   for (coord in highlights) {
      switch (highlights[coord]) {
         case "range":
            highlights[coord] = "unrange";
            break;
         case "range2":
            highlights[coord] = "unrange2";
            break;
         }
      }

   for (row=range.top; row<=range.bottom; row++) {
      for (col=range.left; col<=range.right; col++) {
         coord = SocialCalc.crToCoord(col, row);
         switch (highlights[coord]) {
            case "unrange":
               highlights[coord] = "range";
               break;
            case "cursor":
               break;
            case "unrange2":
            default:
               highlights[coord] = "newrange";
               break;
            }
         }
      }

   for (row=range2.top; range2.hasrange && row<=range2.bottom; row++) {
      for (col=range2.left; col<=range2.right; col++) {
         coord = SocialCalc.crToCoord(col, row);
         switch (highlights[coord]) {
            case "unrange2":
               highlights[coord] = "range2";
               break;
            case "range":
            case "newrange":
            case "cursor":
               break;
            default:
               highlights[coord] = "newrange2";
               break;
            }
         }
      }

   for (coord in highlights) {

      switch (highlights[coord]) {
         case "unrange":
            delete highlights[coord];
            break;
         case "newrange":
            highlights[coord] = "range";
            break;
         case "newrange2":
            highlights[coord] = "range2";
            break;
         case "range":
         case "range2":
         case "cursor":
            continue;
         }

      cr = SocialCalc.coordToCr(coord);
      cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
      editor.UpdateCellCSS(cell, cr.row, cr.col);

      }

   for (f in editor.RangeChangeCallback) { // let others know
      editor.RangeChangeCallback[f](editor);
      }

   // create range/coord string and do status callback

   coord = SocialCalc.crToCoord(editor.range.left, editor.range.top);
   if (editor.range.left!=editor.range.right || editor.range.top!=editor.range.bottom) { // more than one cell
      coord += ":" + SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
      }
   for (f in editor.StatusCallback) {
      editor.StatusCallback[f].func(editor, "rangechange", coord, editor.StatusCallback[f].params);
      }

   return;

   }

//
// RangeRemove(editor)
//
// Turns off the range.
//

SocialCalc.RangeRemove = function(editor) {

   var cell, cr, coord, row, col, f;

   var highlights = editor.context.highlights;
   var range = editor.range;
   var range2 = editor.range2;

   if (!range.hasrange && !range2.hasrange) return;

   for (row=range2.top; range2.hasrange && row<=range2.bottom; row++) {
      for (col=range2.left; col<=range2.right; col++) {
         coord = SocialCalc.crToCoord(col, row);
         switch (highlights[coord]) {
            case "range":
               highlights[coord] = "newrange2";
               break;
            case "range2":
            case "cursor":
               break;
            default:
               highlights[coord] = "newrange2";
               break;
            }
         }
      }

   for (coord in highlights) {
      switch (highlights[coord]) {
         case "range":
            delete highlights[coord];
            break;
         case "newrange2":
            highlights[coord] = "range2";
            break;
         case "cursor":
            continue;
         }
      cr = SocialCalc.coordToCr(coord);
      cell=SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
      editor.UpdateCellCSS(cell, cr.row, cr.col);
      }

   range.hasrange = false;

   for (f in editor.RangeChangeCallback) { // let others know
      editor.RangeChangeCallback[f](editor);
      }

   for (f in editor.StatusCallback) {
      editor.StatusCallback[f].func(editor, "rangechange", "", editor.StatusCallback[f].params);
      }

   return;

   }

//
// Range2Remove(editor)
//
// Turns off the range2.
//

SocialCalc.Range2Remove = function(editor) {

   var cell, cr, coord, row, col, f;

   var highlights = editor.context.highlights;
   var range2 = editor.range2;

   if (!range2.hasrange) return;

   for (coord in highlights) {
      switch (highlights[coord]) {
         case "range2":
            delete highlights[coord];
            break;
         case "range":
         case "cursor":
            continue;
         }
      cr = SocialCalc.coordToCr(coord);
      cell=SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
      editor.UpdateCellCSS(cell, cr.row, cr.col);
      }

   range2.hasrange = false;

   return;

   }