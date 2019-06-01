//
// SocialCalcTableEditor
//
/*
// The code module of the SocialCalc package that displays a scrolling grid with panes
// and handles keyboard and mouse I/O.
//
// (c) Copyright 2008, 2009, 2010 Socialtext, Inc.
// All Rights Reserved.
//
*/

/*

LEGAL NOTICES REQUIRED BY THE COMMON PUBLIC ATTRIBUTION LICENSE:

EXHIBIT A. Common Public Attribution License Version 1.0.

The contents of this file are subject to the Common Public Attribution License Version 1.0 (the
"License"); you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://socialcalc.org. The License is based on the Mozilla Public License Version 1.1 but
Sections 14 and 15 have been added to cover use of software over a computer network and provide for
limited attribution for the Original Developer. In addition, Exhibit A has been modified to be
consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY OF ANY
KIND, either express or implied. See the License for the specific language governing rights and
limitations under the License.

The Original Code is SocialCalc JavaScript TableEditor.

The Original Developer is the Initial Developer.

The Initial Developer of the Original Code is Socialtext, Inc. All portions of the code written by
Socialtext, Inc., are Copyright (c) Socialtext, Inc. All Rights Reserved.

Contributor: Dan Bricklin.


EXHIBIT B. Attribution Information

When the TableEditor is producing and/or controlling the display the Graphic Image must be
displayed on the screen visible to the user in a manner comparable to that in the
Original Code. The Attribution Phrase must be displayed as a "tooltip" or "hover-text" for
that image. The image must be linked to the Attribution URL so as to access that page
when clicked. If the user interface includes a prominent "about" display which includes
factual prominent attribution in a form similar to that in the "about" display included
with the Original Code, including Socialtext copyright notices and URLs, then the image
need not be linked to the Attribution URL but the "tool-tip" is still required.

Attribution Copyright Notice:

 Copyright (C) 2010 Socialtext, Inc.
 All Rights Reserved.

Attribution Phrase (not exceeding 10 words): SocialCalc

Attribution URL: http://www.socialcalc.org/xoattrib

Graphic Image: The contents of the sc-logo.gif file in the Original Code or
a suitable replacement from http://www.socialcalc.org/licenses specified as
being for SocialCalc.

Display of Attribution Information is required in Larger Works which are defined
in the CPAL as a work which combines Covered Code or portions thereof with code
not governed by the terms of the CPAL.

*/

//
// Some of the other files in the SocialCalc package are licensed under
// different licenses. Please note the licenses of the modules you use.
//
// Code History:
//
// Initially coded by Dan Bricklin of Software Garden, Inc., for Socialtext, Inc.
// Based in part on the SocialCalc 1.1.0 code written in Perl.
// The SocialCalc 1.1.0 code was:
//    Portions (c) Copyright 2005, 2006, 2007 Software Garden, Inc.
//    All Rights Reserved.
//    Portions (c) Copyright 2007 Socialtext, Inc.
//    All Rights Reserved.
// The Perl SocialCalc started as modifications to the wikiCalc(R) program, version 1.0.
// wikiCalc 1.0 was written by Software Garden, Inc.
// Unless otherwise specified, referring to "SocialCalc" in comments refers to this
// JavaScript version of the code, not the SocialCalc Perl code.
//

/*

See the comments in the main SocialCalc code module file of the SocialCalc package.

*/

   var SocialCalc;
   if (!SocialCalc) { // created here, too, in case load order is wrong, but main routines are required
      SocialCalc = {};
      }

// *************************************
//
// Table Editor class:
//
// *************************************

// Constructor:

