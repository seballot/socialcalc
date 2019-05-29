// *************************************
//
// SpreadsheetControl class:
//
// *************************************

// Global constants:

SocialCalc.CurrentSpreadsheetControlObject = null; // right now there can only be one active at a time

// Constructor:

SocialCalc.SpreadsheetControl = function(idPrefix) {

   var scc = SocialCalc.Constants;

   // Properties:

   this.parentNode = null;
   this.spreadsheetDiv = null;
   this.requestedHeight = 0;
   this.requestedWidth = 0;
   this.requestedSpaceBelow = 0;
   this.height = 0;
   this.width = 0;
   this.viewheight = 0; // calculated amount for views below toolbar, etc.

   // Tab definitions: An array where each tab is an object of the form:
   //
   //    name: "name",
   //    text: "text-on-tab",
   //    html: "html-to-create div",
   //       replacements:
   //         "%s.": "SocialCalc", "%id.": spreadsheet.idPrefix, "%tbt.": spreadsheet.toolbartext
   //         Other replacements from spreadsheet.tabreplacements:
   //            replacementname: {regex: regular-expression-to-match-with-g, replacement: string}
   //    view: "viewname", // view to show when selected; "sheet" or missing/null is spreadsheet
   //    oncreate: function(spreadsheet, tab-name), // called when first created to initialize
   //    onclick: function(spreadsheet, tab-name), missing/null is sheet default
   //    onclickFocus: text, // spreadsheet.idPrefix+text is given the focus if present instead of normal KeyboardFocus
   //       or if text isn't a string, that value (e.g., true) is used for SocialCalc.CmdGotFocus
   //    onunclick: function(spreadsheet, tab-name), missing/null is sheet default

   this.tabs = [];
   this.tabnums = {}; // when adding tabs, add tab-name: array-index to this object
   this.tabreplacements = {}; // see use above
   this.currentTab = -1; // currently selected tab index in this.tabs or -1 (maintained by SocialCalc.SetTab)

   // View definitions: An object where each view is an object of the form:
   //
   //    name: "name", // localized when first set using SocialCalc.LocalizeString
   //    element: node-in-the-dom, // filled in when initialized
   //    replacements: {}, // see below
   //    html: "html-to-create div",
   //       replacements:
   //         "%s.": "SocialCalc", "%id.": spreadsheet.idPrefix, "%tbt.": spreadsheet.toolbartext, "%img.": spreadsheet.imagePrefix,
   //         SocialCalc.LocalizeSubstring replacements ("%loc!string!" and "%ssc!constant-name!")
   //         Other replacements from viewobject.replacements:
   //            replacementname: {regex: regular-expression-to-match-with-g, replacement: string}
   //    divStyle: attributes for sheet div (SocialCalc.setStyles format)
   //    oncreate: function(spreadsheet, viewobject), // called when first created to initialize
   //    needsresize: true/false/null, // if true, do resize calc after displaying
   //    onresize: function(spreadsheet, viewobject), // called if needs resize
   //    values: {} // optional values to share with onclick handlers, etc.
   //
   // There is always a "sheet" view.

   this.views = {}; // {viewname: view-object, ...}

   // Generate html string from template : this.nunjucks.render('test.html.njk', { text: "hello" });
   this.nunjucks = nunjucks.configure('../src/views', { autoescape: true });

   // Dynamic properties:

   this.sheet = null;
   this.context = null;
   this.editor = null;

   this.spreadsheetDiv = null;
   this.editorDiv = null;

   this.sortrange = ""; // remembered range for sort tab

   this.moverange = ""; // remembered range from movefrom used by movepaste/moveinsert

   // Constants:

   this.idPrefix = idPrefix || "SocialCalc-"; // prefix added to element ids used here, should end in "-"
   this.multipartBoundary = "SocialCalcSpreadsheetControlSave"; // boundary used by SpreadsheetControlCreateSpreadsheetSave
   this.imagePrefix = scc.defaultImagePrefix; // prefix added to img src

   this.toolbarbackground = scc.SCToolbarbackground;
   this.tabbackground = scc.SCTabbackground; // "background-color:#CCC;";
   this.tabselectedCSS = scc.SCTabselectedCSS;
   this.tabplainCSS = scc.SCTabplainCSS;

   this.formulabarheight = scc.SCFormulabarheight; // in pixels, will contain a text input box

   this.statuslineheight = scc.SCStatuslineheight; // in pixels
   this.statuslineCSS = scc.SCStatuslineCSS;

   // Callbacks:

   this.ExportCallback = null; // a function called for Clipboard Export button: this.ExportCallback(spreadsheet_control_object)

   // Initialization Code:
   if(typeof SocialCalc.debug_log === 'undefined') SocialCalc.debug_log = [];

   this.sheet = new SocialCalc.Sheet();
   this.context = new SocialCalc.RenderContext(this.sheet);
   this.context.showGrid=true;
   this.context.showRCHeaders=true;
   this.editor = new SocialCalc.TableEditor(this.context);
   this.editor.StatusCallback.statusline =
      {func: SocialCalc.SpreadsheetControlStatuslineCallback,
       params: {statuslineid: this.idPrefix+"statusline", button_recalc: this.idPrefix+"button_recalc"}};

   SocialCalc.CurrentSpreadsheetControlObject = this; // remember this for rendezvousing on events

   this.editor.MoveECellCallback.movefrom = function(editor) {
      var cr;
      var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
      spreadsheet.context.cursorsuffix = "";
      if (editor.range2.hasrange && !editor.cellhandles.noCursorSuffix) {
         if (editor.ecell.row==editor.range2.top && (editor.ecell.col<editor.range2.left || editor.ecell.col>editor.range2.right+1)) {
            spreadsheet.context.cursorsuffix = "insertleft";
            }
         if (editor.ecell.col==editor.range2.left && (editor.ecell.row<editor.range2.top || editor.ecell.row>editor.range2.bottom+1)) {
            spreadsheet.context.cursorsuffix = "insertup";
            }
         }
      };

   // formula bar buttons

   this.formulabuttons = {
      formulafunctions: {image: "insertformula.png", tooltip: "Functions", // tooltips are localized when set below
                         command: SocialCalc.SpreadsheetControlDoFunctionList},
      multilineinput: {image: "listbox.png", tooltip: "Multi-line Input Box",
                         command: SocialCalc.SpreadsheetControlDoMultiline},
      link: {image: "inserthyperlink.png", tooltip: "Link Input Box",
                         command: SocialCalc.SpreadsheetControlDoLink},
      sum: {image: "autosum.png", tooltip: "Auto Sum",
                         command: SocialCalc.SpreadsheetControlDoSum}
      }

   // find buttons
   this.findbuttons = {
       last: {image: 'upsearch.png', tooltip: 'Find Previous',
              command: SocialCalc.SpreadsheetControlSearchUp},
       next: {image: 'downsearch.png', tooltip: 'Find Next',
              command: SocialCalc.SpreadsheetControlSearchDown}
   }

   // Default tabs:

   // Edit

   this.tabnums.edit = this.tabs.length;
   this.tabs.push({name: "edit", text: "Edit",
      html: this.nunjucks.render('tool-bar.html.njk', { idPrefix: this.idPrefix, imagePrefix: this.imagePrefix }),
      oncreate: null, onclick: null
   });

   // Settings (Format)

   this.tabnums.settings = this.tabs.length;
   this.tabs.push({name: "settings", text: "Format",
      html: this.nunjucks.render('tabs/settings.html.njk', { idPrefix: this.idPrefix }),
      view: "settings",
      onclickFocus: true,
      onclick: function(s, t) {
         SocialCalc.SettingsControls.idPrefix = s.idPrefix; // used to get color chooser div
         SocialCalc.SettingControlReset();
         var sheetattribs = s.sheet.EncodeSheetAttributes();
         var cellattribs = s.sheet.EncodeCellAttributes(s.editor.ecell.coord);
         SocialCalc.SettingsControlLoadPanel(s.views.settings.values.sheetspanel, sheetattribs);
         SocialCalc.SettingsControlLoadPanel(s.views.settings.values.cellspanel, cellattribs);
         document.getElementById(s.idPrefix+"settingsecell").innerHTML = s.editor.ecell.coord;
         SocialCalc.SpreadsheetControlSettingsSwitch("cell");
         s.views.settings.element.style.height = s.viewheight+"px";
         s.views.settings.element.firstChild.style.height = s.viewheight+"px";

         var range;  // set save message
         if (s.editor.range.hasrange) {
            range = SocialCalc.crToCoord(s.editor.range.left, s.editor.range.top) + ":" +
               SocialCalc.crToCoord(s.editor.range.right, s.editor.range.bottom);
            }
         else
            range = s.editor.ecell.coord;

         document.getElementById(s.idPrefix+"settings-savecell").value = SocialCalc.LocalizeString("Save to")+": "+range;
      }
   });

   this.views["settings"] = {name: "settings", values: {},
      html: this.nunjucks.render('views/settings.html.njk', { idPrefix: this.idPrefix }),
      oncreate: function(s, viewobj) {
         var scc = SocialCalc.Constants;

         viewobj.values.sheetspanel = {
            colorchooser: {id: s.idPrefix+"scolorchooser"},
            formatnumber: {setting: "numberformat", type: "PopupList", id: s.idPrefix+"formatnumber",
               initialdata: scc.SCFormatNumberFormats},
            formattext: {setting: "textformat", type: "PopupList", id: s.idPrefix+"formattext",
               initialdata: scc.SCFormatTextFormats},
            fontfamily: {setting: "fontfamily", type: "PopupList", id: s.idPrefix+"fontfamily",
               initialdata: scc.SCFormatFontfamilies},
            fontlook: {setting: "fontlook", type: "PopupList", id: s.idPrefix+"fontlook",
               initialdata: scc.SCFormatFontlook},
            fontsize: {setting: "fontsize", type: "PopupList", id: s.idPrefix+"fontsize",
               initialdata: scc.SCFormatFontsizes},
            textalignhoriz: {setting: "textalignhoriz", type: "PopupList", id: s.idPrefix+"textalignhoriz",
               initialdata: scc.SCFormatTextAlignhoriz},
            numberalignhoriz: {setting: "numberalignhoriz", type: "PopupList", id: s.idPrefix+"numberalignhoriz",
               initialdata: scc.SCFormatNumberAlignhoriz},
            alignvert: {setting: "alignvert", type: "PopupList", id: s.idPrefix+"alignvert",
               initialdata: scc.SCFormatAlignVertical},
            textcolor: {setting: "textcolor", type: "ColorChooser", id: s.idPrefix+"textcolor"},
            bgcolor: {setting: "bgcolor", type: "ColorChooser", id: s.idPrefix+"bgcolor"},
            padtop: {setting: "padtop", type: "PopupList", id: s.idPrefix+"padtop",
               initialdata: scc.SCFormatPadsizes},
            padright: {setting: "padright", type: "PopupList", id: s.idPrefix+"padright",
               initialdata: scc.SCFormatPadsizes},
            padbottom: {setting: "padbottom", type: "PopupList", id: s.idPrefix+"padbottom",
               initialdata: scc.SCFormatPadsizes},
            padleft: {setting: "padleft", type: "PopupList", id: s.idPrefix+"padleft",
               initialdata: scc.SCFormatPadsizes},
            colwidth: {setting: "colwidth", type: "PopupList", id: s.idPrefix+"colwidth",
               initialdata: scc.SCFormatColwidth},
            recalc: {setting: "recalc", type: "PopupList", id: s.idPrefix+"recalc",
               initialdata: scc.SCFormatRecalc},
            usermaxcol: {setting: "usermaxcol", type: "PopupList", id: s.idPrefix+"usermaxcol",
               initialdata: scc.SCFormatUserMaxCol},
            usermaxrow: {setting: "usermaxrow", type: "PopupList", id: s.idPrefix+"usermaxrow",
               initialdata: scc.SCFormatUserMaxRow}

         };
         viewobj.values.cellspanel = {
            name: "cell",
            colorchooser: {id: s.idPrefix+"scolorchooser"},
            cformatnumber: {setting: "numberformat", type: "PopupList", id: s.idPrefix+"cformatnumber",
               initialdata: scc.SCFormatNumberFormats},
            cformattext: {setting: "textformat", type: "PopupList", id: s.idPrefix+"cformattext",
               initialdata: scc.SCFormatTextFormats},
            cfontfamily: {setting: "fontfamily", type: "PopupList", id: s.idPrefix+"cfontfamily",
               initialdata: scc.SCFormatFontfamilies},
            cfontlook: {setting: "fontlook", type: "PopupList", id: s.idPrefix+"cfontlook",
               initialdata: scc.SCFormatFontlook},
            cfontsize: {setting: "fontsize", type: "PopupList", id: s.idPrefix+"cfontsize",
               initialdata: scc.SCFormatFontsizes},
            calignhoriz: {setting: "alignhoriz", type: "PopupList", id: s.idPrefix+"calignhoriz",
               initialdata: scc.SCFormatTextAlignhoriz},
            calignvert: {setting: "alignvert", type: "PopupList", id: s.idPrefix+"calignvert",
               initialdata: scc.SCFormatAlignVertical},
            ctextcolor: {setting: "textcolor", type: "ColorChooser", id: s.idPrefix+"ctextcolor"},
            cbgcolor: {setting: "bgcolor", type: "ColorChooser", id: s.idPrefix+"cbgcolor"},
            cbt: {setting: "bt", type: "BorderSide", id: s.idPrefix+"cbt"},
            cbr: {setting: "br", type: "BorderSide", id: s.idPrefix+"cbr"},
            cbb: {setting: "bb", type: "BorderSide", id: s.idPrefix+"cbb"},
            cbl: {setting: "bl", type: "BorderSide", id: s.idPrefix+"cbl"},
            cpadtop: {setting: "padtop", type: "PopupList", id: s.idPrefix+"cpadtop",
               initialdata: scc.SCFormatPadsizes},
            cpadright: {setting: "padright", type: "PopupList", id: s.idPrefix+"cpadright",
               initialdata: scc.SCFormatPadsizes},
            cpadbottom: {setting: "padbottom", type: "PopupList", id: s.idPrefix+"cpadbottom",
               initialdata: scc.SCFormatPadsizes},
            cpadleft: {setting: "padleft", type: "PopupList", id: s.idPrefix+"cpadleft",
               initialdata: scc.SCFormatPadsizes}
            };

         SocialCalc.SettingsControlInitializePanel(viewobj.values.sheetspanel);
         SocialCalc.SettingsControlInitializePanel(viewobj.values.cellspanel);
      }
   };

   // Sort

   this.tabnums.sort = this.tabs.length;
   this.tabs.push({name: "sort", text: "Sort",
      html: this.nunjucks.render('tabs/sort.html.njk', { idPrefix: this.idPrefix }),
      onclick: SocialCalc.SpreadsheetControlSortOnclick});
   this.editor.SettingsCallbacks.sort = {save: SocialCalc.SpreadsheetControlSortSave, load: SocialCalc.SpreadsheetControlSortLoad};

   // Audit

   this.tabnums.audit = this.tabs.length;
   this.tabs.push({name: "audit", text: "Audit", html:
      '<div id="%id.audittools" style="display:none;">'+
      ' <div style="%tbt.">&nbsp;</div>'+
      '</div>',
      view: "audit",
      onclickFocus: true,
      onclick: function(s, t) {
         var SCLoc = SocialCalc.LocalizeString;
         var i, j;
         var str = '<table cellspacing="0" cellpadding="0" style="margin-bottom:10px;"><tr><td style="font-size:small;padding:6px;"><b>'+SCLoc("Audit Trail This Session")+':</b><br><br>';
         var stack = s.sheet.changes.stack;
         var tos = s.sheet.changes.tos;
         for (i=0; i<stack.length; i++) {
            if (i==tos+1) str += '<br></td></tr><tr><td style="font-size:small;background-color:#EEE;padding:6px;">'+SCLoc("UNDONE STEPS")+':<br>';
            for (j=0; j<stack[i].command.length; j++) {
               str += SocialCalc.special_chars(stack[i].command[j]) + "<br>";
            }
         }
      var ObjToSource = function(o){
        if (typeof(o) == "string") return o;
        if (!o) return 'null';
        if (typeof(o) == "object") {
          if (!ObjToSource.check) ObjToSource.check = new Array();
          for (var i=0, k=ObjToSource.check.length ; i<k ; ++i) {
            if (ObjToSource.check[i] == o) {return '{}';}
          }
          ObjToSource.check.push(o);
        }
        var k="",na=typeof(o.length)=="undefined"?1:0,str="";
        for(var p in o){
          if (na) k = "'"+p+ "':";
          if (typeof o[p] == "string") str += k + "'" + o[p]+"',";
          else if (typeof o[p] == "object") str += k + ObjToSource(o[p])+",";
          else str += k + o[p] + ",";
        }
        if (typeof(o) == "object") ObjToSource.check.pop();
        if (na) return "{"+str.slice(0,-1)+"}";
        else return "["+str.slice(0,-1)+"]";
      }

       if(typeof SocialCalc.debug_log != 'undefined') {
        for(var index in SocialCalc.debug_log) {
          str += ObjToSource(SocialCalc.debug_log[index]) + "<br>";
        }
      }

         s.views.audit.element.innerHTML = str+"</td></tr></table>";
         SocialCalc.CmdGotFocus(true);
      },
   });

   this.views["audit"] = {name: "audit", html: 'Audit Trail' };

   // Comment

   this.tabnums.comment = this.tabs.length;
   this.tabs.push({name: "comment", text: "Comment", html:
      '<div id="%id.commenttools" style="display:none;">'+
      '<table cellspacing="0" cellpadding="0"><tr><td>'+
      '<textarea id="%id.commenttext" style="font-size:small;height:32px;width:600px;overflow:auto;" onfocus="%s.CmdGotFocus(this);"></textarea>'+
      '</td><td style="vertical-align:top;">'+
      '&nbsp;<input type="button" value="%loc!Save!" onclick="%s.SpreadsheetControlCommentSet();" style="font-size:x-small;">'+
      '</td></tr></table>'+
      '</div>',
      view: "sheet",
      onclick: SocialCalc.SpreadsheetControlCommentOnclick,
      onunclick: SocialCalc.SpreadsheetControlCommentOnunclick
      });

   // Names

   this.tabnums.names = this.tabs.length;
   this.tabs.push({name: "names", text: "Names",
      html: this.nunjucks.render('tabs/names.html.njk', { idPrefix: this.idPrefix }),
      view: "sheet",
      onclick: SocialCalc.SpreadsheetControlNamesOnclick,
      onunclick: SocialCalc.SpreadsheetControlNamesOnunclick
      });

   // Clipboard

   this.tabnums.clipboard = this.tabs.length;
   this.tabs.push({name: "clipboard", text: "Clipboard", html:
      '<div id="%id.clipboardtools" style="display:none;">'+
      '  <table cellspacing="0" cellpadding="0"><tr>'+
      '   <td style="vertical-align:top;padding-right:24px;">'+
      '    <div style="%tbt.">'+
      '     &nbsp;'+
      '    </div>'+
      '   </td>'+
      '  </tr></table>'+
      '</div>',
      view: "clipboard",
      onclick: SocialCalc.SpreadsheetControlClipboardOnclick,
      onclickFocus: "clipboardtext"
      });

   this.views["clipboard"] = {name: "clipboard", divStyle: "overflow:auto;", html:
      ' <div style="font-size:x-small;padding:5px 0px 10px 0px;">'+
      '  <b>%loc!Display Clipboard in!:</b>'+
      '  <input type="radio" id="%id.clipboardformat-tab" name="%id.clipboardformat" checked onclick="%s.SpreadsheetControlClipboardFormat(\'tab\');"> %loc!Tab-delimited format! &nbsp;'+
      '  <input type="radio" id="%id.clipboardformat-csv" name="%id.clipboardformat" onclick="%s.SpreadsheetControlClipboardFormat(\'csv\');"> %loc!CSV format! &nbsp;'+
      '  <input type="radio" id="%id.clipboardformat-scsave" name="%id.clipboardformat" onclick="%s.SpreadsheetControlClipboardFormat(\'scsave\');"> %loc!SocialCalc-save format!'+
      ' </div>'+
      ' <input type="button" value="%loc!Load SocialCalc Clipboard With This!" style="font-size:x-small;" onclick="%s.SpreadsheetControlClipboardLoad();">&nbsp; '+
      ' <input type="button" value="%loc!Clear SocialCalc Clipboard!" style="font-size:x-small;" onclick="%s.SpreadsheetControlClipboardClear();">&nbsp; '+
      ' <br>'+
      ' <textarea id="%id.clipboardtext" style="font-size:small;height:350px;width:800px;overflow:auto;" onfocus="%s.CmdGotFocus(this);"></textarea>'
      };

   return;
}

