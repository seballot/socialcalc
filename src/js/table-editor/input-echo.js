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

   this.container = null; // element containing main echo as well as prompt line
   this.main = null; // main echo area
   this.prompt = null;
   this.hint = null; // focus cell hint area

   this.functionbox = null; // function chooser dialog

   this.container = document.createElement("div");
   SocialCalc.setStyles(this.container, "display:none;position:absolute;zIndex:10;");

   this.main = document.createElement("div");
   if (scc.defaultInputEchoClass) this.main.className = scc.defaultInputEchoClass;
   if (scc.defaultInputEchoStyle) SocialCalc.setStyles(this.main, scc.defaultInputEchoStyle);
   this.main.innerHTML = "&nbsp;";

   this.hint = document.createElement("div");
   if (scc.defaultInputEchoHintClass) this.hint.className = scc.defaultInputEchoHintClass;
   if (scc.defaultInputEchoHintStyle) SocialCalc.setStyles(this.hint, scc.defaultInputEchoHintStyle);
   this.hint.innerHTML = "";

   this.container.appendChild(this.hint);
   this.container.appendChild(this.main);

   this.prompt = document.createElement("div");
   if (scc.defaultInputEchoPromptClass) this.prompt.className = scc.defaultInputEchoPromptClass;
   if (scc.defaultInputEchoPromptStyle) SocialCalc.setStyles(this.prompt, scc.defaultInputEchoPromptStyle);
   this.prompt.innerHTML = "";

   this.container.appendChild(this.prompt);

   SocialCalc.DragRegister(this.main, true, true,
                 {MouseDown: SocialCalc.DragFunctionStart,
                  MouseMove: SocialCalc.DragFunctionPosition,
                  MouseUp: SocialCalc.DragFunctionPosition,
                  Disabled: null, positionobj: this.container},
                  this.editor.toplevel);

   editor.toplevel.appendChild(this.container);

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
      if (cell) {
         position = SocialCalc.GetElementPosition(cell.element);
         inputecho.container.style.left = (position.left-1)+"px";
         inputecho.container.style.top = (position.top-1)+"px";
         }
      inputecho.hint.innerHTML = editor.ecell.coord;
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

//      if (event.stopPropagation) event.stopPropagation(); // DOM Level 2
//      else event.cancelBubble = true; // IE 5+
//      if (event.preventDefault) event.preventDefault(); // DOM Level 2
//      else event.returnValue = false; // IE 5+

      editor.inputBox.element.focus();

//      return false;
      };
