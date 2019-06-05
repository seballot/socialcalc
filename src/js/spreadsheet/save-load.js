///////////////////////
//
// SAVE / LOAD ROUTINES
//
///////////////////////

//
// result = SocialCalc.SpreadsheetControlCreateSpreadsheetSave(spreadsheet, otherparts)
//
// Saves the spreadsheet's sheet data, editor settings, and audit trail (redo stack).
// The serialized data strings are concatenated together in multi-part MIME format.
// The first part lists the types of the subsequent parts (e.g., "sheet", "editor", and "audit")
// in this format:
//   # comments
//   version:1.0
//   part:type1
//   part:type2
//   ...
//
// If otherparts is non-null, it is an object with:
//   partname1: "part contents - should end with \n",
//   partname2: "part contents - should end with \n"
//


SocialCalc.SpreadsheetControlCreateSpreadsheetSave = function(spreadsheet, otherparts) {

   var result;

   var otherpartsstr = "";
   var otherpartsnames = "";
   var partname, extranl;

   if (otherparts) {
      for (partname in otherparts) {
         if (otherparts[partname].charAt(otherparts[partname]-1) != "\n") {
            extranl = "\n";
         }
         else {
            extranl = "";
         }
         otherpartsstr += "--" + spreadsheet.multipartBoundary + "\nContent-type: text/plain; charset=UTF-8\n\n" +
            otherparts[partname] + extranl;
         otherpartsnames += "part:"+partname + "\n";
      }
   }

   result = "socialcalc:version:1.0\n" +
      "MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary="+
      spreadsheet.multipartBoundary + "\n" +
      "--" + spreadsheet.multipartBoundary + "\nContent-type: text/plain; charset=UTF-8\n\n" +
      "# SocialCalc Spreadsheet Control Save\nversion:1.0\npart:sheet\npart:edit\npart:audit\n" + otherpartsnames +
      "--" + spreadsheet.multipartBoundary + "\nContent-type: text/plain; charset=UTF-8\n\n" +
      spreadsheet.CreateSheetSave() +
      "--" + spreadsheet.multipartBoundary + "\nContent-type: text/plain; charset=UTF-8\n\n" +
      spreadsheet.editor.SaveEditorSettings() +
      "--" + spreadsheet.multipartBoundary + "\nContent-type: text/plain; charset=UTF-8\n\n" +
      spreadsheet.sheet.CreateAuditString() +
      otherpartsstr +
      "--" + spreadsheet.multipartBoundary + "--\n";

   return result;

}


//
// parts = SocialCalc.SpreadsheetControlDecodeSpreadsheetSave(spreadsheet, str)
//
// Separates the parts from a spreadsheet save string, returning an object with the sub-strings.
//
//    {type1: {start: startpos, end: endpos}, type2:...}
//

SocialCalc.SpreadsheetControlDecodeSpreadsheetSave = function(spreadsheet, str) {

   var pos1, mpregex, searchinfo, boundary, boundaryregex, blanklineregex, start, ending, lines, i, lines, p, pnun;
   var parts = {};
   var partlist = [];

   pos1 = str.search(/^MIME-Version:\s1\.0/mi);
   if (pos1 < 0) return parts;

   mpregex = /^Content-Type:\s*multipart\/mixed;\s*boundary=(\S+)/mig;
   mpregex.lastIndex = pos1;

   searchinfo = mpregex.exec(str);
   if (mpregex.lastIndex <= 0) return parts;
   boundary = searchinfo[1];

   boundaryregex = new RegExp("^--"+boundary+"(?:\r\n|\n)", "mg");
   boundaryregex.lastIndex = mpregex.lastIndex;

   searchinfo = boundaryregex.exec(str); // find header top boundary
   blanklineregex = /(?:\r\n|\n)(?:\r\n|\n)/gm;
   blanklineregex.lastIndex = boundaryregex.lastIndex;
   searchinfo = blanklineregex.exec(str); // skip to after blank line
   if (!searchinfo) return parts;
   start = blanklineregex.lastIndex;
   boundaryregex.lastIndex = start;
   searchinfo = boundaryregex.exec(str); // find end of header
   if (!searchinfo) return parts;
   ending = searchinfo.index;

   lines = str.substring(start, ending).split(/\r\n|\n/); // get header as lines
   for (i=0;i<lines.length;i++) {
      line=lines[i];
      p = line.split(":");
      switch (p[0]) {
         case "version":
            break;
         case "part":
            partlist.push(p[1]);
            break;
      }
   }

   for (pnum=0; pnum<partlist.length; pnum++) { // get each part
      blanklineregex.lastIndex = ending;
      searchinfo = blanklineregex.exec(str); // find blank line ending mime-part header
      if (!searchinfo) return parts;
      start = blanklineregex.lastIndex;
      if (pnum==partlist.length-1) { // last one has different boundary
         boundaryregex = new RegExp("^--"+boundary+"--$", "mg");
      }
      boundaryregex.lastIndex = start;
      searchinfo = boundaryregex.exec(str); // find ending boundary
      if (!searchinfo) return parts;
      ending = searchinfo.index;
      parts[partlist[pnum]] = {start: start, end: ending}; // return position within full string
   }

   return parts;

}