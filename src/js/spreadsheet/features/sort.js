//
// TAB Routines
//

// Sort

SocialCalc.SpreadsheetControlSortOnclick = function(s, t) {

   var name, i;
   var namelist = [];
   var nl = document.getElementById(s.idPrefix+"sortlist");
   SocialCalc.LoadColumnChoosers(s);
   s.editor.RangeChangeCallback.sort = SocialCalc.UpdateSortRangeProposal;

   for (name in s.sheet.names) {
      namelist.push(name);
   }
   namelist.sort();
   nl.length = 0;
   nl.options[0] = new Option(SocialCalc.LocalizeString("[select range]"));
   nl.options[1] = new Option(SocialCalc.LocalizeString("Sort All"), "all");
   n_options = nl.options.length;

   for (i=0; i<namelist.length; i++) {
      name = namelist[i];
      nl.options[i+n_options] = new Option(name, name);
      if (name == s.sortrange) {
         nl.options[i+n_options].selected = true;
      }
   }
   if (s.sortrange == "") {
      nl.options[0].selected = true;
   }

   SocialCalc.UpdateSortRangeProposal(s.editor);
   SocialCalc.KeyboardFocus();
   return;

}

SocialCalc.SpreadsheetControlSortSave = function(editor, setting) {
   // Format is:
   //    sort:sortrange:major:up/down:minor:up/down:last:up/down

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var str, sele, rele;

   str = "sort:"+SocialCalc.encodeForSave(spreadsheet.sortrange)+":";
   sele = document.getElementById(spreadsheet.idPrefix+"majorsort");
   rele = document.getElementById(spreadsheet.idPrefix+"majorsortup");
   str += sele.selectedIndex + (rele.checked ? ":up" : ":down");
   sele = document.getElementById(spreadsheet.idPrefix+"minorsort");
   if (sele.selectedIndex>0) {
      rele = document.getElementById(spreadsheet.idPrefix+"minorsortup");
      str += ":"+sele.selectedIndex + (rele.checked ? ":up" : ":down");
   }
   else {
      str += "::";
   }
   sele = document.getElementById(spreadsheet.idPrefix+"lastsort");
   if (sele.selectedIndex>0) {
      rele = document.getElementById(spreadsheet.idPrefix+"lastsortup");
      str += ":"+sele.selectedIndex + (rele.checked ? ":up" : ":down");
   }
    else {
      str += "::";
   }
   return str+"\n";
}

SocialCalc.SpreadsheetControlSortLoad = function(editor, setting, line, flags) {
   var parts, ele;

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();

   parts = line.split(":");
   spreadsheet.sortrange = SocialCalc.decodeFromSave(parts[1]);
   ele = document.getElementById(spreadsheet.idPrefix+"sortbutton");
   if (spreadsheet.sortrange) {
      ele.value = SocialCalc.LocalizeString("Sort ")+spreadsheet.sortrange;
      ele.style.visibility = "visible";
   }
   else {
      ele.style.visibility = "hidden";
   }
   SocialCalc.LoadColumnChoosers(spreadsheet);

   sele = document.getElementById(spreadsheet.idPrefix+"majorsort");
   sele.selectedIndex = parts[2]-0;
   document.getElementById(spreadsheet.idPrefix+"majorsort"+parts[3]).checked = true;
   sele = document.getElementById(spreadsheet.idPrefix+"minorsort");
   if (parts[4]) {
      sele.selectedIndex = parts[4]-0;
      document.getElementById(spreadsheet.idPrefix+"minorsort"+parts[5]).checked = true;
   }
   else {
      sele.selectedIndex = 0;
      document.getElementById(spreadsheet.idPrefix+"minorsortup").checked = true;
   }
   sele = document.getElementById(spreadsheet.idPrefix+"lastsort");
   if (parts[6]) {
      sele.selectedIndex = parts[6]-0;
      document.getElementById(spreadsheet.idPrefix+"lastsort"+parts[7]).checked = true;
   }
    else {
      sele.selectedIndex = 0;
      document.getElementById(spreadsheet.idPrefix+"lastsortup").checked = true;
   }

   return true;
}

//
// SocialCalc.LoadColumnChoosers(spreadsheet)
//
// Updates list of columns for choosing which to sort for Major, Minor, and Last sort
//

SocialCalc.LoadColumnChoosers = function(spreadsheet) {

   var SCLoc = SocialCalc.LocalizeString;

   var sortrange, nrange, rparts, col, colname, sele, oldindex;

   if (spreadsheet.sortrange && spreadsheet.sortrange.indexOf(":")==-1) { // sortrange is a named range
      nrange = SocialCalc.Formula.LookupName(spreadsheet.sheet, spreadsheet.sortrange || "");
      if (nrange.type == "range") {
         rparts = nrange.value.match(/^(.*)\|(.*)\|$/);
         sortrange = rparts[1] + ":" + rparts[2];
      }
      else {
         sortrange = "A1:A1";
      }
   }
   else {
      sortrange = spreadsheet.sortrange;
   }
   var range = SocialCalc.ParseRange(sortrange);
   sele = document.getElementById(spreadsheet.idPrefix+"majorsort");
   oldindex = sele.selectedIndex;
   sele.options.length = 0;
   sele.options[sele.options.length] = new Option(SCLoc("[None]"), "");
   for (var col=range.cr1.col; col<=range.cr2.col; col++) {
      colname = SocialCalc.rcColname(col);
      sele.options[sele.options.length] = new Option(SCLoc("Column ")+colname, colname);
   }
   sele.selectedIndex = oldindex > 1 && oldindex <= (range.cr2.col-range.cr1.col+1) ? oldindex : 1; // restore what was there if reasonable
   sele = document.getElementById(spreadsheet.idPrefix+"minorsort");
   oldindex = sele.selectedIndex;
   sele.options.length = 0;
   sele.options[sele.options.length] = new Option(SCLoc("[None]"), "");
   for (var col=range.cr1.col; col<=range.cr2.col; col++) {
      colname = SocialCalc.rcColname(col);
      sele.options[sele.options.length] = new Option(colname, colname);
   }
   sele.selectedIndex = oldindex > 0 && oldindex <= (range.cr2.col-range.cr1.col+1) ? oldindex : 0; // default to [none]
   sele = document.getElementById(spreadsheet.idPrefix+"lastsort");
   oldindex = sele.selectedIndex;
   sele.options.length = 0;
   sele.options[sele.options.length] = new Option(SCLoc("[None]"), "");
   for (var col=range.cr1.col; col<=range.cr2.col; col++) {
      colname = SocialCalc.rcColname(col);
      sele.options[sele.options.length] = new Option(colname, colname);
   }
   sele.selectedIndex = oldindex > 0 && oldindex <= (range.cr2.col-range.cr1.col+1) ? oldindex : 0; // default to [none]

}

//
// SocialCalc.UpdateSortRangeProposal(editor)
//
// Updates sort range proposed in the UI in element idPrefix+sortlist
//

SocialCalc.UpdateSortRangeProposal = function(editor) {

   var ele = document.getElementById(SocialCalc.GetSpreadsheetControlObject().idPrefix+"sortlist");
   if (editor.range.hasrange) {
      ele.options[0].text = SocialCalc.crToCoord(editor.range.left, editor.range.top) + ":" +
                            SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
   }
   else {
      ele.options[0].text = SocialCalc.LocalizeString("[select range]");
   }

}
