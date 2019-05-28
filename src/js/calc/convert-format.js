//
// result = SocialCalc.ConvertSaveToOtherFormat(savestr, outputformat, dorecalc)
//
// Returns a string in the specificed format: "scsave", "html", "csv", "tab" (tab delimited)
// If dorecalc is true, performs a recalc after loading (NO: obsolete!).
//

SocialCalc.ConvertSaveToOtherFormat = function(savestr, outputformat, dorecalc) {

   var sheet, context, clipextents, div, ele, row, col, cr, cell, str;

   var result = "";

   if (outputformat == "scsave") {
      return savestr;
      }

   if (savestr == "") {
      return "";
      }

   sheet = new SocialCalc.Sheet();
   sheet.ParseSheetSave(savestr);

   if (dorecalc) {
      // no longer supported as of 9/10/08
      // Recalc is now async, so can't do it this way
      throw("SocialCalc.ConvertSaveToOtherFormat: Not doing recalc.");
      }

   if (sheet.copiedfrom) {
      clipextents = SocialCalc.ParseRange(sheet.copiedfrom);
      }
   else {
      clipextents = {cr1: {row: 1, col: 1}, cr2: {row: sheet.attribs.lastrow, col: sheet.attribs.lastcol}};
      }

   if (outputformat == "html") {
      context=new SocialCalc.RenderContext(sheet);
      if (sheet.copiedfrom) {
         context.rowpanes[0] = {first: clipextents.cr1.row, last: clipextents.cr2.row};
         context.colpanes[0] = {first: clipextents.cr1.col, last: clipextents.cr2.col};
         }
      div = document.createElement("div");
      ele = context.RenderSheet(null, context.defaultHTMLlinkstyle);
      div.appendChild(ele);
      delete context;
      delete sheet;
      result = div.innerHTML;
      delete ele;
      delete div;
      return result;
      }

   for (row = clipextents.cr1.row; row <= clipextents.cr2.row; row++) {
      for (col = clipextents.cr1.col; col <= clipextents.cr2.col; col++) {
         cr = SocialCalc.crToCoord(col, row);
         cell = sheet.GetAssuredCell(cr);

         if (cell.errors) {
            str = cell.errors;
            }
         else {
            str = cell.datavalue+""; // get value as text
            }

         if (outputformat == "csv") {
            if (str.indexOf('"')!=-1) {
               str = str.replace(/"/g, '""'); // double quotes
               }
            if (/[, \n"]/.test(str)) {
               str = '"' + str + '"'; // add quotes
               }
            if (col>clipextents.cr1.col) {
               str = "," + str; // add commas
               }
            }
         else if (outputformat == "tab") {
            if (str.indexOf('\n')!=-1) { // if multiple lines
               if (str.indexOf('"')!=-1) {
                  str = str.replace(/"/g, '""'); // double quotes
                  }
               str = '"' + str + '"'; // add quotes
               }
            if (col>clipextents.cr1.col) {
               str = "\t" + str; // add tabs
               }
            }
         result += str;
         }
      result += "\n";
      }

   return result;

   }


//
// result = SocialCalc.ConvertOtherFormatToSave(inputstr, inputformat)
//
// Returns a string converted from the specified format: "scsave", "csv", "tab" (tab delimited)
//

SocialCalc.ConvertOtherFormatToSave = function(inputstr, inputformat) {

   var sheet, context, lines, i, line, value, inquote, j, ch, values, row, col, cr, maxc;

   var result = "";

   var AddCell = function() {
      col++;
      if (col>maxc) maxc = col;
      cr = SocialCalc.crToCoord(col, row);
      SocialCalc.SetConvertedCell(sheet, cr, value);
      value = "";
      }

   if (inputformat == "scsave") {
      return inputstr;
      }

   sheet = new SocialCalc.Sheet();

   lines = inputstr.split(/\r\n|\n/);

   maxc = 0;
   if (inputformat == "csv") {
      row = 0;
      inquote = false;
      for (i=0; i<lines.length; i++) {
         if (i==lines.length-1 && lines[i]=="") { // extra null line - ignore
            break;
            }
         if (inquote) { // if inquote, just continue from where left off
            value += "\n";
            }
         else { // otherwise next row
            value = "";
            row++;
            col = 0;
            }
         line = lines[i];
         for (j=0; j<line.length; j++) {
            ch = line.charAt(j);
            if (ch == '"') {
               if (inquote) {
                  if (j<line.length-1 && line.charAt(j+1) == '"') { // double quotes
                     j++; // skip the second one
                     value += '"'; // add one quote
                     }
                  else {
                     inquote = false;
                     if (j==line.length-1) { // at end of line
                        AddCell();
                        }
                     }
                  }
               else {
                  inquote = true;
                  }
               continue;
               }
            if (ch == "," && !inquote) {
               AddCell();
               }
            else {
               value += ch;
               }
            if (j==line.length-1 && !inquote) {
               AddCell();
               }
            }
         }
      if (maxc>0) {
         sheet.attribs.lastrow = row;
         sheet.attribs.lastcol = maxc;
         result = sheet.CreateSheetSave("A1:"+SocialCalc.crToCoord(maxc, row));
         }
      }

   if (inputformat == "tab") {
      row = 0;
      inquote = false;
      for (i=0; i<lines.length; i++) {
         if (i==lines.length-1 && lines[i]=="") { // extra null line - ignore
            break;
            }
         if (inquote) { // if inquote, just continue from where left off
            value += "\n";
            }
         else { // otherwise next row
            value = "";
            row++;
            col = 0;
            }
         line = lines[i];
         for (j=0; j<line.length; j++) {
            ch = line.charAt(j);
            if (ch == '"') {
               if (inquote) {
                  if (j<line.length-1) {
                     if (line.charAt(j+1) == '"') { // double quotes
                        j++; // skip the second one
                        value += '"'; // add one quote
                        }
                     else if (line.charAt(j+1) == '\t') { // end of quoted item
                        j++;
                        inquote = false;
                        AddCell();
                        }
                     }
                  else { // at end of line
                     inquote = false;
                     AddCell();
                     }
                  continue;
                  }
               if (value=="") { // quote at start of item
                  inquote = true;
                  continue;
                  }
               }
            if (ch == "\t" && !inquote) {
               AddCell();
               }
            else {
               value += ch;
               }
            if (j==line.length-1 && !inquote) {
               AddCell();
               }
            }
         }
      if (maxc>0) {
         sheet.attribs.lastrow = row;
         sheet.attribs.lastcol = maxc;
         result = sheet.CreateSheetSave("A1:"+SocialCalc.crToCoord(maxc, row));
         }
      }

   return result;

   }

//
// SocialCalc.SetConvertedCell(sheet, cr, rawvalue)
//
// Sets the cell cr with a value and type determined from rawvalue
//

SocialCalc.SetConvertedCell = function(sheet, cr, rawvalue) {

   var cell, value;

   cell = sheet.GetAssuredCell(cr);

   value = SocialCalc.DetermineValueType(rawvalue);

   if (value.type == 'n' && value.value == rawvalue) { // check that we don't need "constant" to remember original value
      cell.datatype = "v";
      cell.valuetype = "n";
      cell.datavalue = value.value;
      }
   else if (value.type.charAt(0) == 't') { // text of some sort but left unchanged
      cell.datatype = "t";
      cell.valuetype = value.type;
      cell.datavalue = value.value;
      }
   else { // special number types
      cell.datatype = "c";
      cell.valuetype = value.type;
      cell.datavalue = value.value;
      cell.formula = rawvalue;
      }

   }