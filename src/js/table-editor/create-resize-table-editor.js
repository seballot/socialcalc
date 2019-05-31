SocialCalc.CreateTableEditor = function(editor, width, height) {

   var scc = SocialCalc.Constants;
   var AssignID = SocialCalc.AssignID;

   editor.toplevel = document.createElement("div");
   editor.toplevel.style.position = "relative";
   AssignID(editor, editor.toplevel, "toplevel");
   editor.width = width;
   editor.height = height;
   defaultTableControlThickness = 20;
   editor.griddiv = document.createElement("div");
   editor.tablewidth = Math.max(0, width - defaultTableControlThickness);
   editor.tableheight = Math.max(0, height - defaultTableControlThickness);
   editor.griddiv.style.width = editor.tablewidth+"px";
   editor.griddiv.style.height = editor.tableheight+"px";
   editor.griddiv.style.overflow = "hidden";
   editor.griddiv.style.cursor = "default";
   AssignID(editor, editor.griddiv, "griddiv");

   editor.FitToEditTable();

   editor.EditorRenderSheet();

   editor.griddiv.appendChild(editor.fullgrid);

   editor.verticaltablecontrol = new SocialCalc.TableControl(editor, true, editor.tableheight);
   editor.verticaltablecontrol.CreateTableControl();
   AssignID(editor, editor.verticaltablecontrol.main, "tablecontrolv");

   editor.horizontaltablecontrol = new SocialCalc.TableControl(editor, false, editor.tablewidth);
   editor.horizontaltablecontrol.CreateTableControl();
   AssignID(editor, editor.horizontaltablecontrol.main, "tablecontrolh");

   var table, tbody, tr, td, img, anchor, ta;

   table = document.createElement("table");
   editor.layouttable = table;
   table.cellSpacing = 0;
   table.cellPadding = 0;
   AssignID(editor, table, "layouttable");

   tbody = document.createElement("tbody");
   table.appendChild(tbody);

   tr = document.createElement("tr");
   tbody.appendChild(tr);
   td = document.createElement("td");
   td.appendChild(editor.griddiv);
   tr.appendChild(td);
   if (SocialCalc._app != true) { // no scroll bar in app
     // Add v scroll bar
     td = document.createElement("td");
     td.appendChild(editor.verticaltablecontrol.main);
     tr.appendChild(td);
   }
   tr = document.createElement("tr");
   tbody.appendChild(tr);
   if (SocialCalc._app != true) { // no scroll bar in app
     // Add h scroll bar
     td = document.createElement("td");
     td.appendChild(editor.horizontaltablecontrol.main);
     tr.appendChild(td);
   }

   td = document.createElement("td"); // logo display: Required by CPAL License for this code!
   if (SocialCalc._app) { // in app right align Required CPAL License logo
     td.style.background="url("+editor.imageprefix+"logo.gif) no-repeat right center";
   } else {
     td.style.background="url("+editor.imageprefix+"logo.gif) no-repeat center center";
   }
   td.innerHTML = "<div style='cursor:pointer;font-size:1px;'><img src='"+editor.imageprefix+"1x1.gif' border='0' width='18' height='18'></div>";
   tr.appendChild(td);
   editor.logo = td;
   AssignID(editor, editor.logo, "logo");
   td.firstChild.firstChild.title = "SocialCalc";

   editor.toplevel.appendChild(editor.layouttable);

   if (!editor.noEdit) {
      editor.inputEcho = new SocialCalc.InputEcho(editor);
      AssignID(editor, editor.inputEcho.main, "inputecho");
      }

   editor.cellhandles = new SocialCalc.CellHandles(editor);

   ta = document.createElement("textarea"); // used for ctrl-c/ctrl-v where an invisible text area is needed
   SocialCalc.setStyles(ta, "display:none;position:absolute;height:1px;width:1px;opacity:0;filter:alpha(opacity=0);");
   ta.value = "";
   editor.pasteTextarea = ta;
   AssignID(editor, editor.pasteTextarea, "pastetextarea");

   if (navigator.userAgent.match(/Safari\//) &&!navigator.userAgent.match(/Chrome\//)) { // special code for Safari 5 change
      window.removeEventListener('beforepaste', SocialCalc.SafariPasteFunction, false);
      window.addEventListener('beforepaste', SocialCalc.SafariPasteFunction, false);
      window.removeEventListener('beforecopy', SocialCalc.SafariPasteFunction, false);
      window.addEventListener('beforecopy', SocialCalc.SafariPasteFunction, false);
      window.removeEventListener('beforecut', SocialCalc.SafariPasteFunction, false);
      window.addEventListener('beforecut', SocialCalc.SafariPasteFunction, false);
      }

   editor.toplevel.appendChild(editor.pasteTextarea);

   SocialCalc.MouseWheelRegister(editor.toplevel, {WheelMove: SocialCalc.EditorProcessMouseWheel, editor: editor});

   SocialCalc.KeyboardSetFocus(editor);

   // do status reporting things

   SocialCalc.EditorSheetStatusCallback(null, "startup", null, editor);

   // done

   return editor.toplevel;

   }


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