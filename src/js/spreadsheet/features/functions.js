//
// Formula Bar Button Routines
//

SocialCalc.SpreadsheetControlDoFunctionList = function() {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var main = spreadsheet.$container.find('#functions-list-modal');
   main.show().focus();
   spreadsheet.$container.find('.modal-container').fadeIn(300);

   spreadsheet.$container.find('.modal-container').click(function() { SocialCalc.SpreadsheetControl.HideFunctions(); })
   spreadsheet.$container.find('.modal').click(function(e) { e.preventDefault(); e.stopPropagation(); })
}


SocialCalc.SpreadsheetControl.FillFunctionNames = function(cname, ele) {

   var i, f;
   var scf = SocialCalc.Formula;

   ele.length = 0;
   f = scf.FunctionClasses[cname];
   for (i=0; i<f.items.length; i++) {
      ele.options[i] = new Option(f.items[i], f.items[i]);
      if (i==0) {
         ele.options[i].selected = true;
      }
   }
}

SocialCalc.SpreadsheetControl.GetFunctionInfoStr = function(fname) {

   var scf = SocialCalc.Formula;
   var f = scf.FunctionList[fname];
   var scsc = SocialCalc.special_chars;

   var str = ""
   str += "<div class='function-title'>"
   str += "   <span class='function-name'>"+fname+"</span>";
   str += "   <span class='function-args'>("+scsc(scf.FunctionArgString(fname))+")</span>";
   str += "</div>";
   str += '<div class="function-description">' + scsc(f[3]) + '</div>';

   return str;
}

SocialCalc.SpreadsheetControl.FunctionClassChosen = function(cname) {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var idp = spreadsheet.idPrefix+"function";
   var scf = SocialCalc.Formula;

   SocialCalc.SpreadsheetControl.FillFunctionNames(cname, document.getElementById(idp+"name"));

   SocialCalc.SpreadsheetControl.FunctionChosen(scf.FunctionClasses[cname].items[0]);

}

SocialCalc.SpreadsheetControl.FunctionChosen = function(fname) {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var idp = spreadsheet.idPrefix+"function";

   document.getElementById(idp+"desc").innerHTML = SocialCalc.SpreadsheetControl.GetFunctionInfoStr(fname);
}

SocialCalc.SpreadsheetControl.HideFunctions = function() {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   spreadsheet.$container.find('.modal-container, #functions-list-modal').fadeOut(300);
   SocialCalc.KeyboardFocus();
}

SocialCalc.SpreadsheetControl.DoFunctionPaste = function() {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var editor = spreadsheet.editor;
   var ele = document.getElementById(spreadsheet.idPrefix+"functionname");
   var mele = document.getElementById(spreadsheet.idPrefix+"multilinetextarea");

   var text = ele.value+"(";

   SocialCalc.SpreadsheetControl.HideFunctions();

   if (mele) { // multi-line editing is in progress
      mele.value += text;
      mele.focus();
      SocialCalc.CmdGotFocus(mele);
   }
   else {
      editor.EditorAddToInput(text, "=");
   }
}