SocialCalc.TableEditor = function(context) {

   var scc = SocialCalc.Constants;

   // Properties:

   this.context = context; // editing context
   this.toplevel = null; // top level HTML element for this table editor
   this.toplevel = null; // top level HTML element for this table editor
   this.fullgrid = null; // rendered editing context

   this.noEdit = false; // if true, disable all edit UI and make read-only

   this.width = null;
   this.tablewidth = null;
   this.height = null;
   this.tableheight = null;

   this.inputBox = null;
   this.inputEcho = null;
   this.verticaltablecontrol = null;
   this.horizontaltablecontrol = null;

   this.logo = null;

   this.cellhandles = null;

   // Dynamic properties:

   this.timeout = null; // if non-null, timer id for position calculations
   this.busy = false; // true when executing command, calculating, etc.
   this.ensureecell = false; // if true, ensure ecell is visible after timeout
   this.deferredCommands = []; // commands to execute after busy, in form: {cmdstr: "cmds", saveundo: t/f}
   this.deferredEmailCommands = []; // Email commands to execute after busy, in form: {cmdstr: "cmds", saveundo: t/f}

   this.gridposition = null; // screen coords of full grid
   this.headposition = null; // screen coords of upper left of grid within header rows
   this.firstscrollingrow = null; // row number of top row in last (the scrolling) pane
   this.firstscrollingrowtop = null;  // position of top row in last (the scrolling) pane
   this.lastnonscrollingrow = null; // row number of last displayed row in last non-scrolling
                                    // pane, or zero (for thumb position calculations)
   this.lastvisiblerow = null; // used for paging down
   this.firstscrollingcol = null; // column number of top col in last (the scrolling) pane
   this.firstscrollingcolleft = null;  // position of top col in last (the scrolling) pane
   this.lastnonscrollingcol = null; // col number of last displayed column in last non-scrolling
                                    // pane, or zero (for thumb position calculations)
   this.lastvisiblecol = null; // used for paging right

   this.rowpositions = []; // screen positions of the top of some rows
   this.colpositions = []; // screen positions of the left side of some rows
   this.rowheight = []; // size in pixels of each row when last checked, or null/undefined, for page up
   this.colwidth = []; // size in pixels of each column when last checked, or null/undefined, for page left

   this.ecell = null; // either null or {coord: c, row: r, col: c}
   this.state = "start"; // the keyboard states: see EditorProcessKey

   this.workingvalues = {}; // values used during keyboard editing, etc.

   // Constants:

   this.imageprefix = scc.defaultImagePrefix; // URL prefix for images (e.g., "/images/sc")
   this.idPrefix = scc.defaultTableEditorIDPrefix;
   this.pageUpDnAmount = scc.defaultPageUpDnAmount; // number of rows to move cursor on PgUp/PgDn keys (numeric)

   // Callbacks

   // recalcFunction: if present, function(editor) {...}, called to do a recalc
   // Default (sheet.RecalcSheet) does all the right stuff.

   this.recalcFunction = function(editor) {
      if (editor.context.sheetobj.RecalcSheet) {
         editor.context.sheetobj.RecalcSheet(SocialCalc.EditorSheetStatusCallback, editor);
         }
      else return null;
      };

   // ctrlkeyFunction: if present, function(editor, charname) {...}, called to handle ctrl-V, etc., at top level
   // Returns true (pass through for continued processing) or false (stop processing this key).

   this.ctrlkeyFunction = function(editor, charname) {

      var ta, cell, position, cmd, sel, cliptext;

      switch (charname) {
         case "[ctrl-a]":
            editor.MoveECell("A1");
            editor.RangeAnchor("A1");
            editor.RangeExtend(SocialCalc.crToCoord(editor.context.sheetobj.attribs.lastcol,editor.context.sheetobj.attribs.lastrow));
            return false;
         case "[ctrl-c]":
         case "[ctrl-x]":
            ta = editor.pasteTextarea;
            ta.value = "";
            cell=SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);
            if (cell) {
               position = SocialCalc.GetElementPosition(cell.element);
               ta.style.left = (position.left-1)+"px";
               ta.style.top = (position.top-1)+"px";
               }
            if (editor.range.hasrange) {
               sel = SocialCalc.crToCoord(editor.range.left, editor.range.top)+
                  ":"+SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
               }
            else {
               sel = editor.ecell.coord;
               }

            // get what to copy to clipboard
            cliptext = SocialCalc.ConvertSaveToOtherFormat(SocialCalc.CreateSheetSave(editor.context.sheetobj, sel), "tab");

            if (charname == "[ctrl-c]" || editor.noEdit || editor.ECellReadonly()) { // if copy or cut but in no edit
               cmd = "copy "+sel+" formulas";
               }
            else { // [ctrl-x]
               cmd = "cut "+sel+" formulas";
               }
            editor.EditorScheduleSheetCommands(cmd, true, false); // queue up command to put on SocialCalc clipboard

            ta.style.display = "block";
            ta.value = cliptext; // must follow "block" setting for Webkit
            ta.focus();
            ta.select();
            window.setTimeout(function() {
               var ta = editor.pasteTextarea;
               ta.blur();
               ta.style.display = "none";
               SocialCalc.KeyboardFocus();
               }, 200);

            return true;

         case "[ctrl-v]":
            if (editor.noEdit || editor.ECellReadonly()) return true; // not if no edit
            ta = editor.pasteTextarea;
            ta.value = "";
            cell=SocialCalc.GetEditorCellElement(editor, editor.ecell.row, editor.ecell.col);
            if (cell) {
               position = SocialCalc.GetElementPosition(cell.element);
               ta.style.left = (position.left-1)+"px";
               ta.style.top = (position.top-1)+"px";
               }
            ta.style.display = "block";
            ta.value = "";  // must follow "block" setting for Webkit
            ta.focus();
            window.setTimeout(function() {
               var ta = editor.pasteTextarea;
               var value = ta.value;
               ta.blur();
               ta.style.display = "none";
               var cmd = "";
               if(editor.pastescclipboard) {
                 // Clipboard loaded from "clipboard tab" - see  SpreadsheetControlClipboardLoad
                 // ignore windows clipboard contents
                 editor.pastescclipboard = false;
                 }
               else {
                 // Use windows clipboard contents if value does not match last copy
                 var clipstr = SocialCalc.ConvertSaveToOtherFormat(SocialCalc.Clipboard.clipboard, "tab");
                 value = value.replace(/\r\n/g, "\n");
                 // pastes SocialCalc clipboard if did a Ctrl-C and contents still the same
                 // Webkit adds an extra blank line, so need to allow for that
                 if (value != clipstr && (value.length-clipstr.length!=1 || value.substring(0,value.length-1)!=clipstr)) {
                    cmd = "loadclipboard "+
                    SocialCalc.encodeForSave(SocialCalc.ConvertOtherFormatToSave(value, "tab")) + "\n";
                    }
                 }
               var cr;
               if (editor.range.hasrange) {
                  var clipsheet = new SocialCalc.Sheet();
                  clipsheet.ParseSheetSave(SocialCalc.Clipboard.clipboard);
                  var matches = clipsheet.copiedfrom.match(/(.+):(.+)/);
                  if (matches !== null && matches[1] === matches[2]) {
                    // copy one cell to selected range
                    cr = SocialCalc.crToCoord(editor.range.left, editor.range.top) +
                      ':' + SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
                  } else {
                    cr = SocialCalc.crToCoord(editor.range.left, editor.range.top);
                  }
                  }
               else {
                  cr = editor.ecell.coord;
                  }
               cmd += "paste "+cr+" formulas";
               editor.EditorScheduleSheetCommands(cmd, true, false);
               SocialCalc.KeyboardFocus();
               }, 200);
            return true;

         case "[ctrl-z]":
            editor.EditorScheduleSheetCommands("undo", true, false);
            return false;

         case "[ctrl-s]": // !!!! temporary hack
            if (!SocialCalc.Constants.AllowCtrlS) break;
            window.setTimeout(
               function() {
                  var sheet = editor.context.sheetobj;
                  var cell = sheet.GetAssuredCell(editor.ecell.coord);
                  var ntvf = cell.nontextvalueformat ? sheet.valueformats[cell.nontextvalueformat-0] || "" : "";
                  var newntvf = window.prompt("Advanced Feature:\n\nCustom Numeric Format or Command", ntvf);
                  if (newntvf != null) { // not cancelled
                     if (newntvf.match(/^cmd:/)) {
                        cmd = newntvf.substring(4); // execute as command
                        }
                     else if (newntvf.match(/^edit:/)) {
                        cmd = newntvf.substring(5); // execute as command
                        if (SocialCalc.CtrlSEditor) {
                           SocialCalc.CtrlSEditor(cmd);
                           }
                        return;
                        }
                     else {
                        if (editor.range.hasrange) {
                           sel = SocialCalc.crToCoord(editor.range.left, editor.range.top)+
                              ":"+SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
                           }
                        else {
                          sel = editor.ecell.coord;
                           }
                        cmd = "set "+sel+" nontextvalueformat "+newntvf;
                        }
                     editor.EditorScheduleSheetCommands(cmd, true, false);
                     }
                  },
               200);
            return false;

         default:
            break;
            }
      return true;
      };

   // Set sheet's status callback:

   context.sheetobj.statuscallback = SocialCalc.EditorSheetStatusCallback;
   context.sheetobj.statuscallbackparams = this; // this object: the table editor object


   // StatusCallback: all values are called at appropriate times, add with unique name, delete when done
   //
   // Each value must be an object in the form of:
   //
   //    func: function(editor, status, arg, params) {...},
   //    params: params value to call func with
   //
   // The values for status and arg are:
   //
   //    all the SocialCalc RecalcSheet statuscallbacks, including:
   //
   //       calccheckdone, calclist length
   //       calcorder, {coord: coord, total: celllist length, count: count}
   //       calcstep, {coord: coord, total: calclist length, count: count}
   //       calcfinished, time in milliseconds
   //
   //    the command callbacks, like cmdstart and cmdend
   //    cmdendnorender
   //
   //    calcstart, null
   //    moveecell, new ecell coord
   //    rangechange, "coord:coord" or "coord" or ""
   //    specialkey, keyname ("[esc]")
   //

   this.StatusCallback = {};


   this.MoveECellCallback = {}; // all values are called with editor as arg; add with unique name, delete when done
   this.RangeChangeCallback = {}; // all values are called with editor as arg; add with unique name, delete when done
   this.SettingsCallbacks = {}; // See SocialCalc.SaveEditorSettings

   // Set initial cursor

   this.ecell = {coord: "A1", row: 1, col: 1};
   context.highlights[this.ecell.coord] = "cursor";

   // Initialize range data
   // Range has at least hasrange (true/false).
   // It may also have: anchorcoord, anchorrow, anchorcol, top, bottom, left, and right.

   this.range = {hasrange: false};

   // Initialize range2 data (used to show selections, such as for move)
   // Range2 has at least hasrange (true/false).
   // It may also have: top, bottom, left, and right.

   this.range2 = {hasrange: false};

   // computed table size

   this.tableFullScrollableHeight = 0;
   this.firstVisibleRowHeightToTopScrollableContainer = 0;

   this.tableFullScrollableWidth = 0;
   this.firstVisibleColWidthToTopScrollableContainer = 0;

   }

