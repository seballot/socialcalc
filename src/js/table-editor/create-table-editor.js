SocialCalc.CreateTableEditor = function(editor) {

   var scc = SocialCalc.Constants;
   var AssignID = SocialCalc.AssignID;

   editor.toplevel = document.getElementById("te_toplevel")
   editor.griddiv = document.getElementById("te_griddiv")

   // editor.toplevel = document.createElement("div");
   // editor.toplevel.style.position = "relative";
   // AssignID(editor, editor.toplevel, "toplevel");
   // editor.width = width;
   // editor.height = height;
   // defaultTableControlThickness = 20;
   // editor.griddiv = document.createElement("div");
   // editor.tablewidth = Math.max(0, width - defaultTableControlThickness);
   // editor.tableheight = Math.max(0, height - defaultTableControlThickness);
   // editor.griddiv.style.width = editor.tablewidth+"px";
   // editor.griddiv.style.height = editor.tableheight+"px";
   // editor.griddiv.style.overflow = "hidden";
   // editor.griddiv.style.cursor = "default";
   // AssignID(editor, editor.griddiv, "griddiv");
   editor.FitToEditTable();
   editor.EditorRenderSheet();

   editor.griddiv.appendChild(editor.fullgrid);





   editor.verticaltablecontrol = new SocialCalc.TableControl(editor, true, editor.tableheight);
   editor.verticaltablecontrol.CreateTableControl();
   AssignID(editor, editor.verticaltablecontrol.main, "tablecontrolv");

   editor.horizontaltablecontrol = new SocialCalc.TableControl(editor, false, editor.tablewidth);
   editor.horizontaltablecontrol.CreateTableControl();
   AssignID(editor, editor.horizontaltablecontrol.main, "tablecontrolh");

   if (SocialCalc._app != true) { // no scroll bar in app
     // Add v scroll bar

   }

   if (SocialCalc._app != true) { // no scroll bar in app
     // Add h scroll bar

   }

   if (!editor.noEdit) {
      editor.inputEcho = new SocialCalc.InputEcho(editor);
      AssignID(editor, editor.inputEcho.main, "inputecho");
      }

   editor.cellhandles = new SocialCalc.CellHandles(editor);

   editor.pasteTextarea = document.getElementById("te_pastetextarea");

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


