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
   this.main = document.createElement("input");
   this.main.className = "input-echo-text input-cell";
   this.container.appendChild(this.main);
   this.fakeMain = document.createElement("div");
   this.fakeMain.className = "input-echo-fake-text";
   this.container.appendChild(this.fakeMain);
   this.prompt = document.createElement("div");
   this.prompt.className = "input-echo-prompt custom-scroll-bar";
   this.container.appendChild(this.prompt);

   $(editor.toplevel).find('#te_griddiv').append(this.container);

   $(this.main).on('keyup', function() {
      editor.inputBox.element.value = $(this).val();
   })

   SocialCalc.MouseWheelRegister(this.prompt, "donothing"); // handle scrolling prompt results
}

// Functions:

SocialCalc.InputEcho.prototype.Show = function(show) {

   var cell, position;
   if (!this.editor) return;

   if (show) {
      this.editor.cellhandles.ShowCellHandles(false);
      cell = SocialCalc.GetEditorCellElement(this.editor, this.editor.ecell.row, this.editor.ecell.col);
      var isFirefox = typeof InstallTrigger !== 'undefined';
      var offsetLeft = isFirefox ? 1 : 0;
      var offsetTop = isFirefox ? 2 : 1;
      this.container.style.left = $(cell.element).position().left - offsetLeft + "px";
      this.container.style.top = $(cell.element).position().top - offsetTop + "px";
      this.container.style['min-width'] = $(cell.element).outerWidth(true) + 1 + "px";
      this.container.style['min-height'] = $(cell.element).outerHeight(true) + 2 + "px";
      this.container.style.display = "block";
      this.main.focus();

      // reduce the size and change position of prompt when close to the bottom right border
      var leftOffset = this.editor.verticaltablecontrol.$main.offset().left - $(this.container).offset().left - $(this.prompt).width() - 20;
      var bottomOffset = this.editor.horizontaltablecontrol.$main.offset().top - $(this.container).offset().top - 40;
      this.prompt.style.left = Math.min(leftOffset, 0) + "px";
      $(this.prompt).css('max-height', Math.min(bottomOffset, 400) + "px");

      if (this.interval) window.clearInterval(this.interval); // just in case
      var that = this;
      this.interval = window.setInterval(function() { that.HandleInputEchoHeartbeat() }, 50);
      this.container.style.width = $('.input-echo-fake-text').width() + 20 + "px";
   }
   else {
      if (this.interval) window.clearInterval(this.interval);
      this.container.style.display = "none";
   }

}

// Do not call that method directly, this is just a mirror of the input value
// call instead editor.inputBox.SetText
SocialCalc.InputEcho.prototype.SetText  = function(str, focus) {

   var scc = SocialCalc.Constants;
   var fname, fstr = "";
   var newstr = SocialCalc.special_chars(str).replace(/\n/g,"<br>");

   if (this.text != newstr) {
      $(this.main).val(newstr);
      this.fakeMain.innerHTML = newstr;
      this.text = newstr;

      if (str.charAt(0) == "=") {
         var fullFunctionName = str.indexOf('(') > -1;
         fname = str.slice(1).split('_')[0].split('(')[0].toUpperCase();
         if (fullFunctionName) {
            fstr = '<div class="function-container">';
            if (SocialCalc.Formula.FunctionList[fname])
               fstr += SocialCalc.SpreadsheetControl.GetFunctionInfoStr(fname);
            else
               fstr += scc.ietUnknownFunction+fname;
            fstr += '</div>'
         }
         else {
            if (fname.length > 1) {
               var funcToDisplay = []
               // Search function by name
               for(var func in SocialCalc.Formula.FunctionList)
                  if (func.indexOf(fname) > -1) funcToDisplay.push(func);

               fname = fname.toLowerCase();
               // Search by function group
               for(var groupName in SocialCalc.Formula.FunctionClasses) {
                  var group = SocialCalc.Formula.FunctionClasses[groupName];
                  if (groupName.toLowerCase().indexOf(fname) > -1 || group.name.toLowerCase().indexOf(fname) > -1)
                     funcToDisplay = funcToDisplay.concat(group.items)
               }
               // Search by function description
               for(var funcName in SocialCalc.Formula.FunctionList) {
                  var func = SocialCalc.Formula.FunctionList[funcName];
                  if (func[3].toLowerCase().indexOf(fname) > -1) funcToDisplay.push(funcName)
               }
               // Create html
               funcToDisplay = funcToDisplay.filter(function(value, index, self) { return self.indexOf(value) === index; });
               for(var i = 0; i < funcToDisplay.length; i++) {
                  var func = funcToDisplay[i];
                  fstr += '<div class="function-container" data-function="' + func + '">';
                  fstr += SocialCalc.SpreadsheetControl.GetFunctionInfoStr(func) + '</div>';
               }
            }
         }
      }

      this.container.style.width = $('.input-echo-fake-text').width() + 20 + "px";

      if (fstr) {
         this.prompt.innerHTML = fstr;
         this.prompt.style.display = "block";
         var that = this;
         $(this.prompt).find('.function-container').click(function(e) { that.HandlePromptMouseDown(e); });
         $(this.prompt).animate({scrollTop: 0}, 0);
      }
      else {
         this.prompt.innerHTML = "";
         this.prompt.style.display = "none";
      }

      if ($(this.main).is(':focus')) {
         this.container.appendChild(this.prompt);
         this.editor.inputFocused = this.main;
      }
      else if ($(this.editor.inputBox.element).is(':focus')) {
         $(this.editor.inputBox.element).parent()[0].appendChild(this.prompt);
         this.editor.inputFocused = this.editor.inputBox.element;
      }
   }
}

SocialCalc.InputEcho.prototype.HandleInputEchoHeartbeat = function() {
   this.SetText(this.main.value);
}

SocialCalc.InputEcho.prototype.Focus = function() {
   this.editor.inputBox.Focus();
   this.main.focus();
}

SocialCalc.InputEcho.prototype.Blur = function() {
   this.main.blur();
}

SocialCalc.InputEcho.prototype.HandlePromptMouseDown = function(e) {
   var event = e || window.event;
   var ele = event.target || event.srcElement;
   var fname = $(ele).data('function') || $(ele).closest('.function-container').data('function');
   var val = '=' + fname + '(';
   if (fname) {
      this.SetText(val);
      this.editor.inputBox.SetText(val);
   }
   $(this.prompt).parent().find('.input-cell').focus();
}