// Methods:

SocialCalc.TableEditor.prototype.CreateTableEditor = function(width, height) {return SocialCalc.CreateTableEditor(this);};
SocialCalc.TableEditor.prototype.ResizeTableEditor = function(width, height) {return SocialCalc.ResizeTableEditor(this, width, height);};

SocialCalc.TableEditor.prototype.SaveEditorSettings = function() {return SocialCalc.SaveEditorSettings(this);};
SocialCalc.TableEditor.prototype.LoadEditorSettings = function(str, flags) {return SocialCalc.LoadEditorSettings(this, str, flags);};

SocialCalc.TableEditor.prototype.EditorRenderSheet = function() {SocialCalc.EditorRenderSheet(this);};
SocialCalc.TableEditor.prototype.EditorScheduleSheetCommands = function(cmdstr, saveundo, ignorebusy) {SocialCalc.EditorScheduleSheetCommands(this, cmdstr, saveundo, ignorebusy);};
SocialCalc.TableEditor.prototype.ScheduleSheetCommands = function(cmdstr, saveundo) {
   this.context.sheetobj.ScheduleSheetCommands(cmdstr, saveundo);
   };
SocialCalc.TableEditor.prototype.SheetUndo = function() {
   this.context.sheetobj.SheetUndo();
   };
