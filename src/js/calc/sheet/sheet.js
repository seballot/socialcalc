// *************************************
//
// Sheet class:
//
// *************************************

//
// Class SocialCalc.Sheet
//
// Usage: var s = new SocialCalc.Sheet();
//

SocialCalc.Sheet = function() {

   SocialCalc.ResetSheet(this);

   // Set other values:
   //
   // sheet.statuscallback(data, status, arg, this.statuscallbackparams) is called
   // during recalc and commands.
   //
   // During recalc, data is the current recalcdata.
   // The values for status and the corresponding arg are:
   //
   //    calcorder, {coord: coord, total: celllist length, count: count} [0 or more times per recalc]
   //    calccheckdone, calclist length [once per recalc]
   //    calcstep, {coord: coord, total: calclist length, count: count} [0 or more times per recalc]
   //    calcloading, {sheetname: name-of-sheet}
   //    calcserverfunc, {funcname: name-of-function, coord: coord, total: calclist length, count: count}
   //    calcfinished, time in milliseconds [once per recalc]
   //
   // During commands, data is SocialCalc.SheetCommandInfo.
   // These values for status and arg are:
   //
   //    cmdstart, cmdstr
   //    cmdend
   //

   this.statuscallback = null; // routine called with cmdstart, calcstart, etc., status and args:
                                // sheet.statuscallback(data, status, arg, params)
   this.statuscallbackparams = null; // parameters passed to that routine

   }

//
// SocialCalc.ResetSheet(sheet)
//
// Resets (and/or initializes) sheet data values.
//

SocialCalc.ResetSheet = function(sheet, reload) {

   // properties:

   sheet.cells = {}; // at least one for each non-blank cell: coord: cell-object
   sheet.attribs = // sheet attributes
      {
         lastcol: 1,
         lastrow: 1,
         defaultlayout: 0,
         usermaxcol: 0,
         usermaxrow: 0

      };
   sheet.rowattribs =
      {
         hide: {}, // access by row number
         height: {}
      };
   sheet.colattribs =
      {
         width: {}, // access by col name
         hide: {}
      };
   sheet.names={}; // Each is: {desc: "optional description", definition: "B5, A1:B7, or =formula"}
   sheet.layouts=[];
   sheet.layouthash={};
   sheet.fonts=[];
   sheet.fonthash={};
   sheet.colors=[];
   sheet.colorhash={};
   sheet.borderstyles=[];
   sheet.borderstylehash={};
   sheet.cellformats=[];
   sheet.cellformathash={};
   sheet.valueformats=[];
   sheet.valueformathash={};
   sheet.matched_cells=[];
   sheet.selected_search_cell=undefined;

   sheet.copiedfrom = ""; // if a range, then this was loaded from a saved range as clipboard content

   sheet.changes = new SocialCalc.UndoStack();

   sheet.renderneeded = false;

   sheet.changedrendervalues = true; // if true, spans and/or fonts have changed (set by ExecuteSheetCommand & GetStyle)

   sheet.recalcchangedavalue = false; // true if a recalc resulted in a change to a cell's calculated value

   sheet.hiddencolrow = ""; // "col" or "row" if it was hidden

   sheet.sci = new SocialCalc.SheetCommandInfo(sheet);

   sheet.ioEventTree ={};
   sheet.ioParameterList = {};

   }

// Methods:

SocialCalc.Sheet.prototype.ResetSheet = function() {SocialCalc.ResetSheet(this);};
SocialCalc.Sheet.prototype.AddCell = function(newcell) {return this.cells[newcell.coord]=newcell;};
SocialCalc.Sheet.prototype.LastCol = function() {
    var last_col = 1;
    for (var cell_id  in this.cells) {
        var cr = SocialCalc.coordToCr(cell_id);
        if (cr.col > last_col) {
            last_col = cr.col;
        }
    }
    return last_col;
}
SocialCalc.Sheet.prototype.LastRow = function() {
    var last_row = 1;
    for (var cell_id  in this.cells) {
        var cr = SocialCalc.coordToCr(cell_id);
        if (cr.row > last_row) {
            last_row = cr.row;
        }
    }
    return last_row;
}
SocialCalc.Sheet.prototype.GetAssuredCell = function(coord) {
   return this.cells[coord] || this.AddCell(new SocialCalc.Cell(coord));
   };
SocialCalc.Sheet.prototype.ParseSheetSave = function(savedsheet) {SocialCalc.ParseSheetSave(savedsheet,this);};
SocialCalc.Sheet.prototype.CellFromStringParts = function(cell, parts, j) {return SocialCalc.CellFromStringParts(this, cell, parts, j);};
SocialCalc.Sheet.prototype.CreateSheetSave = function(range, canonicalize) {return SocialCalc.CreateSheetSave(this, range, canonicalize);};
SocialCalc.Sheet.prototype.CellToString = function(cell) {return SocialCalc.CellToString(this, cell);};
SocialCalc.Sheet.prototype.CanonicalizeSheet = function(full) {return SocialCalc.CanonicalizeSheet(this, full);};
SocialCalc.Sheet.prototype.EncodeCellAttributes = function(coord) {return SocialCalc.EncodeCellAttributes(this, coord);};
SocialCalc.Sheet.prototype.EncodeSheetAttributes = function() {return SocialCalc.EncodeSheetAttributes(this);};
SocialCalc.Sheet.prototype.DecodeCellAttributes = function(coord, attribs, range) {return SocialCalc.DecodeCellAttributes(this, coord, attribs, range);};
SocialCalc.Sheet.prototype.DecodeSheetAttributes = function(attribs) {return SocialCalc.DecodeSheetAttributes(this, attribs);};

SocialCalc.Sheet.prototype.ScheduleSheetCommands = function(cmd, saveundo) {return SocialCalc.ScheduleSheetCommands(this, cmd, saveundo);};
SocialCalc.Sheet.prototype.SheetUndo = function() {return SocialCalc.SheetUndo(this);};
SocialCalc.Sheet.prototype.SheetRedo = function() {return SocialCalc.SheetRedo(this);};
SocialCalc.Sheet.prototype.CreateAuditString = function() {return SocialCalc.CreateAuditString(this);};
SocialCalc.Sheet.prototype.GetStyleNum = function(atype, style) {return SocialCalc.GetStyleNum(this, atype, style);};
SocialCalc.Sheet.prototype.GetStyleString = function(atype, num) {return SocialCalc.GetStyleString(this, atype, num);};
SocialCalc.Sheet.prototype.RecalcSheet = function() {return SocialCalc.RecalcSheet(this);};
