// Special code needed for change that occurred with Safari 5 that made paste not work for some reason

SocialCalc.SafariPasteFunction = function(e) {
   e.preventDefault();
}

SocialCalc.EditorOpenCellEdit = function(editor) {

   var wval;
   console.log("EditorOpenCellEdit", editor.ecell)
   editor.state = 'input';
   if (!editor.ecell) return true; // no ecell
   if (!editor.inputBox) return true; // no input box, so no editing (happens on noEdit)
   if (editor.inputBox.element.disabled) return true; // multi-line: ignore
   editor.inputEcho.Show(true);
   editor.inputEcho.SetText(editor.inputBox.GetText());
   editor.inputBox.DisplayCellContents();
   editor.inputBox.Select("end");
   wval = editor.workingvalues;
   wval.partialexpr = "";
   wval.ecoord = editor.ecell.coord;
   wval.erow = editor.ecell.row;
   wval.ecol = editor.ecell.col;

   return;

}

// When function is selected from functions list popup
SocialCalc.EditorAddToInput = function(editor, str, prefix) {

   var wval = editor.workingvalues;
   console.log("add to input", str, prefix)
   if (editor.noEdit || editor.ECellReadonly()) return;

   switch (editor.state) {
      case "start":
         editor.state = "input";
         editor.inputBox.element.disabled = false; // make sure editable and overwrite old
         editor.inputBox.Focus();
         editor.inputBox.SetText((prefix||"")+str);
         editor.inputBox.Select("end");
         wval.partialexpr = "";
         wval.ecoord = editor.ecell.coord;
         wval.erow = editor.ecell.row;
         wval.ecol = editor.ecell.col;
         editor.RangeRemove();
         break;

      case "input":
      case "inputboxdirect":
         editor.inputBox.element.focus();
         if (wval.partialexpr) {
            editor.inputBox.SetText(wval.partialexpr);
            wval.partialexpr = "";
            editor.RangeRemove();
            editor.MoveECell(wval.ecoord);
         }
         var text = editor.inputBox.GetText().length == 0 ? (prefix||"")+str : editor.inputBox.GetText()+str
         editor.inputBox.SetText(text);
         break;

      default:
         break;
   }

}


SocialCalc.EditorDisplayCellContents = function(editor) {

   if (editor.inputBox) editor.inputBox.DisplayCellContents();

}

SocialCalc.EditorSaveEdit = function(editor, text) {

   var result, cell, valueinfo, fch, type, value, oldvalue, cmdline;

   var sheetobj = editor.context.sheetobj;
   var wval = editor.workingvalues;

   type = "text t";
   value = typeof text == "string" ? text : editor.inputBox.GetText(); // either explicit or from input box

   oldvalue = sheetobj.GetCellContents(wval.ecoord)+"";
   if (value == oldvalue) { // no change
      return;
   }
   fch = value.charAt(0);
   if (fch=="=" && value.indexOf("\n")==-1) {
      type = "formula";
      value = value.substring(1);
   }
   else if (fch=="'") {
      type = "text t";
      value = value.substring(1);
      valueinfo = SocialCalc.DetermineValueType(value); // determine type again
      if (valueinfo.type.charAt(0)=="t") {
         type = "text "+valueinfo.type;
      }
   }
   else if (value.length==0) {
      type = "empty";
   }
   else {
      valueinfo = SocialCalc.DetermineValueType(value);
      if (valueinfo.type=="n" && value==(valueinfo.value+"")) { // see if don't need "constant"
         type = "value n";
      }
      else if (valueinfo.type.charAt(0)=="t") {
         type = "text "+valueinfo.type;
      }
      else if (valueinfo.type=="") {
         type = "text t";
      }
      else {
         type = "constant "+valueinfo.type+" "+valueinfo.value;
      }
   }

   if (type.charAt(0)=="t") { // text
      value = SocialCalc.encodeForSave(value); // newlines, :, and \ are escaped
   }

   cmdline = "set "+wval.ecoord+" "+type+" "+value;
   editor.EditorScheduleSheetCommands(cmdline, true, false);

   if(typeof sheetobj.ioEventTree === 'undefined') return;
   if(typeof sheetobj.ioParameterList === 'undefined') return;
   if(typeof sheetobj.ioEventTree[wval.ecoord] !== 'undefined') {
     SocialCalc.EditedTriggerCell(sheetobj.ioEventTree[wval.ecoord], wval.ecoord, editor, sheetobj);
}

   return;

}


SocialCalc.EditedTriggerCell  = function(actionFormulaCells, editedCellRef, editor, sheet) {

   for(var actionCellId in actionFormulaCells) {

      var parameters = sheet.ioParameterList[actionCellId];
            if(typeof parameters === 'undefined') continue;

      switch(parameters.function_name) {
          case "EMAILONEDIT" :
          case "EMAILONEDITIF" :
             cmdline = "setemailparameters "+actionCellId+ " " + editedCellRef;
             // hold off on commands until recalc done
              editor.deferredEmailCommands.push({cmdstr: cmdline, saveundo: false});
            break;
   }
}

}
