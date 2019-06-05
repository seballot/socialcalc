//
// Formula Bar Button Routines
//

SocialCalc.SpreadsheetControlDoFunctionList = function() {

   var i, cname, str, f, ele;

   var scf = SocialCalc.Formula;
   var scc = SocialCalc.Constants;
   var fcl = scc.function_classlist;

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var idp = spreadsheet.idPrefix+"function";

   ele = document.getElementById(idp+"dialog");
   if (ele) return; // already have one

   scf.FillFunctionInfo();

   str = '<table><tr><td><span style="font-size:x-small;font-weight:bold">%loc!Category!</span><br>'+
      '<select id="'+idp+'class" size="'+fcl.length+'" style="width:120px;" onchange="SocialCalc.SpreadsheetControl.FunctionClassChosen(this.options[this.selectedIndex].value);">';
   for (i=0; i<fcl.length; i++) {
      str += '<option value="'+fcl[i]+'"'+(i==0?' selected>':'>')+SocialCalc.special_chars(scf.FunctionClasses[fcl[i]].name)+'</option>';
   }
   str += '</select></td><td>&nbsp;&nbsp;</td><td id="'+idp+'list"><span style="font-size:x-small;font-weight:bold">%loc!Functions!</span><br>'+
      '<select id="'+idp+'name" size="'+fcl.length+'" style="width:240px;" '+
      'onchange="SocialCalc.SpreadsheetControl.FunctionChosen(this.options[this.selectedIndex].value);" ondblclick="SocialCalc.SpreadsheetControl.DoFunctionPaste();">';
   str += SocialCalc.SpreadsheetControl.GetFunctionNamesStr("all");
   str += '</td></tr><tr><td colspan="3">'+
          '<div id="'+idp+'desc" style="width:380px;height:80px;overflow:auto;font-size:x-small;">'+SocialCalc.SpreadsheetControl.GetFunctionInfoStr(scf.FunctionClasses[fcl[0]].items[0])+'</div>'+
          '<div style="width:380px;text-align:right;padding-top:6px;font-size:small;">'+
          '<input type="button" value="%loc!Paste!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoFunctionPaste();">&nbsp;'+
          '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideFunctions();"></div>'+
          '</td></tr></table>';

   var main = document.createElement("div");
   main.id = idp+"dialog";

   main.style.position = "absolute";

   var vp = SocialCalc.GetViewportInfo();
   var pos = SocialCalc.GetElementPositionWithScroll(spreadsheet.spreadsheetDiv);

   main.style.top = ((vp.height/3)-pos.top)+"px";
   main.style.left = ((vp.width/3)-pos.left)+"px";
   main.style.zIndex = 100;
   main.style.backgroundColor = "#FFF";
   main.style.border = "1px solid black";

   main.style.width = "400px";

   str = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;%loc!Function List!"+'</td>'+
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideFunctions();">&nbsp;X&nbsp;</td></tr></table>'+
      '<div style="background-color:#DDD;">'+str+'</div>';

   str = SocialCalc.LocalizeSubstrings(str);

   main.innerHTML = str;

   SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true,
                 {MouseDown: SocialCalc.DragFunctionStart,
                  MouseMove: SocialCalc.DragFunctionPosition,
                  MouseUp: SocialCalc.DragFunctionPosition,
                  Disabled: null, positionobj: main},
                  spreadsheet.spreadsheetDiv);

   spreadsheet.spreadsheetDiv.appendChild(main);

   ele = document.getElementById(idp+"name");
   ele.focus();
   SocialCalc.CmdGotFocus(ele);
//!!! need to do keyboard handling: if esc, hide; if All, letter scrolls to there

}

SocialCalc.SpreadsheetControl.GetFunctionNamesStr = function(cname) {

   var i, f;
   var scf = SocialCalc.Formula;
   var str = "";

   f = scf.FunctionClasses[cname];
   for (i=0; i<f.items.length; i++) {
      str += '<option value="'+f.items[i]+'"'+(i==0?' selected>':'>')+f.items[i]+'</option>';
   }

   return str;

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

   var str = "<b>"+fname+"("+scsc(scf.FunctionArgString(fname))+")</b><br>";
   str += scsc(f[3]);

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

   var ele = document.getElementById(spreadsheet.idPrefix+"functiondialog");
   ele.innerHTML = "";

   SocialCalc.DragUnregister(ele);

   SocialCalc.KeyboardFocus();

   if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
   }

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