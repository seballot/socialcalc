SocialCalc.ProcessEditorMouseDown = function(e) {
   var editor, result, coord, textarea, wval, range;

   var event = e || window.event;

   var mouseinfo = SocialCalc.EditorMouseInfo;
   var ele = event.target || event.srcElement; // source object is often within what we want
   var target = ele;
   if (target.nodeType == 3) target = target.parentNode; // defeat Safari bug

   var mobj;

   if (mouseinfo.ignore) return; // ignore this

   for (mobj=null; !mobj && ele; ele=ele.parentNode) { // go up tree looking for one of our elements
      mobj = SocialCalc.LookupElement(ele, mouseinfo.registeredElements);
      }
   if (!mobj) {
      mouseinfo.editor = null;
      return; // not one of our elements
      }

   editor = mobj.editor;
   mouseinfo.element = ele;
   range = editor.range;

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;
   result = SocialCalc.GridMousePosition(editor, clientX, clientY);

   if (!result) return; // not on a cell or col header
   mouseinfo.editor = editor; // remember for later

    if (result.rowheader) {
  if (result.rowselect)  {
      SocialCalc.ProcessEditorRowselectMouseDown(e, ele, result);
  } else {
      SocialCalc.ProcessEditorRowsizeMouseDown(e, ele, result);
  }
  return;
    }

    if (result.colheader) {
  if (result.colselect)  {
      SocialCalc.ProcessEditorColselectMouseDown(e, ele, result);
  } else {
      SocialCalc.ProcessEditorColsizeMouseDown(e, ele, result);
  }
  return;
    }

   if (!result.coord) return; // not us

   if (!range.hasrange) {
      if (e.shiftKey)
         editor.RangeAnchor();
      }
   coord = editor.MoveECell(result.coord);
   // eddy ProcessEditorMouseDown {
   if(SocialCalc._app == true) { // "app" wigets need to keep focus - needed because "coord" always equals A1
     SocialCalc.CmdGotFocus(true); // cell widgets need to keep focus
     return;
   }

   var clickedCell = editor.context.sheetobj.cells[coord];
   if(clickedCell) {
     if(clickedCell.valuetype.charAt(1) == 'i') { // IF cell contains ioWidget
       var formula_name= clickedCell.valuetype.substring(2);
       var widget_id = formula_name+'_'+coord;
       if(target && widget_id == target.id) { // if widget was clicked (rather than cell containing widget)
         var cell_widget=document.getElementById(widget_id);
         SocialCalc.CmdGotFocus(cell_widget); // cell widgets need to keep focus
       }
    return; // let ioWidget keep the focus
    }
   }
   // }

   if (range.hasrange) {
      if (e.shiftKey)
         editor.RangeExtend();
      else
         editor.RangeRemove();
      }

   mouseinfo.mousedowncoord = coord; // remember if starting drag range select
   mouseinfo.mouselastcoord = coord;

   editor.EditorMouseRange(coord);

   SocialCalc.KeyboardSetFocus(editor);
   if (editor.state!="start" && editor.inputBox) editor.inputBox.element.focus();
    SocialCalc.SetMouseMoveUp(SocialCalc.ProcessEditorMouseMove,
            SocialCalc.ProcessEditorMouseUp,
            ele,
            event);
   return;

   }

SocialCalc.EditorMouseRange = function(editor, coord) {

   var inputtext, wval;
   var range = editor.range;

   switch (editor.state) { // editing a cell - shouldn't get here if no inputBox
      case "input":
         inputtext = editor.inputBox.GetText();
         wval = editor.workingvalues;
         if (("(+-*/,:!&<>=^".indexOf(inputtext.slice(-1))>=0 && inputtext.slice(0,1)=="=") ||
             (inputtext == "=")) {
            wval.partialexpr = inputtext;
            }

         if (wval.partialexpr) { // if in pointing operation
            if (coord) {
               if (range.hasrange) {
                  editor.inputBox.SetText(wval.partialexpr + SocialCalc.crToCoord(range.left, range.top) + ":" +
                     SocialCalc.crToCoord(range.right, range.bottom));
                  }
               else {
                  editor.inputBox.SetText(wval.partialexpr + coord);
                  }
               }
            }
         else { // not in point -- done editing
            editor.inputBox.Blur();
            editor.inputBox.ShowInputBox(false);
            editor.state = "start";
            editor.cellhandles.ShowCellHandles(true);
            editor.EditorSaveEdit();
            editor.inputBox.DisplayCellContents(null);
            }
         break;

      case "inputboxdirect":
         editor.inputBox.Blur();
         editor.inputBox.ShowInputBox(false);
         editor.state = "start";
         editor.cellhandles.ShowCellHandles(true);
         editor.EditorSaveEdit();
         editor.inputBox.DisplayCellContents(null);
         break;
      }
   }

