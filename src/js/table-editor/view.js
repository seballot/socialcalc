//
// EditorRenderSheet(editor)
//
// Renders the sheet and updates editor.fullgrid.
// Sets event handlers.
//

SocialCalc.EditorRenderSheet = function(editor) {

   editor.EditorMouseUnregister();

   var sheetobj = editor.context.sheetobj;
   // App widgets need to keep focus -  only render widgets if needed
   if(sheetobj.reRenderCellList != null && SocialCalc._app && sheetobj.widgetsClean === true) {
     // re-render each individual cells - but not widget with focus
     for(var index in sheetobj.reRenderCellList) {
       var coord = sheetobj.reRenderCellList[index];
       var valuetype = sheetobj.cells[coord].valuetype;
       if(valuetype.charAt(1) != "i" || valuetype !=  sheetobj.cells[coord].prevvaluetype) { // skip widgets - but paint when added/replaced
         cr = SocialCalc.coordToCr(coord);
         cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
         if(cell!=null) editor.ReplaceCell(cell, cr.row, cr.col);
       }
     }
     sheetobj.reRenderCellList = [];
   } else {
      editor.fullgrid = editor.context.RenderSheet(editor.fullgrid);
      if (sheetobj.reRenderCellList != null && SocialCalc._app) {
        sheetobj.widgetsClean = true; // widgets have been rendered
        sheetobj.reRenderCellList = [];
      }
   }

   if (editor.ecell) editor.SetECellHeaders("selected");

   SocialCalc.AssignID(editor, editor.fullgrid, "fullgrid"); // give it an id
   // eddy EditorRenderSheet {
   if(!SocialCalc._app) editor.fullgrid.className = "te_download";
   editor.EditorMouseRegister();
   // } EditorRenderSheet

   }