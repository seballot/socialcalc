SocialCalc.CreateTableEditor = function(editor) {

   var scc = SocialCalc.Constants;
   var AssignID = SocialCalc.AssignID;

   editor.toplevel = editor.$appContainer.find("#te_toplevel")[0]
   editor.griddiv = editor.$appContainer.find("#te_griddiv")[0]

   editor.ResizeTableEditor();

   window.onresize = function(event) {
      editor.ResizeTableEditor();
   };

   editor.griddiv.appendChild(editor.fullgrid);

   editor.verticaltablecontrol = new SocialCalc.TableControl(editor, true, editor.tableheight);
   editor.verticaltablecontrol.CreateTableControl();
   AssignID(editor, editor.verticaltablecontrol.main, "tablecontrolv");

   editor.horizontaltablecontrol = new SocialCalc.TableControl(editor, false, editor.tablewidth);
   editor.horizontaltablecontrol.CreateTableControl();
   AssignID(editor, editor.horizontaltablecontrol.main, "tablecontrolh");

   if (SocialCalc._app == true) { // no scroll bar in app
     editor.verticaltablecontrol.main.style.display = "none"
     editor.horizontaltablecontrol.main.style.display = "none"
   }

   if (!editor.noEdit) {
      editor.inputEcho = new SocialCalc.InputEcho(editor);
      AssignID(editor, editor.inputEcho.main, "inputecho");
   }

   editor.cellhandles = new SocialCalc.CellHandles(editor);

   editor.pasteTextarea = editor.$appContainer.find("#te_pastetextarea")[0];

   if (navigator.userAgent.match(/Safari\//) &&!navigator.userAgent.match(/Chrome\//)) { // special code for Safari 5 change
      window.removeEventListener('beforepaste', SocialCalc.SafariPasteFunction, false);
      window.addEventListener('beforepaste', SocialCalc.SafariPasteFunction, false);
      window.removeEventListener('beforecopy', SocialCalc.SafariPasteFunction, false);
      window.addEventListener('beforecopy', SocialCalc.SafariPasteFunction, false);
      window.removeEventListener('beforecut', SocialCalc.SafariPasteFunction, false);
      window.addEventListener('beforecut', SocialCalc.SafariPasteFunction, false);
   }

   SocialCalc.MouseWheelRegister(editor.toplevel, {WheelMove: SocialCalc.EditorProcessMouseWheel, editor: editor});

   SocialCalc.KeyboardSetFocus(editor);

   SocialCalc.EditorSheetStatusCallback(null, "startup", null, editor);

   return editor.toplevel;

}

//
// SocialCalc.ResizeTableEditor(editor, width, height)
//
// Move things around as appropriate and resize
//
SocialCalc.ResizeTableEditor = function(editor, width, height) {

   if (!width) width = editor.griddiv.offsetWidth;
   if (!height) height = editor.griddiv.offsetHeight;
   editor.tableheight = height;
   editor.tablewidth = width;

   if (editor.verticaltablecontrol) {
      editor.verticaltablecontrol.PositionTableControlElements();
      editor.horizontaltablecontrol.PositionTableControlElements();
   }

   editor.FitToEditTable();
   editor.EditorRenderSheet();

   return;
}


