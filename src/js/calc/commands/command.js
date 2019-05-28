// *************************************
//
// Sheet command routines
//
// *************************************

//
// SocialCalc.SheetCommandInfo - object with information used during command execution
//

SocialCalc.SheetCommandInfo = function(sheetobj) {

   this.sheetobj = sheetobj; // sheet being operated on
   this.timerobj = null; // used for timeslicing
   this.firsttimerdelay = 50; // wait before starting cmds (for Chrome - to give time to update)
   this.timerdelay = 1; // wait between slices
   this.maxtimeslice = 100; // do another slice after this many milliseconds
   this.saveundo = false; // arg for ExecuteSheetCommand

   this.CmdExtensionCallbacks = {}; // for startcmdextension, in form: cmdname, {func:function(cmdname, data, sheet, SocialCalc.Parse object, saveundo), data:whatever}
   };

SocialCalc.SheetCommandsTimerRoutine = function(sci, parseobj, saveundo) {

   var errortext;
   var starttime = new Date();
   sci.timerobj = null;

   while (!parseobj.EOF()) { // go through all commands (separated by newlines)
      try {
        errortext = SocialCalc.ExecuteSheetCommand(sci.sheetobj, parseobj, saveundo);
      } catch (err) {
        errortext = err.message
      }

      // Error - Use  log on server   OR  alert on client
      if (errortext) {
        if (typeof(alert) == "function")  {
          alert(errortext);
        } else {
          console.log(errortext)
        }
      }

      parseobj.NextLine();

      if (((new Date()) - starttime) >= sci.maxtimeslice) { // if taking too long, give up CPU for a while
         sci.timerobj = window.setTimeout(function() {
            SocialCalc.SheetCommandsTimerRoutine(sci, parseobj, saveundo);
         }, sci.timerdelay);
         return;
         }
      }

   if (sci.sheetobj.statuscallback) { // notify others if requested
      sci.sheetobj.statuscallback(sci, "cmdend", "", sci.sheetobj.statuscallbackparams);
      }

   }