// *************************************
//
// Parse class:
//
// Used by ExecuteSheetCommand to get elements of commands to execute.
// The string it works with consists of one or more lines each
// made up of one or more tokens separated by a delimiter.
//
// *************************************

// Initialize: set string to work with

SocialCalc.Parse = function(str) {

   // properties:

   this.str = str;
   this.pos = 0;
   this.delimiter = " ";
   this.lineEnd = str.indexOf("\n");
   if (this.lineEnd < 0) {
      this.lineEnd = str.length;
   }

}

// Return next token as a string

SocialCalc.Parse.prototype.NextToken = function() {
   if (this.pos < 0) return "";
   var pos2 = this.str.indexOf(this.delimiter, this.pos);
   var pos1 = this.pos;
   if (pos2 > this.lineEnd) { // don't go past end of line
      pos2 = this.lineEnd;
   }
   if (pos2 >= 0) {
      this.pos = pos2 + 1;
      return this.str.substring(pos1, pos2);
   }
   else {
      this.pos = this.lineEnd;
      return this.str.substring(pos1, this.lineEnd);
   }
}

// Return everything from current point until end of line

SocialCalc.Parse.prototype.RestOfString = function() {
   var oldpos = this.pos;
   if (this.pos < 0 || this.pos >= this.lineEnd) return "";
   this.pos = this.lineEnd;
   return this.str.substring(oldpos, this.lineEnd);
}

SocialCalc.Parse.prototype.RestOfStringNoMove = function() {
   if (this.pos < 0 || this.pos >= this.lineEnd) return "";
   return this.str.substring(this.pos, this.lineEnd);
}

// Move current point to next line

SocialCalc.Parse.prototype.NextLine = function() {
   this.pos = this.lineEnd + 1;
   this.lineEnd = this.str.indexOf("\n", this.pos);
   if (this.lineEnd < 0) {
      this.lineEnd = this.str.length;
   }
}

// Check to see if at end of string with no more to process

SocialCalc.Parse.prototype.EOF = function() {
   if (this.pos < 0 || this.pos >= this.str.length) return true;
   return false;
}
