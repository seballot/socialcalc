/*
* SettingsControls
*
* Each settings panel has an object in the following form:
*
*    {ctrl-name1: {setting: setting-nameA, type: ctrl-type, id: id-component},
*     ctrl-name2: {setting: setting-nameB, type: ctrl-type, id: id-component, initialdata: optional-initialdata-override},
*     ...}
*
* The ctrl-types are names that correspond to:
*
*    SocialCalc.SettingsControls.Controls = {
*       ctrl-type1: {
*          SetValue: function(panel-obj, ctrl-name, {def: true/false, val: value}) {...;},
*          ColorValues: if true, Onchanged converts between hex and RGB
*          GetValue: function(panel-obj, ctrl-name) {...return {def: true/false, val: value};},
*          Initialize: function(panel-obj, ctrl-name) {...;}, // used to fill dropdowns, etc.
*          InitialData: control-dependent, // used by Initialize (if no panel ctrlname.initialdata)
*          OnReset: function(ctrl-name) {...;}, // called to put down popups, etc.
*          ChangedCallback: function(ctrl-name) {...;} // if not null, called by control when user changes value
*       }
*
*/

SocialCalc.SettingsControls = {
   Controls: {},
   CurrentPanel: null // panel object to search on events
   };

//
// SocialCalc.SettingsControlSetCurrentPanel(panel-object)
//

SocialCalc.SettingsControlSetCurrentPanel = function(panelobj) {

   SocialCalc.SettingsControls.CurrentPanel = panelobj;

   SocialCalc.SettingsControls.PopupChangeCallback({panelobj: panelobj}, "", null);

   }


//
// SocialCalc.SettingsControlInitializePanel(panel-object)
//

SocialCalc.SettingsControlInitializePanel = function(panelobj) {

   var ctrlname;
   var sc = SocialCalc.SettingsControls;

   for (ctrlname in panelobj) {
      if (ctrlname=="name") continue;
      ctrl = sc.Controls[panelobj[ctrlname].type];
      if (ctrl && ctrl.Initialize) ctrl.Initialize(panelobj, ctrlname);
      }

   }


//
// SocialCalc.SettingsControlLoadPanel(panel-object, attribs)
//

SocialCalc.SettingsControlLoadPanel = function(panelobj, attribs) {

   var ctrlname;
   var sc = SocialCalc.SettingsControls;

   for (ctrlname in panelobj) {
      if (ctrlname=="name") continue;
      ctrl = sc.Controls[panelobj[ctrlname].type];
      if (ctrl && ctrl.SetValue) ctrl.SetValue(panelobj, ctrlname, attribs[panelobj[ctrlname].setting]);
      }

   }

//
// attribs = SocialCalc.SettingsControlUnloadPanel(panel-object)
//

SocialCalc.SettingsControlUnloadPanel = function(panelobj) {

   var ctrlname;
   var sc = SocialCalc.SettingsControls;
   var attribs = {};

   for (ctrlname in panelobj) {
      if (ctrlname=="name") continue;
      ctrl = sc.Controls[panelobj[ctrlname].type];
      if (ctrl && ctrl.GetValue) attribs[panelobj[ctrlname].setting] = ctrl.GetValue(panelobj, ctrlname);
      }

   return attribs;

   }

//
// SocialCalc.SettingsControls.PopupChangeCallback
//