SocialCalc.TableEditor.prototype.SheetRedo = function() {
   this.context.sheetobj.SheetRedo();
   };
SocialCalc.TableEditor.prototype.EditorStepSet = function(status, arg) {SocialCalc.EditorStepSet(this, status, arg);};
SocialCalc.TableEditor.prototype.GetStatuslineString = function(status, arg, params) {return SocialCalc.EditorGetStatuslineString(this, status, arg, params);};

SocialCalc.TableEditor.prototype.EditorMouseRegister = function() {return SocialCalc.EditorMouseRegister(this);};
SocialCalc.TableEditor.prototype.EditorMouseUnregister = function() {return SocialCalc.EditorMouseUnregister(this);};
SocialCalc.TableEditor.prototype.EditorMouseRange = function(coord) {return SocialCalc.EditorMouseRange(this, coord);};

SocialCalc.TableEditor.prototype.EditorProcessKey = function(ch, e) {return SocialCalc.EditorProcessKey(this, ch, e);};
SocialCalc.TableEditor.prototype.EditorAddToInput = function(str, prefix) {return SocialCalc.EditorAddToInput(this, str, prefix);};
SocialCalc.TableEditor.prototype.DisplayCellContents = function() {return SocialCalc.EditorDisplayCellContents(this);};
SocialCalc.TableEditor.prototype.EditorSaveEdit = function(text) {return SocialCalc.EditorSaveEdit(this, text);};
SocialCalc.TableEditor.prototype.EditorApplySetCommandsToRange = function(cmdline, type) {return SocialCalc.EditorApplySetCommandsToRange(this, cmdline, type);};

