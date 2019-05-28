// *************************************
//
// Cell class:
//
// *************************************

//
// Class SocialCalc.Cell
//
// Usage: var s = new SocialCalc.Cell(coord);
//
// Cell attributes include:
//
//    coord: the column/row as a string, e.g., "A1"
//    datavalue: the value to be used for computation and formatting for display,
//               string or numeric (tolerant of numbers stored as strings)
//    datatype: if present, v=numeric value, t=text value, f=formula,
//              or c=constant that is not a simple number (like "$1.20")
//    formula: if present, the formula (without leading "=") for computation or the constant
//    valuetype: first char is main type, the following are sub-types.
//               Main types are b=blank cell, n=numeric, t=text, e=error
//               Examples of using sub-types would be "nt" for a numeric time value, "n$" for currency, "nl" for logical
//    readonly: if present, whether the current cell is read-only of writable
//    displayvalue: if present, rendered version of datavalue with formatting attributes applied
//    parseinfo: if present, cached parsed version of formula
//
//    The following optional values, if present, are mainly used in rendering, overriding defaults:
//
//    bt, br, bb, bl: number of border's definition
//    layout: layout (vertical alignment, padding) definition number
//    font: font definition number
//    color: text color definition number
//    bgcolor: background color definition number
//    cellformat: cell format (horizontal alignment) definition number
//    nontextvalueformat: custom format definition number for non-text values, e.g., numbers
//    textvalueformat: custom format definition number for text values
//    colspan, rowspan: number of cells to span for merged cells (only on main cell)
//    cssc: custom css classname for cell, as text (no special chars)
//    csss: custom css style definition
//    mod: modification allowed flag "y" if present
//    comment: cell comment string
//

// Eddy - SocialCalc.Cell

SocialCalc.Cell = function(coord) {

   this.coord = coord;
   this.datavalue = "";
   this.datatype = null;
   this.formula = "";
   this.valuetype = "b";
   this.readonly = false;

   }

// The types of cell properties
//
// Type 1: Base, Type 2: Attribute, Type 3: Special (e.g., displaystring, parseinfo)

SocialCalc.CellProperties = {
   coord: 1, datavalue: 1, datatype: 1, formula: 1, valuetype: 1, errors: 1, comment: 1, readonly: 1,
   bt: 2, br: 2, bb: 2, bl: 2, layout: 2, font: 2, color: 2, bgcolor: 2,
   cellformat: 2, nontextvalueformat: 2, textvalueformat: 2, colspan: 2, rowspan: 2,
   cssc: 2, csss: 2, mod: 2,
   displaystring: 3, // used to cache rendered HTML of cell contents
   parseinfo: 3, // used to cache parsed formulas
   hcolspan: 3, hrowspan: 3 // spans taking hidden cols/rows into account (!!! NOT YET !!!)
   };

SocialCalc.CellPropertiesTable = {
   bt: "borderstyle", br: "borderstyle", bb: "borderstyle", bl: "borderstyle",
   layout: "layout", font: "font", color: "color", bgcolor: "color",
   cellformat: "cellformat", nontextvalueformat: "valueformat", textvalueformat: "valueformat"
   };


//
// SocialCalc.GetCellContents(sheetobj, coord)
//
// Returns the contents (value, formula, constant, etc.) of a cell
// with appropriate prefix ("'", "=", etc.)
//

SocialCalc.GetCellContents = function(sheetobj, coord) {

   var result = "";
   var cellobj = sheetobj.cells[coord];
   if (cellobj) {
      switch (cellobj.datatype) {
         case "v":
            result = cellobj.datavalue+"";
            break;
         case "t":
            result = "'"+cellobj.datavalue;
            break;
         case "f":
            result = "="+cellobj.formula;
            break;
         case "c":
            result = cellobj.formula;
            break;
         default:
            break;
         }
      }

   return result;

   }
