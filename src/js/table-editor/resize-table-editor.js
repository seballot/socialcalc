//
// SocialCalc.ResizeTableEditor(editor, width, height)
//
// Move things around as appropriate and resize
//

SocialCalc.ResizeTableEditor = function(editor, width, height) {

   var scc = SocialCalc.Constants;

   editor.width = width;
   editor.height = height;

   editor.toplevel.style.width = width+"px";
   editor.toplevel.style.height = height+"px";

   if (SocialCalc._app) {
     editor.tablewidth = Math.max(0, width ); // no v scroll bar with app
} else {
     editor.tablewidth = Math.max(0, width - defaultTableControlThickness);
}
   editor.tableheight = Math.max(0, height - defaultTableControlThickness);
   editor.griddiv.style.width=editor.tablewidth+"px";
   editor.griddiv.style.height=editor.tableheight+"px";

   editor.verticaltablecontrol.main.style.height = editor.tableheight + "px";
   editor.horizontaltablecontrol.main.style.width = editor.tablewidth + "px";

   editor.FitToEditTable();

   editor.ScheduleRender();

   return;

}