SocialCalc.TableEditor.prototype.MoveECellWithKey = function(ch) {return SocialCalc.MoveECellWithKey(this, ch);};
SocialCalc.TableEditor.prototype.MoveECell = function(newcell) { if (SocialCalc._app) return "A1"; return SocialCalc.MoveECell(this, newcell);};
SocialCalc.TableEditor.prototype.ReplaceCell = function(cell, row, col) {SocialCalc.ReplaceCell(this, cell, row, col);};
SocialCalc.TableEditor.prototype.UpdateCellCSS = function(cell, row, col) {SocialCalc.UpdateCellCSS(this, cell, row, col);};
SocialCalc.TableEditor.prototype.SetECellHeaders = function(selected) {SocialCalc.SetECellHeaders(this, selected);};
SocialCalc.TableEditor.prototype.EnsureECellVisible = function() {SocialCalc.EnsureECellVisible(this);};
SocialCalc.TableEditor.prototype.ECellReadonly = function(coord) {return SocialCalc.ECellReadonly(this, coord);};
SocialCalc.TableEditor.prototype.RangeAnchor = function(coord) {SocialCalc.RangeAnchor(this, coord);};
SocialCalc.TableEditor.prototype.RangeExtend = function(coord) {SocialCalc.RangeExtend(this, coord);};
SocialCalc.TableEditor.prototype.RangeRemove = function() {SocialCalc.RangeRemove(this);};
SocialCalc.TableEditor.prototype.Range2Remove = function() {SocialCalc.Range2Remove(this);};

SocialCalc.TableEditor.prototype.FitToEditTable = function() {SocialCalc.FitToEditTable(this);};
SocialCalc.TableEditor.prototype.CalculateEditorPositions = function() {SocialCalc.CalculateEditorPositions(this);};
SocialCalc.TableEditor.prototype.ScheduleRender = function() {this.ScheduleRender(true);};
SocialCalc.TableEditor.prototype.ScheduleRender = function(renderwidgets) {
  // App widgets need focus - so only render widgets when needed, rather than the default of rendering everything.
  if(SocialCalc._app && renderwidgets == true) this.context.sheetobj.widgetsClean = false;
  SocialCalc.ScheduleRender(this);
  };
