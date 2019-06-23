SocialCalc.EditorProcessKey = function(editor, ch, e) {

   var result, cell, cellobj, valueinfo, fch, coord, inputtext, f;

   var sheetobj = editor.context.sheetobj;
   var wval = editor.workingvalues;
   var range = editor.range;

   if (typeof ch != "string") ch = "";
   switch (editor.state) {
      case "start":
         if (e.shiftKey && ch.substr(0,2)=="[a") {
            ch = ch + "shifted";
         }
         if (ch=="[enter]") ch = "[adown]";
         if (ch=="[tab]") ch = e.shiftKey ? "[aleft]" : "[aright]";
         if (ch.substr(0,2)=="[a" || ch.substr(0,3)=="[pg" || ch=="[home]") {
            result = editor.MoveECellWithKey(ch);
            return !result;
         }
         if (ch=="[del]" || ch=="[backspace]") {
            if (!editor.noEdit && !editor.ECellReadonly()) {
               editor.EditorApplySetCommandsToRange("empty", "");
            }
            break;
         }
         if (ch=="[esc]") {
            if (range.hasrange) {
               editor.RangeRemove();
               editor.MoveECell(range.anchorcoord);
               for (f in editor.StatusCallback) {
                  editor.StatusCallback[f].func(editor, "specialkey", ch, editor.StatusCallback[f].params);
               }
            }
            return false;
         }

         if (ch=="[f2]") {
            if (editor.noEdit || editor.ECellReadonly()) return true;
            SocialCalc.EditorOpenCellEdit(editor);
            editor.state="input";
            return false;
         }

         if ((ch.length>1 && ch.substr(0,1)=="[") || ch.length==0) { // some control key
            if (editor.ctrlkeyFunction && ch.length>0) {
               return editor.ctrlkeyFunction(editor, ch);
            }
            else {
               return true;
            }
         }
         if (!editor.ecell) return true; // no ecell
         if (!editor.inputBox) return true; // no inputBox so no editing
         if (editor.ECellReadonly()) return true;
         editor.inputBox.element.disabled = false; // make sure editable
         editor.state = "input";
         editor.inputBox.ShowInputBox(true);
         editor.inputEcho.Focus();
         editor.inputEcho.SetText(ch);
         wval.partialexpr = "";
         wval.ecoord = editor.ecell.coord;
         wval.erow = editor.ecell.row;
         wval.ecol = editor.ecell.col;
         editor.RangeRemove();
         break;

      case "input":
         inputtext = editor.inputBox.GetText(); // should not get here if no inputBox
         if (("(+-*/,:!&<>=^".indexOf(inputtext.slice(-1))>=0 && inputtext.slice(0,1)=="=") ||
             (inputtext == "=")) {
            wval.partialexpr = inputtext;
         }
         if (!wval.partialexpr) { // if in pointing operation
            if (SocialCalc.HandlePromptKey(editor, ch)) return;
         }

         if (editor.inputBox.skipOne) return false; // ignore a key already handled
         if (ch=="[esc]" || ch=="[enter]" || ch=="[tab]" || (ch && ch.substr(0,2)=="[a")) {
            if (wval.partialexpr) { // if in pointing operation
               if (e.shiftKey && ch.substr(0,2)=="[a") {
                  ch = ch + "shifted";
               }
               coord = editor.MoveECellWithKey(ch);
               if (coord) {
                  if (range.hasrange) {
                     editor.inputBox.SetText(wval.partialexpr + SocialCalc.crToCoord(range.left, range.top) + ":" +
                        SocialCalc.crToCoord(range.right, range.bottom));
                  }
                  else {
                     editor.inputBox.SetText(wval.partialexpr + coord);
                  }
                  return false;
               }
            }
            editor.inputBox.Blur();
            editor.inputBox.ShowInputBox(false);
            editor.state = "start";
            editor.cellhandles.ShowCellHandles(true);
            if (ch != "[esc]") {
               editor.EditorSaveEdit();
               if (editor.ecell.coord != wval.ecoord) {
                  editor.MoveECell(wval.ecoord);
               }
               if (ch=="[enter]") ch = "[adown]";
               if (ch=="[tab]") ch = e.shiftKey ? "[aleft]" : "[aright]";
               if (ch.substr(0,2)=="[a") {
                  editor.MoveECellWithKey(ch);
               }
            }
            else {
               editor.inputBox.DisplayCellContents();
               editor.RangeRemove();
               editor.MoveECell(wval.ecoord);
            }
            break;
         }
         if (wval.partialexpr && ch=="[backspace]") {
            editor.inputBox.SetText(wval.partialexpr);
            wval.partialexpr = "";
            editor.RangeRemove();
            editor.MoveECell(wval.ecoord);
            editor.inputBox.ShowInputBox(true); // make sure it's moved back if necessary
            return false;
         }
         if (ch=="[f2]") {
           editor.state = "inputboxdirect";
           return false;
         }
         if (range.hasrange) {
            editor.RangeRemove();
         }
         editor.MoveECell(wval.ecoord);
         if (wval.partialexpr) {
            editor.inputBox.ShowInputBox(true); // make sure it's moved back if necessary
            wval.partialexpr = ""; // not pointing
         }
         return true;

      case "inputboxdirect":
         inputtext = editor.inputBox.GetText(); // should not get here if no inputBox

         if (SocialCalc.HandlePromptKey(editor, ch)) return;

         if (ch=="[esc]" || ch=="[enter]" || ch=="[tab]") {
            editor.inputBox.Blur();
            editor.inputBox.ShowInputBox(false);
            editor.state = "start";
            editor.cellhandles.ShowCellHandles(true);
            if (ch == "[esc]") {
               editor.inputBox.DisplayCellContents();
            }
            else {
               editor.EditorSaveEdit();
               if (editor.ecell.coord != wval.ecoord) {
                  editor.MoveECell(wval.ecoord);
               }
               if (ch=="[enter]") ch = "[adown]";
               if (ch=="[tab]") ch = e.shiftKey ? "[aleft]" : "[aright]";
               if (ch.substr(0,2)=="[a") {
                  editor.MoveECellWithKey(ch);
               }
            }
            break;
         }
         if (ch=="[f2]") {
           editor.state = "input"; // arrow keys add range/coord to inputbox formula
           return false;
        }
         return true;

      case "skip-and-start":
         editor.state = "start";
         editor.cellhandles.ShowCellHandles(true);
         return false;

      default:
         return true;
   }

   return false;

}