SocialCalc.SettingsControls.PopupChangeCallback = function(attribs, id, value) {

   var sc = SocialCalc.Constants;

   var ele = document.getElementById("sample-text");

   if (!ele || !attribs || !attribs.panelobj) return;

   var idPrefix = SocialCalc.CurrentSpreadsheetControlObject.idPrefix;

   var c = attribs.panelobj.name == "cell" ? "c" : "";

   var v, a, parts, str1, str2, i;

   parts = sc.defaultCellLayout.match(/^padding.(\S+) (\S+) (\S+) (\S+).vertical.align.(\S+);$/) || [];

   var cv = {color: ["textcolor"], backgroundColor: ["bgcolor", "#FFF"],
             fontSize: ["fontsize", sc.defaultCellFontSize], fontFamily: ["fontfamily"],
             paddingTop: ["padtop", parts[1]], paddingRight: ["padright", parts[2]],
             paddingBottom: ["padbottom", parts[3]], paddingLeft: ["padleft", parts[4]],
             verticalAlign: ["alignvert", parts[5]]};

   for (a in cv) {
      v = SocialCalc.Popup.GetValue(idPrefix+c+cv[a][0]) || cv[a][1] || "";
      ele.style[a] = v;
      }

   if (c=="c") {
      cv = {borderTop: "cbt", borderRight: "cbr", borderBottom: "cbb", borderLeft: "cbl"};
      for (a in cv) {
         v = SocialCalc.SettingsControls.BorderSideGetValue(attribs.panelobj, cv[a]);
         ele.style[a] = v ? (v.val || "") : "";
         }
      v = SocialCalc.Popup.GetValue(idPrefix+"calignhoriz");
      ele.style.textAlign = v || "left";
      ele.childNodes[1].style.textAlign = v || "right";
      }
   else {
      ele.style.border = "";
      v = SocialCalc.Popup.GetValue(idPrefix+"textalignhoriz");
      ele.style.textAlign = v || "left";
      v = SocialCalc.Popup.GetValue(idPrefix+"numberalignhoriz");
      ele.childNodes[1].style.textAlign = v || "right";
      }

   v = SocialCalc.Popup.GetValue(idPrefix+c+"fontlook");
   parts = v ? (v.match(/^(\S+) (\S+)$/) || []) : [];
   ele.style.fontStyle = parts[1] || "";
   ele.style.fontWeight = parts[2] || "";

   v = SocialCalc.Popup.GetValue(idPrefix+c+"formatnumber") || "General";
   str1 = SocialCalc.FormatNumber.formatNumberWithFormat(9.8765, v, "");
   str2 = SocialCalc.FormatNumber.formatNumberWithFormat(-1234.5, v, "");
   if (str2 != "??-???-??&nbsp;??:??:??") { // not bad date from negative number
      str1 += "<br>"+str2;
      }

   ele.childNodes[1].innerHTML = str1;

   }

//
// PopupList Control
//

SocialCalc.SettingsControls.PopupListSetValue = function(panelobj, ctrlname, value) {

   if (!value) {alert(ctrlname+" no value"); return;}

   var sp = SocialCalc.Popup;

   if (!value.def) {
      sp.SetValue(panelobj[ctrlname].id, value.val);
      }
   else {
      sp.SetValue(panelobj[ctrlname].id, "");
      }

   }

//
// SocialCalc.SettingsControls.PopupListGetValue
//

SocialCalc.SettingsControls.PopupListGetValue = function(panelobj, ctrlname) {

   var ctl = panelobj[ctrlname];
   if (!ctl) return null;

   var value = SocialCalc.Popup.GetValue(ctl.id);
   if (value) {
      return {def: false, val: value};
      }
   else {
      return {def: true, val: 0};
      }

   }

//
// SocialCalc.SettingsControls.PopupListInitialize
//

