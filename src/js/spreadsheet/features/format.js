// Settings

SocialCalc.SpreadsheetControlSettingsSwitch = function(target) {
   SocialCalc.SettingControlReset();
   var s = SocialCalc.GetSpreadsheetControlObject();
   var sheettable = document.getElementById(s.idPrefix+"sheetsettingstable");
   var celltable = document.getElementById(s.idPrefix+"cellsettingstable");
   var sheettoolbar = document.getElementById(s.idPrefix+"sheetsettingstoolbar");
   var celltoolbar = document.getElementById(s.idPrefix+"cellsettingstoolbar");
   if (target=="sheet") {
      sheettable.style.display = "block";
      celltable.style.display = "none";
      sheettoolbar.style.display = "block";
      celltoolbar.style.display = "none";
      SocialCalc.SettingsControlSetCurrentPanel(s.views.settings.values.sheetspanel);
      }
   else {
      sheettable.style.display = "none";
      celltable.style.display = "block";
      sheettoolbar.style.display = "none";
      celltoolbar.style.display = "block";
      SocialCalc.SettingsControlSetCurrentPanel(s.views.settings.values.cellspanel);
      }
   }

SocialCalc.SettingsControlSave = function(target) {
   var range, cmdstr;
   var s = SocialCalc.GetSpreadsheetControlObject();
   var sc = SocialCalc.SettingsControls;
   var panelobj = sc.CurrentPanel;
   var attribs = SocialCalc.SettingsControlUnloadPanel(panelobj);

   SocialCalc.SetTab(s.tabs[0].name); // return to first tab
   SocialCalc.KeyboardFocus();

   if (target=="sheet") {
      cmdstr = s.sheet.DecodeSheetAttributes(attribs);
      }
   else if (target=="cell") {
      if (s.editor.range.hasrange) {
         range = SocialCalc.crToCoord(s.editor.range.left, s.editor.range.top) + ":" +
            SocialCalc.crToCoord(s.editor.range.right, s.editor.range.bottom);
         }
      cmdstr = s.sheet.DecodeCellAttributes(s.editor.ecell.coord, attribs, range);
      }
   else { // Cancel
      }
   if (cmdstr) {
      s.editor.EditorScheduleSheetCommands(cmdstr, true, false);
      }
   }


SocialCalc.HandleStyleButtonClicked = function(button) {
   var range, cmdstr, cmdValue;
   var editor = SocialCalc.GetSpreadsheetControlObject().editor;

   if ($(button).is(".style-btn")) {
      // change state of clicked button and of siblings (in case of radio button liek text-align)
      $(button).toggleClass('active');
      $(button).siblings('[data-command="'+$(button).data('command')+'"]').removeClass('active');

      cmdValue = $(button).hasClass('active') ? $(button).data('value') : null;
   } else {
      cmdValue = $(button).val();
   }

   if (editor.range.hasrange) {
      range = SocialCalc.crToCoord(editor.range.left, editor.range.top) + ":"
      range += SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
   } else {
      range = editor.ecell.coord
   }

   // apply command reading button data attributes
   cmdstr = "set " + range + " " + $(button).data('command') + " " + cmdValue;
   console.log("on button click", cmdstr);
   if (cmdstr) editor.EditorScheduleSheetCommands(cmdstr, true, false);
}