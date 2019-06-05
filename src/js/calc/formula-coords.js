//
// updatedformula = SocialCalc.OffsetFormulaCoords(formula, coloffset, rowoffset)
//
// Change relative cell references by offsets (even those to other worksheets so fill, paste, sort work as expected).
// If not what you want, use absolute references.
//

SocialCalc.OffsetFormulaCoords = function(formula, coloffset, rowoffset) {

   var parseinfo, ttext, ttype, i, cr, newcr;
   var updatedformula = "";
   var scf = SocialCalc.Formula;
   if (!scf) {
      return "Need SocialCalc.Formula";
   }
   var tokentype = scf.TokenType;
   var token_op = tokentype.op;
   var token_string = tokentype.string;
   var token_coord = tokentype.coord;
   var tokenOpExpansion = scf.TokenOpExpansion;

   parseinfo = scf.ParseFormulaIntoTokens(formula);

   for (i=0; i<parseinfo.length; i++) {
      ttype = parseinfo[i].type;
      ttext = parseinfo[i].text;
      if (ttype == token_coord) {
         newcr = "";
         cr = SocialCalc.coordToCr(ttext);
         if (ttext.charAt(0)!="$") { // add col offset unless absolute column
            cr.col += coloffset;
         }
         else {
            newcr += "$";
         }
         newcr += SocialCalc.rcColname(cr.col);
         if (ttext.indexOf("$", 1)==-1) { // add row offset unless absolute row
            cr.row += rowoffset;
         }
         else {
            newcr += "$";
         }
         newcr += cr.row;
         if (cr.row < 1 || cr.col < 1) {
            newcr = "#REF!";
         }
         updatedformula += newcr;
      }
      else if (ttype == token_string) {
         if (ttext.indexOf('"') >= 0) { // quotes to double
            updatedformula += '"' + ttext.replace(/"/, '""') + '"';
         }
         else updatedformula += '"' + ttext + '"';
      }
      else if (ttype == token_op) {
         updatedformula += tokenOpExpansion[ttext] || ttext; // make sure short tokens (e.g., "G") go back full (">=")
      }
      else { // leave everything else alone
         updatedformula += ttext;
      }
   }

   return updatedformula;

}

//
// updatedformula = SocialCalc.AdjustFormulaCoords(formula, col, coloffset, row, rowoffset)
//
// Change all cell references to cells starting with col/row by offsets
//

SocialCalc.AdjustFormulaCoords = function(formula, col, coloffset, row, rowoffset) {

   var ttype, ttext, i, newcr;
   var updatedformula = "";
   var sheetref = false;
   var scf = SocialCalc.Formula;
   if (!scf) {
      return "Need SocialCalc.Formula";
   }
   var tokentype = scf.TokenType;
   var token_op = tokentype.op;
   var token_string = tokentype.string;
   var token_coord = tokentype.coord;
   var tokenOpExpansion = scf.TokenOpExpansion;

   parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(formula);

   for (i=0; i<parseinfo.length; i++) {
      ttype = parseinfo[i].type;
      ttext = parseinfo[i].text;
      if (ttype == token_op) { // references with sheet specifier are not offset
         if (ttext == "!") {
            sheetref = true; // found a sheet reference
         }
         else if (ttext != ":") { // for everything but a range, reset
            sheetref = false;
         }
         ttext = tokenOpExpansion[ttext] || ttext; // make sure short tokens (e.g., "G") go back full (">=")
      }
      if (ttype == token_coord) {
         cr = SocialCalc.coordToCr(ttext);
         if ((coloffset < 0 && cr.col >= col && cr.col < col-coloffset) ||
             (rowoffset < 0 && cr.row >= row && cr.row < row-rowoffset)) { // refs to deleted cells become invalid
            if (!sheetref) {
               cr.col = 0;
               cr.row = 0;
            }
         }
         if (!sheetref) {
            if (cr.col >= col) {
               cr.col += coloffset;
            }
            if (cr.row >= row) {
               cr.row += rowoffset;
            }
         }
         if (ttext.charAt(0)=="$") {
            newcr = "$"+SocialCalc.rcColname(cr.col);
         }
         else {
            newcr = SocialCalc.rcColname(cr.col);
         }
         if (ttext.indexOf("$", 1)!=-1) {
            newcr += "$" + cr.row;
         }
         else {
            newcr += cr.row;
         }
         if (cr.row < 1 || cr.col < 1) {
            newcr = "#REF!";
         }
         ttext = newcr;
      }
      else if (ttype == token_string) {
         if (ttext.indexOf('"') >= 0) { // quotes to double
            ttext = '"' + ttext.replace(/"/, '""') + '"';
         }
         else ttext = '"' + ttext + '"';
      }
      updatedformula += ttext;
   }

   return updatedformula;

}

//
// updatedformula = SocialCalc.ReplaceFormulaCoords(formula, movedto)
//
// Change all cell references to cells that are keys in moveto to be to moveto[coord].
// Don't change references to other sheets.
// Handle range extents specially.
//

SocialCalc.ReplaceFormulaCoords = function(formula, movedto) {

   var ttype, ttext, i, newcr, coord;
   var updatedformula = "";
   var sheetref = false;
   var scf = SocialCalc.Formula;
   if (!scf) {
      return "Need SocialCalc.Formula";
   }
   var tokentype = scf.TokenType;
   var token_op = tokentype.op;
   var token_string = tokentype.string;
   var token_coord = tokentype.coord;
   var tokenOpExpansion = scf.TokenOpExpansion;

   parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(formula);

   for (i=0; i<parseinfo.length; i++) {
      ttype = parseinfo[i].type;
      ttext = parseinfo[i].text;
      if (ttype == token_op) { // references with sheet specifier are not change
         if (ttext == "!") {
            sheetref = true; // found a sheet reference
         }
         else if (ttext != ":") { // for everything but a range, reset
            sheetref = false;
         }

//!!!! HANDLE RANGE EXTENT MOVES

         ttext = tokenOpExpansion[ttext] || ttext; // make sure short tokens (e.g., "G") go back full (">=")
      }
      if (ttype == token_coord) {
         cr = SocialCalc.coordToCr(ttext); // get parts
         coord = SocialCalc.crToCoord(cr.col, cr.row); // get "clean" reference
         if (movedto[coord] && !sheetref) { // this is a reference to a moved cell
            cr = SocialCalc.coordToCr(movedto[coord]); // get new row and col
            if (ttext.charAt(0)=="$") { // copy absolute ref marks if present
               newcr = "$"+SocialCalc.rcColname(cr.col);
            }
            else {
               newcr = SocialCalc.rcColname(cr.col);
            }
            if (ttext.indexOf("$", 1)!=-1) {
               newcr += "$" + cr.row;
            }
            else {
               newcr += cr.row;
            }
            ttext = newcr;
         }
      }
      else if (ttype == token_string) {
         if (ttext.indexOf('"') >= 0) { // quotes to double
            ttext = '"' + ttext.replace(/"/, '""') + '"';
         }
         else ttext = '"' + ttext + '"';
      }
      updatedformula += ttext;
   }

   return updatedformula;

}