SocialCalc.TableEditor.prototype.DoRenderStep = function() {SocialCalc.DoRenderStep(this);};
SocialCalc.TableEditor.prototype.SchedulePositionCalculations = function() {SocialCalc.SchedulePositionCalculations(this);};
SocialCalc.TableEditor.prototype.DoPositionCalculations = function() {SocialCalc.DoPositionCalculations(this);};
SocialCalc.TableEditor.prototype.CalculateRowPositions = function(panenum, positions, sizes) {return SocialCalc.CalculateRowPositions(this,  panenum, positions, sizes);};
SocialCalc.TableEditor.prototype.CalculateColPositions = function(panenum, positions, sizes) {return SocialCalc.CalculateColPositions(this,  panenum, positions, sizes);};

SocialCalc.TableEditor.prototype.ScrollRelative = function(vertical, amount) {SocialCalc.ScrollRelative(this, vertical, amount);};
SocialCalc.TableEditor.prototype.ScrollRelativeBoth = function(vamount, hamount) {SocialCalc.ScrollRelativeBoth(this, vamount, hamount);};
SocialCalc.TableEditor.prototype.PageRelative = function(vertical, direction) {SocialCalc.PageRelative(this, vertical, direction);};
SocialCalc.TableEditor.prototype.LimitLastPanes = function() {SocialCalc.LimitLastPanes(this);};

SocialCalc.TableEditor.prototype.ScrollTableUpOneRow = function() {return SocialCalc.ScrollTableUpOneRow(this);};
SocialCalc.TableEditor.prototype.ScrollTableDownOneRow = function() {return SocialCalc.ScrollTableDownOneRow(this);};
SocialCalc.TableEditor.prototype.ScrollTableLeftOneCol = function() {return SocialCalc.ScrollTableLeftOneCol(this);};
SocialCalc.TableEditor.prototype.ScrollTableRightOneCol = function() {return SocialCalc.ScrollTableRightOneCol(this);};

SocialCalc.TableEditor.prototype.StopPropagation = function() {
    return SocialCalc.StopPropagation(this);
};

SocialCalc.TableEditor.prototype.SetMouseMoveUp = function() {
    return SocialCalc.SetMouseMoveUp(this);
};

SocialCalc.TableEditor.prototype.RemoveMouseMoveUp = function() {
    return SocialCalc.RemoveMouseMoveUp(this);
};

SocialCalc.TableEditor.prototype.ComputeTableSize = function(control) {
   // filling the rowheight array is some row are missing
   if (this.rowheight.length < this.context.sheetobj.attribs.lastrow) {
      for(var i = this.rowheight.length; i < this.context.sheetobj.attribs.lastrow + 1; i++)
         this.rowheight[i] = this.context.pixelsPerRow;
   }

   this.tableFullScrollableHeight = 0;
   for(var i = this.lastnonscrollingrow + 1; i < this.rowheight.length + 1; i++) {
      if (this.rowheight[i]) this.tableFullScrollableHeight += this.rowheight[i];
   }
   this.firstVisibleRowHeightToTopScrollableContainer = 0;
   for(var i = this.lastnonscrollingrow + 1; i < this.firstscrollingrow; i++) {
      if (this.rowheight[i]) this.firstVisibleRowHeightToTopScrollableContainer += this.rowheight[i];
   }


   // filling the colwidth array is some col are missing
   if (this.colwidth.length < this.context.sheetobj.attribs.lastcol) {
      for(var i = this.colwidth.length; i < this.context.sheetobj.attribs.lastcol + 1; i++)
         this.colwidth[i] = this.context.rownamewidth;
   }

   this.tableFullScrollableWidth = 0;
   for(var i = this.lastnonscrollingcol + 1; i < this.colwidth.length + 1; i++) {
      if (this.colwidth[i]) this.tableFullScrollableWidth += this.colwidth[i];
   }
   this.firstVisibleColWidthToTopScrollableContainer = 0;
   for(var i = this.lastnonscrollingcol + 1; i < this.firstscrollingcol; i++) {
      if (this.colwidth[i]) this.firstVisibleColWidthToTopScrollableContainer += this.colwidth[i];
   }
}