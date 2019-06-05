// Clipboard

SocialCalc.SpreadsheetControlClipboardOnclick = function(s, t) {
   var s = SocialCalc.GetSpreadsheetControlObject();
   clipele = document.getElementById(s.idPrefix+"clipboardtext");
   document.getElementById(s.idPrefix+"clipboardformat-tab").checked = true;

   try {
      clipele.value = SocialCalc.ConvertSaveToOtherFormat(SocialCalc.Clipboard.clipboard, "tab");
} catch (err) {
      console.error(err);
}

   return;
}

SocialCalc.SpreadsheetControlClipboardFormat = function(which) {
   var s = SocialCalc.GetSpreadsheetControlObject();
   clipele = document.getElementById(s.idPrefix+"clipboardtext");
   clipele.value = SocialCalc.ConvertSaveToOtherFormat(SocialCalc.Clipboard.clipboard, which);
}

SocialCalc.SpreadsheetControlClipboardLoad = function() {
   var s = SocialCalc.GetSpreadsheetControlObject();
   var savetype = "tab";
   SocialCalc.SetTab(s.tabs[0].name); // return to first tab
   SocialCalc.KeyboardFocus();
   if (document.getElementById(s.idPrefix+"clipboardformat-csv").checked) {
      savetype = "csv";
   }
   else if (document.getElementById(s.idPrefix+"clipboardformat-scsave").checked) {
      savetype = "scsave";
   }
   // control+v ignores ignore windows clipboard - see ctrlkeyFunction(editor, charname)
   s.editor.pastescclipboard = true;
   s.editor.EditorScheduleSheetCommands("loadclipboard "+
      SocialCalc.encodeForSave(
         SocialCalc.ConvertOtherFormatToSave(document.getElementById(s.idPrefix+"clipboardtext").value, savetype)), true, false);
}

SocialCalc.SpreadsheetControlClipboardClear = function() {
   var s = SocialCalc.GetSpreadsheetControlObject();
   var clipele = document.getElementById(s.idPrefix+"clipboardtext");
   clipele.value = "";
   s.editor.EditorScheduleSheetCommands("clearclipboard", true, false);
   clipele.focus();
}

SocialCalc.SpreadsheetControlClipboardExport = function() {
   var s = SocialCalc.GetSpreadsheetControlObject();
   if (s.ExportCallback) {
      s.ExportCallback(s);
   }
   SocialCalc.SetTab(s.tabs[0].name); // return to first tab
   SocialCalc.KeyboardFocus();
}