SocialCalc.ProcessEditorMouseMove = function(e) {

   var editor, element, result, coord, now, textarea, sheetobj, cellobj, wval;

   var event = e || window.event;

   var mouseinfo = SocialCalc.EditorMouseInfo;
   editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore
   if (mouseinfo.ignore) return; // ignore this
   element = mouseinfo.element;

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;
   result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with move

   if (!result) return;

   if (result && !result.coord) {
      SocialCalc.SetDragAutoRepeat(editor, result);
      return;
      }

   SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

   if (!result.coord) return;

   if (result.coord!=mouseinfo.mouselastcoord) {
      if (!e.shiftKey && !editor.range.hasrange) {
         editor.RangeAnchor(mouseinfo.mousedowncoord);
         }
      editor.MoveECell(result.coord);
      editor.RangeExtend();
      }
   mouseinfo.mouselastcoord = result.coord;

   editor.EditorMouseRange(result.coord);
   SocialCalc.StopPropagation(event);
   return;
   }


SocialCalc.ProcessEditorMouseUp = function(e) {

   var editor, element, result, coord, now, textarea, sheetobj, cellobj, wval;

   var event = e || window.event;

   var mouseinfo = SocialCalc.EditorMouseInfo;
   editor = mouseinfo.editor;
   if (!editor) return; // not us, ignore
   if (mouseinfo.ignore) return; // ignore this
   element = mouseinfo.element;

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;
   result = SocialCalc.GridMousePosition(editor, clientX, clientY); // get cell with up

   SocialCalc.SetDragAutoRepeat(editor, null); // stop repeating if it was

   if (!result) return;

   if (!result.coord) result.coord = editor.ecell.coord;

   if (editor.range.hasrange) {
      editor.MoveECell(result.coord);
      editor.RangeExtend();
      }
   else if (result.coord && result.coord!=mouseinfo.mousedowncoord) {
      editor.RangeAnchor(mouseinfo.mousedowncoord);
      editor.MoveECell(result.coord);
      editor.RangeExtend();
      }

   editor.EditorMouseRange(result.coord);
   mouseinfo.editor = null;
   SocialCalc.RemoveMouseMoveUp(SocialCalc.ProcessEditorMouseMove,
          SocialCalc.ProcessEditorMouseUp,
          element,
          event);

   // Update style button state according to selected row style
   cell = editor.context.sheetobj.GetAssuredCell(editor.ecell.coord);
   // reset
   $('.style-btn').removeClass('active');
   $('input[data-command="style.color"]').spectrum("set", '#3c4042');
   $('input[data-command="style.background-color"]').spectrum("set", 'white');
   // apply cell style
   for(var property in cell.style) {
      $('.style-btn[data-command="style.'+ property +'"]').each(function() {
         $(this).toggleClass('active', $(this).data('value') == cell.style[property]);
      })
      $('input[type=color][data-command="style.'+ property +'"]').spectrum("set", cell.style[property]);
   }

   return false;

   }

//
// Handling Clicking
//

SocialCalc.ProcessEditorDblClick = function(e) {

   var editor, result, coord, textarea, wval, range;

   var event = e || window.event;

   var mouseinfo = SocialCalc.EditorMouseInfo;
   var ele = event.target || event.srcElement; // source object is often within what we want
   var mobj;

   if (mouseinfo.ignore) return; // ignore this

   for (mobj=null; !mobj && ele; ele=ele.parentNode) { // go up tree looking for one of our elements
      mobj = SocialCalc.LookupElement(ele, mouseinfo.registeredElements);
      }
   if (!mobj) {
      mouseinfo.editor = null;
      return; // not one of our elements
      }

   editor = mobj.editor;

   var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
   var clientX = event.clientX - pos.left;
   var clientY = event.clientY - pos.top;
   result = SocialCalc.GridMousePosition(editor, clientX, clientY);
   if (!result || !result.coord) return; // not within cell area - ignore

   mouseinfo.editor = editor; // remember for later
   mouseinfo.element = ele;
   range = editor.range;

   sheetobj = editor.context.sheetobj;

   switch (editor.state) {
      case "start":
         SocialCalc.EditorOpenCellEdit(editor);
         break;

      case "input":
         break;

      default:
         break;
      }
   SocialCalc.StopPropagation(event);
   return;

   }

SocialCalc.EditorProcessMouseWheel = function(event, delta, mousewheelinfo, wobj) {

   if (wobj.functionobj.editor.busy) return; // ignore if busy

   if (delta > 0) {
      wobj.functionobj.editor.ScrollRelative(true, Math.floor(-delta * 1.5));
      }
   if (delta < 0) {
      wobj.functionobj.editor.ScrollRelative(true, Math.ceil(-delta * 1.5));
      }

   }