// *************************************
//
// InputBox class:
//
// This class deals with the text box for editing cell contents.
// It mainly controls a user input box for typed content and is used to interact with
// the keyboard code, etc.
//
// You can use this inside a formula bar control of some sort.
// You create this after you have created a table editor object (but not necessarily
// done the CreateTableEditor method).
//
// When the user starts typing text, or double-clicks on a cell, this object
// comes into play.
//
// The element given when this is first constructed should be an input HTMLElement or
// something that acts like one. Check the code here to see what is done to it.
//
// *************************************

SocialCalc.InputBox = function(element, editor) {

   if (!element) return; // invoked without enough data to work

   this.element = element; // the input element associated with this InputBox
   this.editor = editor; // the TableEditor this belongs to
   this.inputEcho = null;

   editor.inputBox = this;

   element.onmousedown = SocialCalc.InputBoxOnMouseDown;

   editor.MoveECellCallback.formulabar = function(e){
      if (e.state!="start") return; // if not in normal keyboard mode don't replace formula bar
      editor.inputBox.DisplayCellContents(e.ecell.coord);
   };
}


// Methods:

SocialCalc.InputBox.prototype.DisplayCellContents = function(coord) {SocialCalc.InputBoxDisplayCellContents(this, coord);};
SocialCalc.InputBox.prototype.ShowInputBox = function(show) {this.editor.inputEcho.ShowInputEcho(show);};
SocialCalc.InputBox.prototype.GetText = function() {return this.element.value;};
SocialCalc.InputBox.prototype.SetText = function(newtext) {
   if (!this.element) return;
   this.element.value=newtext;
   this.editor.inputEcho.SetText(newtext+"_");
};
SocialCalc.InputBox.prototype.Focus = function() {SocialCalc.InputBoxFocus(this);};
SocialCalc.InputBox.prototype.Blur = function() {return this.element.blur();};
SocialCalc.InputBox.prototype.Select = function(t) {
   if (!this.element) return;
   switch (t) {
      case "end":
         if (document.selection && document.selection.createRange) {
            /* IE 4+ - Safer than setting .selectionEnd as it also works for Textareas. */
            try {
               var range = document.selection.createRange().duplicate();
               range.moveToElementText(this.element);
               range.collapse(false);
               range.select();
         }
            catch (e) {
               if (this.element.selectionStart!=undefined) {
                  this.element.selectionStart=this.element.value.length;
                  this.element.selectionEnd=this.element.value.length;
            }
         }
      } else if (this.element.selectionStart!=undefined) {
            this.element.selectionStart=this.element.value.length;
            this.element.selectionEnd=this.element.value.length;
      }
         break;
   }
};

// Functions:

//
// SocialCalc.InputBoxDisplayCellContents(inputbox, coord)
//
// Sets input box to the contents of the specified cell (or ecell if null).
//

SocialCalc.InputBoxDisplayCellContents = function(inputbox, coord) {

   var scc = SocialCalc.Constants;

   if (!inputbox) return;
   if (!coord) {
     if (!inputbox.editor) return; // not initialized yet
     if (!inputbox.editor.ecell) return; // not initialized yet
     coord = inputbox.editor.ecell.coord;
}
   var text = SocialCalc.GetCellContents(inputbox.editor.context.sheetobj, coord);
   if (text.indexOf("\n")!=-1) {
      text = scc.s_inputboxdisplaymultilinetext;
      inputbox.element.disabled = true;
   }
   else if (inputbox.editor.ECellReadonly()) {
      inputbox.element.disabled = true;
   }
   else {
      inputbox.element.disabled = false;
   }
   inputbox.SetText(text);

}

//
// SocialCalc.InputBoxFocus(inputbox)
//
// Call this to have the input box get the focus and respond to keystrokes
// but still pass them off to SocialCalc.ProcessKey.
//

SocialCalc.InputBoxFocus = function(inputbox) {

   if (!inputbox) return;
   inputbox.element.focus();
   var editor = inputbox.editor;
   editor.state = "input";
   var wval = editor.workingvalues;
   wval.partialexpr = "";
   wval.ecoord = editor.ecell.coord;
   wval.erow = editor.ecell.row;
   wval.ecol = editor.ecell.col;

};

//
// SocialCalc.InputBoxOnMouseDown(e)
//
// This is called when the input box gets the focus. It then responds to keystrokes
// and pass them off to SocialCalc.ProcessKey, but in a different editing state.
//

SocialCalc.InputBoxOnMouseDown = function(e) {

   var editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
   if (!editor) return true; // we're not handling it -- let browser do default
   var wval = editor.workingvalues;

   switch (editor.state) {
      case "start":
         editor.state="inputboxdirect";
         wval.partialexpr = "";
         wval.ecoord = editor.ecell.coord;
         wval.erow = editor.ecell.row;
         wval.ecol = editor.ecell.col;
         editor.inputEcho.ShowInputEcho(true);
         break;

      case "input":
         wval.partialexpr = ""; // make sure not pointing
         editor.MoveECell(wval.ecoord);
         editor.state="inputboxdirect";
         SocialCalc.KeyboardFocus(); // may have come here from outside of grid
         break;

      case "inputboxdirect":
         break;
   }
}
