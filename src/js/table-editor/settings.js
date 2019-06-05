//
// str = SaveEditorSettings(editor)
//
// Returns a string representation of the pane settings, etc.
//
// The format is:
//
//    version:1.0
//    rowpane:panenumber:firstnum:lastnum
//    colpane:panenumber:firstnum:lastnum
//    ecell:coord -- if set
//    range:anchorcoord:top:bottom:left:right -- if set
//
// You can add additional values to be saved by using editor.SettingsCallbacks:
//
//   editor.SettingsCallbacks["item-name"] = {save: savefunction, load: loadfunction}
//
// where savefunction(editor, "item-name") returns a string with the new lines to be added to the saved settings
// which include the trailing newlines, and loadfunction(editor, "item-name", line, flags) is given the line to process
// without the trailing newlines.
//

SocialCalc.SaveEditorSettings = function(editor) {

   var i, setting;
   var context = editor.context;
   var range = editor.range;
   var result = "";

   result += "version:1.0\n";

   for (i=0; i<context.rowpanes.length; i++) {
      result += "rowpane:"+i+":"+context.rowpanes[i].first+":"+context.rowpanes[i].last+"\n";
   }
   for (i=0; i<context.colpanes.length; i++) {
      result += "colpane:"+i+":"+context.colpanes[i].first+":"+context.colpanes[i].last+"\n";
   }

   if (editor.ecell) {
      result += "ecell:"+editor.ecell.coord+"\n";
   }

   if (range.hasrange) {
      result += "range:"+range.anchorcoord+":"+range.top+":"+range.bottom+":"+range.left+":"+range.right+"\n";
   }

   for (setting in editor.SettingsCallbacks) {
      result += editor.SettingsCallbacks[setting].save(editor, setting);
   }

   return result;

}

//
// LoadEditorSettings(editor, str, flags)
//
// Sets the editor settings based on str. See SocialCalc.SaveEditorSettings for more details.
// Unrecognized lines are ignored.
//

SocialCalc.LoadEditorSettings = function(editor, str, flags) {

   var lines=str.split(/\r\n|\n/);
   var parts=[];
   var line, i, cr, row, col, coord, setting;
   var context = editor.context;
   var highlights, range;

   context.rowpanes = [{first: 1, last: 1}]; // reset to start
   context.colpanes = [{first: 1, last: 1}];
   editor.ecell = null;
   editor.range = {hasrange: false};
   editor.range2 = {hasrange: false};
   range = editor.range;
   context.highlights = {};
   highlights = context.highlights;

   for (i=0; i<lines.length; i++) {
      line=lines[i];
      parts = line.split(":");
      setting = parts[0];
      switch (setting) {
         case "version":
            break;

         case "rowpane":
            context.rowpanes[parts[1]-0] = {first: parts[2]-0, last: parts[3]-0};
            break;

         case "colpane":
            context.colpanes[parts[1]-0] = {first: parts[2]-0, last: parts[3]-0};
            break;

         case "ecell":
            editor.ecell = SocialCalc.coordToCr(parts[1]);
            editor.ecell.coord = parts[1];
            highlights[parts[1]] = "cursor";
            break;

         case "range":
            range.hasrange = true;
            range.anchorcoord = parts[1];
            cr = SocialCalc.coordToCr(range.anchorcoord);
            range.anchorrow = cr.row;
            range.anchorcol = cr.col;
            range.top = parts[2]-0;
            range.bottom = parts[3]-0;
            range.left = parts[4]-0;
            range.right = parts[5]-0;
            for (row=range.top; row<=range.bottom; row++) {
               for (col=range.left; col<=range.right; col++) {
                  coord = SocialCalc.crToCoord(col, row);
                  if (highlights[coord]!="cursor") {
                     highlights[coord] = "range";
                  }
               }
            }
            break;

         default:
            if (editor.SettingsCallbacks[setting]) {
               editor.SettingsCallbacks[setting].load(editor, setting, line, flags);
            }
            break;
      }
   }

   return;

}