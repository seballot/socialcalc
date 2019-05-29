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

   this.nunjucks = nunjucks.configure('../src/views', { autoescape: true });

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
   spreadsheet.spreadsheetDiv.className = "socialcalc-main-container"

   node.appendChild(spreadsheet.spreadsheetDiv);

   // Initialize SocialCalc buttons

   // action btn
   $('#' + spreadsheet.idPrefix + 'edittools .action-btn').click(function() {
      SocialCalc.DoCmd(this, $(this).data('command'));
   });

   // buttons for styling
   $('#' + spreadsheet.idPrefix + 'edittools .style-btn').click(function() {
      SocialCalc.HandleStyleButtonClicked(this);
   });

   var palette = [
     ["#000000","#444444","#5b5b5b","#999999","#bcbcbc","#eeeeee","#f3f6f4","#ffffff"],
     ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
     ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
     ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
     ["#cc0000","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
     ["#990000","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
     ["#660000","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]

   ];

   $('#' + spreadsheet.idPrefix + 'edittools input[type=color]').spectrum({
      showPalette: true,
      showAlpha: true,
      showInitial: true,
      preferredFormat: "hex",
      showInput: false,
      hideAfterPaletteSelect:true,
      showPaletteOnly: true,
      palette: palette
   });

   $('#' + spreadsheet.idPrefix + 'edittools .style-input').change(function() {
      SocialCalc.HandleStyleButtonClicked(this);
   });

   // create formula bar
   spreadsheet.formulabarDiv = document.createElement("div");
   spreadsheet.formulabarDiv.innerHTML = this.nunjucks.render('formula-bar.html.njk');
   spreadsheet.spreadsheetDiv.appendChild(spreadsheet.formulabarDiv);

   new SocialCalc.InputBox(document.getElementById("SC-formula-input"), spreadsheet.editor);
   // input.on('input', SocialCalc.SpreadsheetControl.FindInSheet);
   // input.on('focus', function() {
   //      SocialCalc.Keyboard.passThru = true;
   // });
   // input.on('blur', function() {
   //      SocialCalc.Keyboard.passThru = false;
   // });
   // input.keyup(function (e) {
   //      if (e.keyCode == 13) {
   //         // search down when enter is pressed
   //         if (e.shiftKey) {
   //             SocialCalc.SpreadsheetControlSearchUp();
   //         } else {
   //             SocialCalc.SpreadsheetControlSearchDown();
   //         }
   //      }
   // });

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
   spreadsheet.statuslineDiv.id = spreadsheet.idPrefix+"statusline";
   spreadsheet.editorDiv.appendChild(spreadsheet.statuslineDiv);

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
   spreadsheet.editor.EditorScheduleSheetCommands('recalc', true, false);

   return;
}

SocialCalc.CalculateSheetNonViewHeight = function(spreadsheet) {
  spreadsheet.nonviewheight = 0;
  for(var nodeIndex = 0;  nodeIndex < spreadsheet.spreadsheetDiv.childNodes.length;  nodeIndex++ ) {
    spreadsheet.nonviewheight += spreadsheet.spreadsheetDiv.childNodes[nodeIndex].offsetHeight;
  }
}