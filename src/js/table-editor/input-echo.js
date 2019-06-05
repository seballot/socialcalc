// *************************************
//
// InputEcho class:
//
// This object creates and controls an element that echos what's in the InputBox during editing
// It is draggable.
//
// *************************************

SocialCalc.InputEcho = function(editor) {

   var scc = SocialCalc.Constants;

   this.editor = editor; // the TableEditor this belongs to
   this.text = ""; // current value of what is displayed
   this.interval = null; // timer handle
   this.functionbox = null; // function chooser dialog

   // element containing main echo as well as prompt line
   this.container = document.createElement("div");
   this.container.id = "input-echo";
   this.container.className = "cell";
   this.main = document.createElement("div");
   this.main.className = "input-echo-text";
   this.container.appendChild(this.main);
   this.prompt = document.createElement("div");
   this.prompt.className = "input-echo-prompt";
   this.container.appendChild(this.prompt);

   $(editor.toplevel).find('#te_griddiv').append(this.container);
}

// Methods:

SocialCalc.InputEcho.prototype.ShowInputEcho = function(show) {return SocialCalc.ShowInputEcho(this, show);};
SocialCalc.InputEcho.prototype.SetText = function(str) {return SocialCalc.SetInputEchoText(this, str);};

// Functions:

SocialCalc.ShowInputEcho = function(inputecho, show) {

   var cell, position;
   var editor = inputecho.editor;

   if (!editor) return;

   if (show) {
      editor.cellhandles.ShowCellHandles(false);
      cell=SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);
      inputecho.container.style.left = $(cell.element).position().left + "px";
      inputecho.container.style.top = $(cell.element).position().top + "px";
      inputecho.container.style['min-width'] = $(cell.element).outerWidth(true) + 1 + "px";
      inputecho.container.style['min-height'] = $(cell.element).outerHeight(true) + 1 + "px";
      inputecho.container.style.display = "block";
      if (inputecho.interval) window.clearInterval(inputecho.interval); // just in case
      inputecho.interval = window.setInterval(SocialCalc.InputEchoHeartbeat, 50);
   }
   else {
      if (inputecho.interval) window.clearInterval(inputecho.interval);
      inputecho.container.style.display = "none";
   }

}

SocialCalc.SetInputEchoText = function(inputecho, str) {

   var scc = SocialCalc.Constants;
   var fname, fstr;
   var newstr = SocialCalc.special_chars(str);
   newstr = newstr.replace(/\n/g,"<br>");

   if (inputecho.text != newstr) {
      inputecho.main.innerHTML = newstr;
      inputecho.text = newstr;
   }

   var parts = str.match(/.*[\+\-\*\/\&\^\<\>\=\,\(]([A-Za-z][A-Za-z][\w\.]*?)\([^\)]*$/);
   if (str.charAt(0)=="=" && parts) {
      fname = parts[1].toUpperCase();
      if (SocialCalc.Formula.FunctionList[fname]) {
         SocialCalc.Formula.FillFunctionInfo(); //  make sure filled
         fstr = SocialCalc.special_chars(fname+"("+SocialCalc.Formula.FunctionArgString(fname)+")");
      }
      else {
         fstr = scc.ietUnknownFunction+fname;
      }
      if (inputecho.prompt.innerHTML != fstr) {
         inputecho.prompt.innerHTML = fstr;
         inputecho.prompt.style.display = "block";
      }
   }
   else if (inputecho.prompt.style.display != "none") {
      inputecho.prompt.innerHTML = "";
      inputecho.prompt.style.display = "none";
   }

}

SocialCalc.InputEchoHeartbeat = function() {

   var editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
   if (!editor) return true; // we're not handling it -- let browser do default

   editor.inputEcho.SetText(editor.inputBox.GetText()+"_");

}

SocialCalc.InputEchoMouseDown = function(e) {
   var event = e || window.event;

   var editor = SocialCalc.Keyboard.focusTable; // get TableEditor doing keyboard stuff
   if (!editor) return true; // we're not handling it -- let browser do default

   editor.inputBox.element.focus();
};