// Methods:

SocialCalc.SpreadsheetControl.prototype.DoOnResize = function() {return SocialCalc.DoOnResize(this);};
SocialCalc.SpreadsheetControl.prototype.SizeSSDiv = function() {return SocialCalc.SizeSSDiv(this);};
SocialCalc.SpreadsheetControl.prototype.ExecuteCommand =
   function(combostr, sstr) {return SocialCalc.SpreadsheetControlExecuteCommand(this, combostr, sstr);};
SocialCalc.SpreadsheetControl.prototype.CreateSheetHTML =
   function() {return SocialCalc.SpreadsheetControlCreateSheetHTML(this);};
SocialCalc.SpreadsheetControl.prototype.CreateSpreadsheetSave =
   function(otherparts) {return SocialCalc.SpreadsheetControlCreateSpreadsheetSave(this, otherparts);};
SocialCalc.SpreadsheetControl.prototype.DecodeSpreadsheetSave =
   function(str) {return SocialCalc.SpreadsheetControlDecodeSpreadsheetSave(this, str);};
SocialCalc.SpreadsheetControl.prototype.CreateCellHTML =
   function(coord) {return SocialCalc.SpreadsheetControlCreateCellHTML(this, coord);};
SocialCalc.SpreadsheetControl.prototype.CreateCellHTMLSave =
   function(range) {return SocialCalc.SpreadsheetControlCreateCellHTMLSave(this, range);};
SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl =
   function(node, height, width, spacebelow) {return SocialCalc.InitializeSpreadsheetControl(this, node, height, width, spacebelow);};


// Sheet Methods to make things a little easier:

SocialCalc.SpreadsheetControl.prototype.ParseSheetSave = function(str) {return this.sheet.ParseSheetSave(str);};
SocialCalc.SpreadsheetControl.prototype.CreateSheetSave = function() {return this.sheet.CreateSheetSave();};


//
// obj = GetSpreadsheetControlObject()
//
// Returns the current spreadsheet control object
//

SocialCalc.GetSpreadsheetControlObject = function() {

  // if in viewer mode return CurrentSpreadsheetViewerObject because CurrentSpreadsheetControlObject is null (bug fix)
   var csco = (SocialCalc.CurrentSpreadsheetControlObject != null)
   ? SocialCalc.CurrentSpreadsheetControlObject : SocialCalc.CurrentSpreadsheetViewerObject;
   if (csco) return csco;

//   throw ("No current SpreadsheetControl object.");

   }

//
// SetSpreadsheetControlObject(spreadsheet)
//

SocialCalc.SetSpreadsheetControlObject = function(spreadsheet) {

   SocialCalc.CurrentSpreadsheetControlObject = spreadsheet;

   if (SocialCalc.Keyboard.focusTable && spreadsheet) {
      SocialCalc.Keyboard.focusTable = spreadsheet.editor;
      }

   }

//
// SocialCalc.SpreadsheetControlStatuslineCallback
//

SocialCalc.SpreadsheetControlStatuslineCallback = function(editor, status, arg, params) {

   var rele1, rele2;

   var ele = document.getElementById(params.statuslineid);

   if (ele) {
      ele.innerHTML = editor.GetStatuslineString(status, arg, params);
      }

   switch (status) {
      case "cmdendnorender":
      case "calcfinished":
      case "doneposcalc":
         recalcButton = document.getElementById(params.button_recalc);
         if (editor.context.sheetobj.attribs.needsrecalc=="yes")
            recalcButton.style.display = "inline";
         else
            recalcButton.style.display = "none";
         break;
      default:
         break;
      }

   }