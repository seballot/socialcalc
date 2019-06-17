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
   this.requestedHeight = 0;
   this.requestedWidth = 0;
   this.requestedSpaceBelow = 0;
   this.height = 0;
   this.width = 0;
   this.viewheight = 0; // calculated amount for views below toolbar, etc.

   // Dynamic properties:

   this.sheet = null;
   this.context = null;
   this.editor = null;

   this.spreadsheetDiv = null; // Main DOM container
   this.$container = null; // Main DOM container (jQuery object)
   this.editorDiv = null;
   this.sortrange = ""; // remembered range for sort tab
   this.moverange = ""; // remembered range from movefrom used by movepaste/moveinsert

   // Constants:

   this.idPrefix = idPrefix || "SocialCalc-"; // prefix added to element ids used here, should end in "-"
   this.multipartBoundary = "SocialCalcSpreadsheetControlSave"; // boundary used by SpreadsheetControlCreateSpreadsheetSave
   this.imagePrefix = scc.defaultImagePrefix; // prefix added to img src

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

   this.editor.SettingsCallbacks.sort = {save: SocialCalc.SpreadsheetControlSortSave, load: SocialCalc.SpreadsheetControlSortLoad};

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
SocialCalc.SpreadsheetControl.prototype.InitializeToolBar = function() {return SocialCalc.InitializeSpreadsheetToolBar(this);};

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

   var ele = document.getElementById(params.statuslineid);

   if (ele) ele.innerHTML = editor.GetStatuslineString(status, arg, params);

   // switch (status) {
   //    case "cmdendnorender":
   //    case "calcfinished":
   //    case "doneposcalc":
   //       recalcButton = document.getElementById(params.button_recalc);
   //       if (editor.context.sheetobj.attribs.needsrecalc=="yes")
   //          recalcButton.style.display = "inline";
   //       else
   //          recalcButton.style.display = "none";
   //       break;
   //    default:
   //       break;
   // }

}