SocialCalc.SettingsControls.PopupListInitialize = function(panelobj, ctrlname) {

   var i, val, pos, otext;
   var sc = SocialCalc.SettingsControls;
   var initialdata = panelobj[ctrlname].initialdata || sc.Controls[panelobj[ctrlname].type].InitialData || "";
   initialdata = SocialCalc.LocalizeSubstrings(initialdata);
   var optionvals = initialdata.split(/\|/);

   var options = [];

   for (i=0; i<(optionvals.length||0); i++) {
      val = optionvals[i];
      pos = val.indexOf(":");
      otext = val.substring(0, pos);
      if (otext.indexOf("\\")!=-1) { // escape any colons
         otext = otext.replace(/\\c/g,":");
         otext = otext.replace(/\\b/g,"\\");

         }
      otext = SocialCalc.special_chars(otext);
      if (otext == "[custom]") {
         options[i] = {o: SocialCalc.Constants.s_PopupListCustom, v: val.substring(pos+1), a:{custom: true}};
         }
      else if (otext == "[cancel]") {
         options[i] = {o: SocialCalc.Constants.s_PopupListCancel, v: "", a:{cancel: true}};
         }
      else if (otext == "[break]") {
         options[i] = {o: "-----", v: "", a:{skip: true}};
         }
      else if (otext == "[newcol]") {
         options[i] = {o: "", v: "", a:{newcol: true}};
         }
      else {
         options[i] = {o: otext, v: val.substring(pos+1)};
         }
      }

   SocialCalc.Popup.Create("List", panelobj[ctrlname].id, {});
   SocialCalc.Popup.Initialize(panelobj[ctrlname].id,
      {options: options,
       attribs:{changedcallback: SocialCalc.SettingsControls.PopupChangeCallback, panelobj: panelobj}});

   }


//
// SocialCalc.SettingsControls.PopupListReset
//

SocialCalc.SettingsControls.PopupListReset = function(ctrlname) {

   SocialCalc.Popup.Reset("List");

   }

SocialCalc.SettingsControls.Controls.PopupList = {
   SetValue: SocialCalc.SettingsControls.PopupListSetValue,
   GetValue: SocialCalc.SettingsControls.PopupListGetValue,
   Initialize: SocialCalc.SettingsControls.PopupListInitialize,
   OnReset: SocialCalc.SettingsControls.PopupListReset,
   ChangedCallback: null
   }

//
// ColorChooser Control
//

SocialCalc.SettingsControls.ColorChooserSetValue = function(panelobj, ctrlname, value) {

   if (!value) {alert(ctrlname+" no value"); return;}

   var sp = SocialCalc.Popup;

   if (!value.def) {
      sp.SetValue(panelobj[ctrlname].id, value.val);
      }
   else {
      sp.SetValue(panelobj[ctrlname].id, "");
      }

   }

//
// SocialCalc.SettingsControls.ColorChooserGetValue
//

SocialCalc.SettingsControls.ColorChooserGetValue = function(panelobj, ctrlname) {

   var value = SocialCalc.Popup.GetValue(panelobj[ctrlname].id);
   if (value) {
      return {def: false, val: value};
      }
   else {
      return {def: true, val: 0};
      }

   }

//
// SocialCalc.SettingsControls.ColorChooserInitialize
//

SocialCalc.SettingsControls.ColorChooserInitialize = function(panelobj, ctrlname) {

   var i, val, pos, otext;
   var sc = SocialCalc.SettingsControls;

   SocialCalc.Popup.Create("ColorChooser", panelobj[ctrlname].id, {});
   SocialCalc.Popup.Initialize(panelobj[ctrlname].id,
      {attribs:{title: "&nbsp;", moveable: true, width: "106px",
                changedcallback: SocialCalc.SettingsControls.PopupChangeCallback, panelobj: panelobj}});

   }


//
// SocialCalc.SettingsControls.ColorChooserReset
//

SocialCalc.SettingsControls.ColorChooserReset = function(ctrlname) {

   SocialCalc.Popup.Reset("ColorChooser");

   }

SocialCalc.SettingsControls.Controls.ColorChooser = {
   SetValue: SocialCalc.SettingsControls.ColorChooserSetValue,
   GetValue: SocialCalc.SettingsControls.ColorChooserGetValue,
   Initialize: SocialCalc.SettingsControls.ColorChooserInitialize,
   OnReset: SocialCalc.SettingsControls.ColorChooserReset,
   ChangedCallback: null
   }


//
// SocialCalc.SettingsControls.BorderSideSetValue
//

