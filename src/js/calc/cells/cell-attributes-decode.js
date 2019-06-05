//
// cmdstr = SocialCalc.DecodeCellAttributes(sheet, coord, attribs, range)
//
// Takes cell attributes in an object, each in the following form:
//
//    attribname: {def: true/false, val: full-value}
//
// and returns the sheet commands to make the actual attributes correspond.
// Returns a non-null string if any commands are to be executed, null otherwise.
//
// If range is provided, the commands are executed on the whole range.
//

SocialCalc.DecodeCellAttributes = function(sheet, coord, newattribs, range) {

   var value, b, bb;

   var cell = sheet.GetAssuredCell(coord);

   var changed = false;

   var CheckChanges = function(attribname, oldval, cmdname) {
      var val;
      if (newattribs[attribname]) {
         if (newattribs[attribname].def) {
            val = "";
         }
         else {
            val = newattribs[attribname].val;
         }
         if (val != (oldval || "")) {
            DoCmd(cmdname+" "+val);
         }
      }
   }

   var cmdstr = "";

   var DoCmd = function(str) {
      if (cmdstr) cmdstr += "\n";
      cmdstr += "set "+(range || coord)+" "+str;
      changed = true;
   }

   // cellformat: alignhoriz

   CheckChanges("alignhoriz", sheet.cellformats[cell.cellformat], "cellformat");

   // layout: alignvert, padtop, padright, padbottom, padleft

   if (!newattribs.alignvert.def || !newattribs.padtop.def || !newattribs.padright.def ||
       !newattribs.padbottom.def || !newattribs.padleft.def) {
      value = "padding:" +
         (newattribs.padtop.def ? "* " : newattribs.padtop.val + " ") +
         (newattribs.padright.def ? "* " : newattribs.padright.val + " ") +
         (newattribs.padbottom.def ? "* " : newattribs.padbottom.val + " ") +
         (newattribs.padleft.def ? "*" : newattribs.padleft.val) +
         ";vertical-align:" +
         (newattribs.alignvert.def ? "*;" : newattribs.alignvert.val+";");
   }
   else {
      value = "";
   }

   if (value != (sheet.layouts[cell.layout] || "")) {
      DoCmd("layout "+value);
   }

   // font: fontfamily, fontlook, fontsize

   if (!newattribs.fontlook.def || !newattribs.fontsize.def || !newattribs.fontfamily.def) {
      value =
         (newattribs.fontlook.def ? "* " : newattribs.fontlook.val + " ") +
         (newattribs.fontsize.def ? "* " : newattribs.fontsize.val + " ") +
         (newattribs.fontfamily.def ? "*" : newattribs.fontfamily.val);
   }
   else {
      value = "";
   }

   if (value != (sheet.fonts[cell.font] || "")) {
      DoCmd("font "+value);
   }

   // color: textcolor

   CheckChanges("textcolor", sheet.colors[cell.color], "color");

   // bgcolor: bgcolor

   CheckChanges("bgcolor", sheet.colors[cell.bgcolor], "bgcolor");

   // formatting: numberformat, textformat

   CheckChanges("numberformat", sheet.valueformats[cell.nontextvalueformat], "nontextvalueformat");

   CheckChanges("textformat", sheet.valueformats[cell.textvalueformat], "textvalueformat");

   // merges: colspan, rowspan - NOT HANDLED: IGNORED!

   // borders: bX for X = t, r, b, and l; bXthickness, bXstyle, bXcolor ignored

   for (i=0; i<4; i++) {
      b = "trbl".charAt(i);
      bb = "b"+b;
      CheckChanges(bb, sheet.borderstyles[cell[bb]], bb);
   }

   // misc: cssc, csss, mod

   CheckChanges("cssc", cell.cssc, "cssc");

   CheckChanges("csss", cell.csss, "csss");

   if (newattribs.mod) {
      if (newattribs.mod.def) {
         value = "n";
      }
      else {
         value = newattribs.mod.val;
      }
      if (value != (cell.mod || "n")) {
         if (value=="n") value = ""; // restrict to "y" and "" normally
         DoCmd("mod "+value);
      }
   }

   // if any changes return command(s)

   if (changed) {
       return cmdstr;
   }
   else {
      return null;
   }

}
