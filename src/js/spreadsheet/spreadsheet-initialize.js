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
   if (node == null) alert("SocialCalc.InitializeSpreadsheetControl not given parent node.");
   spreadsheet.parentNode = node;
   $(node).empty();

   // Render HTML

   nunjucks = nunjucks.configure('../src/views', { autoescape: true });
   html = nunjucks.render('layout.html.njk', { idPrefix: spreadsheet.idPrefix, imagePrefix: spreadsheet.imagePrefix })

   html = html.replace(/\%s\./g, "SocialCalc.");
   html = html.replace(/\%id\./g, spreadsheet.idPrefix);
   html = html.replace(/\%tbt\./g, spreadsheet.toolbartext);
   html = html.replace(/\%img\./g, spreadsheet.imagePrefix);

   html = SCLocSS(html); // localize with %loc!string! and %scc!constant!

   node.innerHTML = html;

   spreadsheet.spreadsheetDiv = document.querySelector('.socialcalc-main-container');
   spreadsheet.$container = $(spreadsheet.spreadsheetDiv);
   spreadsheet.editor.$appContainer = spreadsheet.$container;
   console.log(spreadsheet.editor);

   spreadsheet.InitializeToolBar();

   // Initialize formula bar

   spreadsheet.formulabarDiv = spreadsheet.$container.find(".formula-bar");

   new SocialCalc.InputBox(spreadsheet.$container.find("#formula-input")[0], spreadsheet.editor);
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


   // TODO make this work again
   // form data sheet - all input formulas set values in this sheet as well as the loaded sheet
   // spreadsheet.formDataViewer = new SocialCalc.SpreadsheetViewer("te_FormData-"); // should end with -
   // spreadsheet.formDataViewer.InitializeSpreadsheetViewer("te_formData", 180, 0, 200);
   // spreadsheet.formDataViewer.editor.ignoreRender = true; // formDataViewer is used for ExecuteSheetCommand only - no need to render


   // create statusline

   spreadsheet.statuslineDiv = spreadsheet.$container.find("#"+spreadsheet.idPrefix+"statusline");

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

   spreadsheet.editor.CreateTableEditor()

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