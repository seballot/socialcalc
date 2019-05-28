SocialCalc.SpreadsheetControlDoLink = function() {

   var SCLoc = SocialCalc.LocalizeString;

   var str, ele, text, cell, setformat, popup;

   var scc = SocialCalc.Constants;
   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var editor = spreadsheet.editor;
   var wval = editor.workingvalues;

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var idp = spreadsheet.idPrefix+"link";

   ele = document.getElementById(idp+"dialog");
   if (ele) return; // already have one

   switch (editor.state) {
      case "start":
         wval.ecoord = editor.ecell.coord;
         wval.erow = editor.ecell.row;
         wval.ecol = editor.ecell.col;
         editor.RangeRemove();
         text = SocialCalc.GetCellContents(editor.context.sheetobj, wval.ecoord);
         break;

      case "input":
      case "inputboxdirect":
         text = editor.inputBox.GetText();
         break;
      }

   editor.inputBox.element.disabled = true;

   if (text.charAt(0)=="'") {
      text = text.slice(1);
      }

   var parts = SocialCalc.ParseCellLinkText(text);

   text = SocialCalc.special_chars(text);

   cell = spreadsheet.sheet.cells[editor.ecell.coord];
   if (!cell || !cell.textvalueformat) { // set to link format, but don't override
      setformat = " checked";
      }
   else {
      setformat = "";
      }

   popup = parts.newwin ? " checked" : "";

   str = '<div style="padding:6px 0px 4px 6px;">'+
         '<span style="font-size:smaller;">'+SCLoc("Description")+'</span><br>'+
         '<input type="text" id="'+idp+'desc" style="width:380px;" value="'+SocialCalc.special_chars(parts.desc)+'"><br>'+
         '<span style="font-size:smaller;">'+SCLoc("URL")+'</span><br>'+
         '<input type="text" id="'+idp+'url" style="width:380px;" value="'+SocialCalc.special_chars(parts.url)+'"><br>';
   if (SocialCalc.Callbacks.MakePageLink) { // only show if handling pagenames here
      str += '<span style="font-size:smaller;">'+SCLoc("Page Name")+'</span><br>'+
             '<input type="text" id="'+idp+'pagename" style="width:380px;" value="'+SocialCalc.special_chars(parts.pagename)+'"><br>'+
             '<span style="font-size:smaller;">'+SCLoc("Workspace")+'</span><br>'+
             '<input type="text" id="'+idp+'workspace" style="width:380px;" value="'+SocialCalc.special_chars(parts.workspace)+'"><br>';
      }
   str += SocialCalc.LocalizeSubstrings('<input type="checkbox" id="'+idp+'format"'+setformat+'>&nbsp;'+
         '<span style="font-size:smaller;">%loc!Set to Link format!</span><br>'+
         '<input type="checkbox" id="'+idp+'popup"'+popup+'>&nbsp;'+
         '<span style="font-size:smaller;">%loc!Show in new browser window!</span>'+
         '</div>'+
         '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
         '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControlDoLinkPaste();">&nbsp;'+
         '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControlDoLinkClear();">&nbsp;'+
         '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideLink();"></div>'+
         '</div>');

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

   main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+SCLoc("Link Input Box")+'</td>'+
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideLink();">&nbsp;X&nbsp;</td></tr></table>'+
      '<div style="background-color:#DDD;">'+str+'</div>';

   SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, 
                 {MouseDown: SocialCalc.DragFunctionStart, 
                  MouseMove: SocialCalc.DragFunctionPosition,
                  MouseUp: SocialCalc.DragFunctionPosition,
                  Disabled: null, positionobj: main},
                  spreadsheet.spreadsheetDiv);

   spreadsheet.spreadsheetDiv.appendChild(main);

   ele = document.getElementById(idp+"url");
   ele.focus();
   SocialCalc.CmdGotFocus(ele);
//!!! need to do keyboard handling: if esc, hide?

   }


SocialCalc.SpreadsheetControl.HideLink = function() {

   var scc = SocialCalc.Constants;
   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var editor = spreadsheet.editor;

   var ele = document.getElementById(spreadsheet.idPrefix+"linkdialog");
   ele.innerHTML = "";

   SocialCalc.DragUnregister(ele);

   SocialCalc.KeyboardFocus();

   if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
      }

   switch (editor.state) {
      case "start":
         editor.inputBox.DisplayCellContents(null);
         break;

      case "input":
      case "inputboxdirect":
         editor.inputBox.element.disabled = false;
         editor.inputBox.Focus();
         break;
      }

   }

SocialCalc.SpreadsheetControlDoLinkClear = function() {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();

   document.getElementById(spreadsheet.idPrefix+"linkdesc").value = "";
   document.getElementById(spreadsheet.idPrefix+"linkpagename").value = "";
   document.getElementById(spreadsheet.idPrefix+"linkworkspace").value = "";

   var ele = document.getElementById(spreadsheet.idPrefix+"linkurl");
   ele.value = "";
   ele.focus();

   }


SocialCalc.SpreadsheetControlDoLinkPaste = function() {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var editor = spreadsheet.editor;
   var wval = editor.workingvalues;

   var descele = document.getElementById(spreadsheet.idPrefix+"linkdesc");
   var urlele = document.getElementById(spreadsheet.idPrefix+"linkurl");
   var pagenameele = document.getElementById(spreadsheet.idPrefix+"linkpagename");
   var workspaceele = document.getElementById(spreadsheet.idPrefix+"linkworkspace");
   var formatele = document.getElementById(spreadsheet.idPrefix+"linkformat");
   var popupele = document.getElementById(spreadsheet.idPrefix+"linkpopup");

   var text = "";

   var ltsym, gtsym, obsym, cbsym;

   if (popupele.checked) {
      ltsym = "<<"; gtsym = ">>"; obsym = "[["; cbsym = "]]";
      }
   else {
      ltsym = "<"; gtsym = ">"; obsym = "["; cbsym = "]";
      }

   if (pagenameele && pagenameele.value) {
      if (workspaceele.value) {
         text = descele.value+"{"+workspaceele.value+obsym+pagenameele.value+cbsym+"}";
         }
      else {
         text = descele.value+obsym+pagenameele.value+cbsym;
         }
      }
   else {
      text = descele.value+ltsym+urlele.value+gtsym;
      }

   SocialCalc.SpreadsheetControl.HideLink();

   switch (editor.state) {
      case "start":
         wval.partialexpr = "";
         wval.ecoord = editor.ecell.coord;
         wval.erow = editor.ecell.row;
         wval.ecol = editor.ecell.col;
         break;
      case "input":
      case "inputboxdirect":
         editor.inputBox.Blur();
         editor.inputBox.ShowInputBox(false);
         editor.state = "start";
         break;
      }

   if (formatele.checked) {
      SocialCalc.SpreadsheetControlExecuteCommand(null, "set %C textvalueformat text-link", "");
      }

   editor.EditorSaveEdit(text);

   }