//
// changed = SocialCalc.DecodeSheetAttributes(sheet, newattribs)
//
// Takes sheet attributes in an object, each in the following form:
//
//    attribname: {def: true/false, val: full-value}
//
// and returns the sheet commands to make the actual attributes correspond.
// Returns a non-null string if any commands were executed, null otherwise.
//

SocialCalc.DecodeSheetAttributes = function(sheet, newattribs) {

   var value;
   var attribs = sheet.attribs;
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
      cmdstr += "set sheet "+str;
      changed = true;
   }

   // sizes: colwidth, rowheight

   CheckChanges("colwidth", attribs.defaultcolwidth, "defaultcolwidth");

   CheckChanges("rowheight", attribs.defaultrowheight, "defaultrowheight");

   // cellformat: textalignhoriz, numberalignhoriz

   CheckChanges("textalignhoriz", sheet.cellformats[attribs.defaulttextformat], "defaulttextformat");

   CheckChanges("numberalignhoriz", sheet.cellformats[attribs.defaultnontextformat], "defaultnontextformat");

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

   if (value != (sheet.layouts[attribs.defaultlayout] || "")) {
      DoCmd("defaultlayout "+value);
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

   if (value != (sheet.fonts[attribs.defaultfont] || "")) {
      DoCmd("defaultfont "+value);
   }

   // color: textcolor

   CheckChanges("textcolor", sheet.colors[attribs.defaultcolor], "defaultcolor");

   // bgcolor: bgcolor

   CheckChanges("bgcolor", sheet.colors[attribs.defaultbgcolor], "defaultbgcolor");

   // formatting: numberformat, textformat

   CheckChanges("numberformat", sheet.valueformats[attribs.defaultnontextvalueformat], "defaultnontextvalueformat");

   CheckChanges("textformat", sheet.valueformats[attribs.defaulttextvalueformat], "defaulttextvalueformat");

   // recalc: recalc

   CheckChanges("recalc", sheet.attribs.recalc, "recalc");

   // usermaxcol, usermaxrow

   CheckChanges("usermaxcol", sheet.attribs.usermaxcol, "usermaxcol");
   CheckChanges("usermaxrow", sheet.attribs.usermaxrow, "usermaxrow");

   // if any changes return command(s)

   if (changed) {
       return cmdstr;
   }
   else {
      return null;
   }

}