//
// EditorScheduleSheetCommands(editor, cmdstr, saveundo, ignorebusy)
//

SocialCalc.EditorScheduleSheetCommands = function(editor, cmdstr, saveundo, ignorebusy) {
   console.log("schedule command", cmdstr);
   if (editor.state!="start" && !ignorebusy) { // ignore commands if editing a cell
      return;
      }

   if (editor.busy && !ignorebusy) { // hold off on commands if doing one
      editor.deferredCommands.push({cmdstr: cmdstr, saveundo: saveundo});
      return;
      }

   var cmdTokens = cmdstr.split(" ");

   switch (cmdTokens[0]) {
      case "recalc":
      case "redisplay":
         editor.context.sheetobj.ScheduleSheetCommands(cmdstr, false);
         break;

      case "undo":
         if(SocialCalc._app ) editor.context.sheetobj.widgetsClean = false;     // force app widgets to render
         editor.SheetUndo();
         break;

      case "redo":
         if(SocialCalc._app ) editor.context.sheetobj.widgetsClean = false;     // force app widgets to render
         editor.SheetRedo();
         break;

      case "setemailparameters":
      SocialCalc.TriggerIoAction.Email(cmdTokens[1], cmdTokens[2]);
        break;


      default:
         editor.context.sheetobj.ScheduleSheetCommands(cmdstr, saveundo);
         break;
      }
   }

//
// SocialCalc.EditorApplySetCommandsToRange(editor, cmd)
//
// Takes ecell or range and does a "set" command with cmd.
//

SocialCalc.EditorApplySetCommandsToRange = function(editor, cmd) {

   var cell, row, col, line, errortext;

   var sheetobj = editor.context.sheetobj;
   var ecell = editor.ecell;
   var range = editor.range;

   if (range.hasrange) {
      coord = SocialCalc.crToCoord(range.left, range.top)+":"+SocialCalc.crToCoord(range.right, range.bottom);
      line = "set "+coord+" "+cmd;
      errortext = editor.EditorScheduleSheetCommands(line, true, false);
      }
   else {
      line = "set "+ecell.coord+" "+cmd;
      errortext = editor.EditorScheduleSheetCommands(line, true, false);
      }

   editor.DisplayCellContents();

   }