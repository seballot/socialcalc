SocialCalc.SheetUndo = function(sheet) {

   var i;
   var tos = sheet.changes.TOS();
   var lastone = tos ? tos.undo.length-1 : -1;
   var cmdstr = "";

   for (i=lastone; i>=0; i--) { // do them backwards
      if (cmdstr) cmdstr += "\n"; // concatenate with separate lines
      cmdstr += tos.undo[i];
   }
   sheet.changes.Undo();
   sheet.ScheduleSheetCommands(cmdstr, false); // do undo operations

}

SocialCalc.SheetRedo = function(sheet) {

   var tos, i;
   var didredo = sheet.changes.Redo();
   if (!didredo) {
      sheet.ScheduleSheetCommands("", false); // schedule doing nothing
      return;
   }
   tos = sheet.changes.TOS();
   var cmdstr = "";

   for (i=0; tos && i<tos.command.length; i++) {
      if (cmdstr) cmdstr += "\n"; // concatenate with separate lines
      cmdstr += tos.command[i];
   }
   sheet.ScheduleSheetCommands(cmdstr, false); // do undo operations

}

SocialCalc.CreateAuditString = function(sheet) {

   var i, j;
   var result = "";
   var stack = sheet.changes.stack;
   var tos = sheet.changes.tos;
   for (i=0; i<=tos; i++) {
      for (j=0; j<stack[i].command.length; j++) {
         result += stack[i].command[j] + "\n";
      }
   }

   return result;

}

// *************************************
//
// UndoStack class:
//
// Implements the behavior needed for a normal application's undo/redo stack.
// You add a new change sequence with PushChange.
// The type argument is a string that can be used to lookup some general string
// like "typing" or "setting attribute" for the menu prompts for undo/redo.
//
// You add the "do" steps with AddDo. The non-null, non-undefined arguments are
// joined together with " " to make a command string to be saved.
//
// You add the undo steps as commands for the most recent change with AddUndo.
// The non-null, non-undefined arguments are joined together with " " to make
// a command string to be saved.
//
// The Undo and Redo functions move the Top Of Stack pointer through the changes stack
// so you can undo and redo. Doing a new PushChange removes all undone items
// after TOS.
//
// You can push more things than you can undo if you want.
// There is a maximum to remember as the "did" stack for an audit trail (and as redo). This may be unlimited.
// There is a separate maximum to remember that can be undone. This may be smaller than maxRedo.
//
// *************************************

SocialCalc.UndoStack = function() {

   // properties:

   this.stack = []; // {command: [], type: type, undo: []} -- multiple dos and undos allowed
   this.tos = -1; // top of stack position, used for undo/redo
   this.maxRedo = 0; // Maximum size of redo stack (and audit trail which is this.stack[n].command) or zero if no limit
   this.maxUndo = 50; // Maximum number of steps kept for undo (usually the memory intensive part) or zero if no limit

}

SocialCalc.UndoStack.prototype.PushChange = function(type) { // adding a new thing to the stack
   while (this.stack.length > 0 && this.stack.length-1 > this.tos) { // pop off things not redone
      this.stack.pop();
   }
   this.stack.push({command: [], type: type, undo: []});
   if (this.maxRedo && this.stack.length > this.maxRedo) { // limit number kept as audit trail
      this.stack.shift(); // remove the extra one
   }
   if (this.maxUndo && this.stack.length > this.maxUndo) { // need to trim excess undo info
      this.stack[this.stack.length - this.maxUndo - 1].undo = []; // only need to remove one
   }
   this.tos = this.stack.length - 1;
}

SocialCalc.UndoStack.prototype.AddDo = function() {
   if (!this.stack[this.stack.length-1]) { return; }
   var args = [];
   for (var i=0; i<arguments.length; i++) {
      if (arguments[i]!=null) args.push(arguments[i]); // ignore null or undefined
   }
   var cmd = args.join(" ");
   this.stack[this.stack.length-1].command.push(cmd);
}

SocialCalc.UndoStack.prototype.AddUndo = function() {
   if (!this.stack[this.stack.length-1]) { return; }
   var args = [];
   for (var i=0; i<arguments.length; i++) {
      if (arguments[i]!=null) args.push(arguments[i]); // ignore null or undefined
   }
   var cmd = args.join(" ");
   this.stack[this.stack.length-1].undo.push(cmd);
}

SocialCalc.UndoStack.prototype.TOS = function() {
   if (this.tos >= 0) return this.stack[this.tos];
   else return null;
}

SocialCalc.UndoStack.prototype.Undo = function() {
   if (this.tos >= 0 && (!this.maxUndo || this.tos > this.stack.length - this.maxUndo - 1)) {
      this.tos -= 1;
      return true;
   }
   else {
      return false;
   }
}

SocialCalc.UndoStack.prototype.Redo = function() {
   if (this.tos < this.stack.length-1) {
      this.tos += 1;
      return true;
   }
   else {
      return false;
   }
}