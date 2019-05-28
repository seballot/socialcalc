// *************************************
//
// Misc. functions:
//
// *************************************

SocialCalc.rcColname = function(c) {
   if (c > 702) c = 702; // maximum number of columns - ZZ
   if (c < 1) c = 1;
   var collow = (c - 1) % 26 + 65;
   var colhigh = Math.floor((c - 1) / 26);
   if (colhigh)
      return String.fromCharCode(colhigh + 64) + String.fromCharCode(collow);
   else
      return String.fromCharCode(collow);
   }

SocialCalc.letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M",
                      "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

SocialCalc.crToCoord = function(c, r) {
   var result;
   if (c < 1) c = 1;
   if (c > 702) c = 702; // maximum number of columns - ZZ
   if (r < 1) r = 1;
   var collow = (c - 1) % 26;
   var colhigh = Math.floor((c - 1) / 26);
   if (colhigh)
      result = SocialCalc.letters[colhigh-1] + SocialCalc.letters[collow] + r;
   else
      result = SocialCalc.letters[collow] + r;
   return result;
   }

SocialCalc.coordToCol = {}; // too expensive to set in crToCoord since that is called so many times
SocialCalc.coordToRow = {};

SocialCalc.coordToCr = function(cr) {
   var c, i, ch;
   var r = SocialCalc.coordToRow[cr];
   if (r) return {row: r, col: SocialCalc.coordToCol[cr]};
   c=0;r=0;
   for (i=0; i<cr.length; i++) { // this was faster than using regexes; assumes well-formed
      ch = cr.charCodeAt(i);
      if (ch==36) ; // skip $'s
      else if (ch<=57) r = 10*r + ch-48;
      else if (ch>=97) c = 26*c + ch-96;
      else if (ch>=65) c = 26*c + ch-64;
      }
   SocialCalc.coordToCol[cr] = c;
   SocialCalc.coordToRow[cr] = r;
   return {row: r, col: c};

   }

SocialCalc.ParseRange = function(range) {
   var pos, cr, cr1, cr2;
   if (!range) range = "A1:A1"; // error return, hopefully benign
   range = range.toUpperCase();
   pos = range.indexOf(":");
   if (pos>=0) {
      cr = range.substring(0,pos);
      cr1 = SocialCalc.coordToCr(cr);
      cr1.coord = cr;
      cr = range.substring(pos+1);
      cr2 = SocialCalc.coordToCr(cr);
      cr2.coord = cr;
      }
   else {
      cr1 = SocialCalc.coordToCr(range);
      cr1.coord = range;
      cr2 = SocialCalc.coordToCr(range);
      cr2.coord = range;
      }
   return {cr1: cr1, cr2: cr2};
   }

SocialCalc.decodeFromSave = function(s) {
   if (typeof s != "string") return s;
   if (s.indexOf("\\")==-1) return s; // for performace reasons: replace nothing takes up time
   var r=s.replace(/\\c/g,":");
   r=r.replace(/\\n/g,"\n");
   return r.replace(/\\b/g,"\\");
   }

SocialCalc.decodeFromAjax = function(s) {
   if (typeof s != "string") return s;
   if (s.indexOf("\\")==-1) return s; // for performace reasons: replace nothing takes up time
   var r=s.replace(/\\c/g,":");
   r=r.replace(/\\n/g,"\n");
   r=r.replace(/\\e/g,"]]");
   return r.replace(/\\b/g,"\\");
   }

SocialCalc.encodeForSave = function(s) {
   if (typeof s != "string") return s;
   if (s.indexOf("\\")!=-1) // for performace reasons: replace nothing takes up time
      s=s.replace(/\\/g,"\\b");
   if (s.indexOf(":")!=-1)
      s=s.replace(/:/g,"\\c");
   if (s.indexOf("\n")!=-1)
      s=s.replace(/\n/g,"\\n");
   return s;
   }

//
// Returns estring where &, <, >, " are HTML escaped
//
SocialCalc.special_chars = function(string) {

   if (/[&<>"]/.test(string)) { // only do "slow" replaces if something to replace
      string = string.replace(/&/g, "&amp;");
      string = string.replace(/</g, "&lt;");
      string = string.replace(/>/g, "&gt;");
      string = string.replace(/"/g, "&quot;");
      }
   return string;

   }

SocialCalc.Lookup = function(value, list) {

   for (i=0; i<list.length; i++) {
      if (list[i] > value) {
         if (i>0) return i-1;
         else return null;
         }
      }
   return list.length-1; // if all smaller, matches last

   }