SocialCalc.HandlePromptKey = function(editor, ch) {
   var $prompt = $(editor.inputEcho.prompt);
   var inputEchoPromptVisible = $prompt.is(':visible');
   var selectedPrompt = $prompt.find('.function-container.selected').first();
   var newSelectedPrompt;
   var topPos = selectedPrompt.length ? selectedPrompt[0].offsetTop : 0;
   if (inputEchoPromptVisible && ch == "[adown]") {
      $prompt.find('.function-container.selected').removeClass('selected');
      if (!selectedPrompt.length || !selectedPrompt.next().length) {
         newSelectedPrompt = $prompt.find('.function-container').first().addClass('selected');
         $prompt.scrollTop(0);
      }
      else {
         newSelectedPrompt = selectedPrompt.next().addClass('selected');
         if (topPos - $prompt.scrollTop() + selectedPrompt.outerHeight() > $prompt.outerHeight() - 50)
            $prompt.scrollTop(topPos);
      }
      return true;
   }
   if (inputEchoPromptVisible && $prompt.is(':visible') && ch == "[aup]") {
      $prompt.find('.function-container.selected').removeClass('selected');
      if (!selectedPrompt.length || !selectedPrompt.prev().length) {
         newSelectedPrompt = $prompt.find('.function-container').last().addClass('selected');
         $prompt.scrollTop($prompt[0].scrollHeight);
      }
      else {
         newSelectedPrompt = selectedPrompt.prev().addClass('selected');
         if (topPos - $prompt.scrollTop() <= 30)
            $prompt.scrollTop(topPos - selectedPrompt.outerHeight());
      }
      return true;
   }
   if (selectedPrompt.length > 0 && ch == "[enter]") {
      selectedPrompt.click(); // simulate click
      return true;
   }
   return false;
}