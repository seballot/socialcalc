//
// InitializeSpreadsheetControl(spreadsheet, node, height, width, spacebelow)
//
// Creates the control elements and makes them the child of node (string or element).
// If present, height and width specify size.
// If either is 0 or null (missing), the maximum that fits on the screen
// (taking spacebelow into account) is used.
//
// Displays the tabs and creates the views (other than "sheet").
// The first tab is set as selected, but onclick is not invoked.
//
// You should do a redisplay or recalc (which redisplays) after running this.
//

SocialCalc.InitializeSpreadsheetControl = function(spreadsheet, node, height, width, spacebelow) {

   var scc = SocialCalc.Constants;
   var SCLoc = SocialCalc.LocalizeString;
   var SCLocSS = SocialCalc.LocalizeSubstrings;

   var html, child, i, vname, v, style, button, bele;
   var tabs = spreadsheet.tabs;
   var views = spreadsheet.views;

   spreadsheet.requestedHeight = height;
   spreadsheet.requestedWidth = width;
   spreadsheet.requestedSpaceBelow = spacebelow;

   if (typeof node == "string") node = document.getElementById(node);

   if (node == null) {
      alert("SocialCalc.SpreadsheetControl not given parent node.");
      }

   spreadsheet.parentNode = node;

   // create node to hold spreadsheet control

   spreadsheet.spreadsheetDiv = document.createElement("div");

   spreadsheet.SizeSSDiv(); // calculate and fill in the size values

   for (child=node.firstChild; child!=null; child=node.firstChild) {
      node.removeChild(child);
      }

   // create the tabbed UI at the top

   html = '<div>'
   html += '<div style="'+spreadsheet.tabbackground+'">'+
      '<table cellpadding="0" cellspacing="0"><tr>';

   for (i=0; i<tabs.length; i++) {
      html += '  <td id="%id.' + tabs[i].name + 'tab" style="' +
         (i==0 ? spreadsheet.tabselectedCSS : spreadsheet.tabplainCSS) +
         '" onclick="%s.SetTab(this);">' + SCLoc(tabs[i].text) + '</td>';
      }

   html += ' </tr></table></div>'
   html += '<div style="'+spreadsheet.toolbarbackground+'padding:12px 10px 10px 4px;">';

   for (i=0; i<tabs.length; i++) {
      html += tabs[i].html;
      }

   html += '</div>'
   html += '</div>';

   spreadsheet.currentTab = 0; // this is where we started

   for (style in spreadsheet.tabreplacements) {
      html = html.replace(spreadsheet.tabreplacements[style].regex, spreadsheet.tabreplacements[style].replacement);
      }
   html = html.replace(/\%s\./g, "SocialCalc.");
   html = html.replace(/\%id\./g, spreadsheet.idPrefix);
   html = html.replace(/\%tbt\./g, spreadsheet.toolbartext);
   html = html.replace(/\%img\./g, spreadsheet.imagePrefix);

   html = SCLocSS(html); // localize with %loc!string! and %scc!constant!

   spreadsheet.spreadsheetDiv.innerHTML = html;

   node.appendChild(spreadsheet.spreadsheetDiv);

   // Initialize SocialCalc buttons

   spreadsheet.Buttons = {
      button_undo: {tooltip: "Undo", command: "undo"},
      button_redo: {tooltip: "Redo", command: "redo"},
      button_copy: {tooltip: "Copy", command: "copy"},
      button_cut: {tooltip: "Cut", command: "cut"},
      button_paste: {tooltip: "Paste", command: "paste"},
      button_pasteformats: {tooltip: "Paste Formats", command: "pasteformats"},
      button_lock: {tooltip: "Lock Cell", command: "lock"},
      button_unlock: {tooltip: "Unlock Cell", command: "unlock"},
      button_delete: {tooltip: "Delete Cell Contents", command: "delete"},
      button_filldown: {tooltip: "Fill Down", command: "filldown"},
      button_fillright: {tooltip: "Fill Right", command: "fillright"},
      button_movefrom: {tooltip: "Set/Clear Move From", command: "movefrom"},
      button_movepaste: {tooltip: "Move Paste", command: "movepaste"},
      button_moveinsert: {tooltip: "Move Insert", command: "moveinsert"},
      button_alignleft: {tooltip: "Align Left", command: "align-left"},
      button_aligncenter: {tooltip: "Align Center", command: "align-center"},
      button_alignright: {tooltip: "Align Right", command: "align-right"},
      button_borderon: {tooltip: "Borders On", command: "borderon"},
      button_borderoff: {tooltip: "Borders Off", command: "borderoff"},
      button_swapcolors: {tooltip: "Swap Colors", command: "swapcolors"},
      button_merge: {tooltip: "Merge/Unmerge Cells", command: "merge"},
      button_insertrow: {tooltip: "Insert Row Before", command: "insertrow"},
      button_insertcol: {tooltip: "Insert Column Before", command: "insertcol"},
      button_deleterow: {tooltip: "Delete Row", command: "deleterow"},
      button_deletecol: {tooltip: "Delete Column", command: "deletecol"},
      button_hiderow: {tooltip: "Hide Row", command: "hiderow"},
      button_hidecol: {tooltip: "Hide Column", command: "hidecol"},
      button_recalc: {tooltip: "Recalculate", command: "recalc"}
   }

   for (button in spreadsheet.Buttons) {
      bele = document.getElementById(spreadsheet.idPrefix+button);
      if (!bele) {alert("Button "+(spreadsheet.idPrefix+button)+" missing"); continue;}
      bele.style.border = "1px solid "+scc.ISCButtonBorderNormal;
      bele.title = SCLoc(spreadsheet.Buttons[button].tooltip);
      SocialCalc.ButtonRegister(spreadsheet.editor, bele,
         {normalstyle: "border:1px solid "+scc.ISCButtonBorderNormal+";background-color:"+scc.ISCButtonNormalBackground+";",
          hoverstyle: "border:1px solid "+scc.ISCButtonBorderHover+";background-color:"+scc.ISCButtonHoverBackground+";",
          downstyle: "border:1px solid "+scc.ISCButtonBorderDown+";background-color:"+scc.ISCButtonDownBackground+";"}, 
         {MouseDown: SocialCalc.DoButtonCmd, command: spreadsheet.Buttons[button].command});
   }

   // create formula bar

   spreadsheet.formulabarDiv = document.createElement("div");
   //spreadsheet.formulabarDiv.style.height = spreadsheet.formulabarheight + "px"; // Allow line wrapping
   spreadsheet.formulabarDiv.innerHTML = '<input type="text" size="60" value="">&nbsp;'; //'<textarea rows="4" cols="60" style="z-index:5;background-color:white;position:relative;"></textarea>&nbsp;';
   spreadsheet.spreadsheetDiv.appendChild(spreadsheet.formulabarDiv);
   var inputbox = new SocialCalc.InputBox(spreadsheet.formulabarDiv.firstChild, spreadsheet.editor);
   
   for (button in spreadsheet.formulabuttons) {
      bele = document.createElement("img");
      bele.id = spreadsheet.idPrefix+button;
      bele.src = (spreadsheet.formulabuttons[button].skipImagePrefix ? "" : spreadsheet.imagePrefix)+spreadsheet.formulabuttons[button].image;
      bele.style.verticalAlign = "middle";
      bele.style.border = "1px solid #FFF";
      bele.style.marginLeft = "4px";
      bele.title = SCLoc(spreadsheet.formulabuttons[button].tooltip);
      SocialCalc.ButtonRegister(spreadsheet.editor, bele,
         {normalstyle: "border:1px solid #FFF;backgroundColor:#FFF;",
          hoverstyle: "border:1px solid #CCC;backgroundColor:#FFF;",
          downstyle: "border:1px solid #000;backgroundColor:#FFF;"}, 
         {MouseDown: spreadsheet.formulabuttons[button].command, Disabled: function() {return spreadsheet.editor.ECellReadonly();}});
      spreadsheet.formulabarDiv.appendChild(bele);
   }

   var input = $("<input id='searchbarinput' value='' placeholder='Search sheet…'>");
   var searchBar = $("<span id='searchbar'></span>");
   searchBar.append("<div id='searchstatus'></div>");
   searchBar.append(input);

   // find buttons (right of formula bar)
   for (button in spreadsheet.findbuttons) {
      bele = document.createElement("img");
      bele.id = spreadsheet.idPrefix+button;
      bele.src = (spreadsheet.imagePrefix)+spreadsheet.findbuttons[button].image;
      bele.style.verticalAlign = "middle";
      bele.style.border = "1px solid #FFF";
      bele.title = SCLoc(spreadsheet.findbuttons[button].tooltip);
      SocialCalc.ButtonRegister(spreadsheet.editor, bele,
         {normalstyle: "border:1px solid #FFF;backgroundColor:#FFF;",
          hoverstyle: "border:1px solid #CCC;backgroundColor:#FFF;",
          downstyle: "border:1px solid #000;backgroundColor:#FFF;"}, 
         {MouseDown: spreadsheet.findbuttons[button].command, Disabled: function() {return false;}});
      searchBar[0].appendChild(bele);
   } 
   input.on('input', SocialCalc.SpreadsheetControl.FindInSheet);
   input.on('focus', function() {
        SocialCalc.Keyboard.passThru = true;
   });
   input.on('blur', function() {
        SocialCalc.Keyboard.passThru = false;
   });
   input.keyup(function (e) {
        if (e.keyCode == 13) {
           // search down when enter is pressed
           if (e.shiftKey) {
               SocialCalc.SpreadsheetControlSearchUp();
           } else {
               SocialCalc.SpreadsheetControlSearchDown();
           }
        }
   });
   spreadsheet.formulabarDiv.appendChild(searchBar[0]);
   
   // initialize tabs that need it

   for (i=0; i<tabs.length; i++) { // execute any tab-specific initialization code
      if (tabs[i].oncreate) {
         tabs[i].oncreate(spreadsheet, tabs[i].name);
         }
      }

   // create sheet view and others

   SocialCalc.CalculateSheetNonViewHeight(spreadsheet);

   spreadsheet.viewheight = spreadsheet.height-spreadsheet.nonviewheight;
   spreadsheet.editorDiv=spreadsheet.editor.CreateTableEditor(spreadsheet.width, spreadsheet.viewheight);

   var appViewDiv = document.createElement("div");
   appViewDiv.id = "te_appView";
   
   appViewDiv.appendChild(spreadsheet.editorDiv)
   spreadsheet.editorDiv = appViewDiv;

   var formDataDiv = document.createElement("div");
   formDataDiv.id = "te_formData";
   formDataDiv.style.display = "none";
   
   spreadsheet.editorDiv.appendChild(formDataDiv);      
   spreadsheet.spreadsheetDiv.appendChild(spreadsheet.editorDiv);

   // form data sheet - all input formulas set values in this sheet as well as the loaded sheet
   spreadsheet.formDataViewer = new SocialCalc.SpreadsheetViewer("te_FormData-"); // should end with -
   spreadsheet.formDataViewer.InitializeSpreadsheetViewer(formDataDiv.id, 180, 0, 200);
   spreadsheet.formDataViewer.editor.ignoreRender = true; // formDataViewer is used for ExecuteSheetCommand only - no need to render
   
   for (vname in views) {
      html = views[vname].html;
      for (style in views[vname].replacements) {
         html = html.replace(views[vname].replacements[style].regex, views[vname].replacements[style].replacement);
         }
      html = html.replace(/\%s\./g, "SocialCalc.");
      html = html.replace(/\%id\./g, spreadsheet.idPrefix);
      html = html.replace(/\%tbt\./g, spreadsheet.toolbartext);
      html = html.replace(/\%img\./g, spreadsheet.imagePrefix);
      v = document.createElement("div");
      SocialCalc.setStyles(v, views[vname].divStyle);
      v.style.display = "none";
      v.style.width = spreadsheet.width + "px";
      v.style.height = spreadsheet.viewheight + "px";
      v.id = spreadsheet.idPrefix + views[vname].name + "view";

      html = SCLocSS(html); // localize with %loc!string!, etc.

      v.innerHTML = html;
      spreadsheet.spreadsheetDiv.appendChild(v);
      views[vname].element = v;
      if (views[vname].oncreate) {
         views[vname].oncreate(spreadsheet, views[vname]);
         }
      }

   views.sheet = {name: "sheet", element: spreadsheet.editorDiv};

   // create statusline

   spreadsheet.statuslineDiv = document.createElement("div");
   spreadsheet.statuslineDiv.style.cssText = spreadsheet.statuslineCSS;
   spreadsheet.statuslineDiv.style.height = spreadsheet.statuslineheight -
      (spreadsheet.statuslineDiv.style.paddingTop.slice(0,-2)-0) -
      (spreadsheet.statuslineDiv.style.paddingBottom.slice(0,-2)-0) + "px";
   spreadsheet.statuslineDiv.id = spreadsheet.idPrefix+"statusline";
   spreadsheet.spreadsheetDiv.appendChild(spreadsheet.statuslineDiv);

   // set current control object based on mouseover

   if (spreadsheet.spreadsheetDiv.addEventListener) { // DOM Level 2 -- Firefox, et al
      spreadsheet.spreadsheetDiv.addEventListener("mousedown", function() { SocialCalc.SetSpreadsheetControlObject(spreadsheet); }, false);
      spreadsheet.spreadsheetDiv.addEventListener("mouseover", function() { SocialCalc.SetSpreadsheetControlObject(spreadsheet); }, false);
      }
   else if (spreadsheet.spreadsheetDiv.attachEvent) { // IE 5+
      spreadsheet.spreadsheetDiv.attachEvent("onmousedown", function() { SocialCalc.SetSpreadsheetControlObject(spreadsheet); });
      spreadsheet.spreadsheetDiv.attachEvent("onmouseover", function() { SocialCalc.SetSpreadsheetControlObject(spreadsheet); });
      }
   else { // don't handle this
      throw SocialCalc.Constants.s_BrowserNotSupported;
      }

   // done - refresh screen needed

   return;
}

SocialCalc.CalculateSheetNonViewHeight = function(spreadsheet) {
  spreadsheet.nonviewheight = spreadsheet.statuslineheight;
  for(var nodeIndex = 0;  nodeIndex < spreadsheet.spreadsheetDiv.childNodes.length;  nodeIndex++ ) {
    if(spreadsheet.spreadsheetDiv.childNodes[nodeIndex].id == "SocialCalc-statusline") continue;
    spreadsheet.nonviewheight += spreadsheet.spreadsheetDiv.childNodes[nodeIndex].offsetHeight;
  }  
}