SocialCalc.SettingsControls.BorderSideSetValue = function(panelobj, ctrlname, value) {

   var sc = SocialCalc.SettingsControls;
   var ele, found, idname, parts;
   var idstart = panelobj[ctrlname].id;

   if (!value) {alert(ctrlname+" no value"); return;}

   ele = document.getElementById(idstart+"-onoff-bcb"); // border checkbox
   if (!ele) return;

   if (value.val) { // border does not use default: it looks only to the value currently
      ele.checked = true;
      ele.value = value.val;
      parts = value.val.match(/(\S+)\s+(\S+)\s+(\S.+)/);
      idname = idstart+"-color";
      SocialCalc.Popup.SetValue(idname, parts[3]);
      SocialCalc.Popup.SetDisabled(idname, false);
      }
   else {
      ele.checked = false;
      ele.value = value.val;
      idname = idstart+"-color";
      SocialCalc.Popup.SetValue(idname, "");
      SocialCalc.Popup.SetDisabled(idname, true);
      }

   }

//
// SocialCalc.SettingsControls.BorderSideGetValue
//

SocialCalc.SettingsControls.BorderSideGetValue = function(panelobj, ctrlname) {

   var sc = SocialCalc.SettingsControls;
   var ele, value;
   var idstart = panelobj[ctrlname].id;

   ele = document.getElementById(idstart+"-onoff-bcb"); // border checkbox
   if (!ele) return;


   if (ele.checked) { // on
      value = SocialCalc.Popup.GetValue(idstart+"-color");
      value = "1px solid " + (value || "rgb(0,0,0)");
      return {def: false, val: value};
      }
   else { // off
      return {def: false, val: ""};
      }

   }

//
// SocialCalc.SettingsControls.BorderSideInitialize
//

SocialCalc.SettingsControls.BorderSideInitialize = function(panelobj, ctrlname) {

   var sc = SocialCalc.SettingsControls;
   var idstart = panelobj[ctrlname].id;

   SocialCalc.Popup.Create("ColorChooser", idstart+"-color", {});
   SocialCalc.Popup.Initialize(idstart+"-color",
      {attribs:{title: "&nbsp;", width: "106px", moveable: true,
                changedcallback: SocialCalc.SettingsControls.PopupChangeCallback, panelobj: panelobj}});

   }


//
// SocialCalc.SettingsControlOnchangeBorder = function(ele)
//

SocialCalc.SettingsControlOnchangeBorder = function(ele) {

   var idname, value, found, ele2;
   var sc = SocialCalc.SettingsControls;
   var panelobj = sc.CurrentPanel;

   var nameparts = ele.id.match(/(^.*\-)(\w+)\-(\w+)\-(\w+)$/);
   if (!nameparts) return;
   var prefix = nameparts[1];
   var ctrlname = nameparts[2];
   var ctrlsubid = nameparts[3]
   var ctrlidsuffix = nameparts[4];
   var ctrltype = panelobj[ctrlname].type;

   switch (ctrlidsuffix) {
      case "bcb": // border checkbox
         if (ele.checked) {
            sc.Controls[ctrltype].SetValue(sc.CurrentPanel, ctrlname, {def: false, val: ele.value || "1px solid rgb(0,0,0)"});
            }
         else {
            sc.Controls[ctrltype].SetValue(sc.CurrentPanel, ctrlname, {def: false, val: ""});
            }
         break;
      }

   }


SocialCalc.SettingsControls.Controls.BorderSide = {
   SetValue: SocialCalc.SettingsControls.BorderSideSetValue,
   GetValue: SocialCalc.SettingsControls.BorderSideGetValue,
   OnClick: SocialCalc.SettingsControls.ColorComboOnClick,
   Initialize: SocialCalc.SettingsControls.BorderSideInitialize,
   InitialData: {thickness: "1 pixel:1px", style: "Solid:solid"},
   ChangedCallback: null
   }


SocialCalc.SettingControlReset = function() {

   var sc = SocialCalc.SettingsControls;
   var ctrlname;

   for (ctrlname in sc.Controls) {
      if (sc.Controls[ctrlname].OnReset) sc.Controls[ctrlname].OnReset(ctrlname);
      }
   }
