SocialCalc.ProcessEditorRowselectMouseDown = function(e, ele, result) {
    var event = e || window.event;
    var mouseinfo = SocialCalc.EditorMouseInfo;
    var editor = mouseinfo.editor;
    var sheet = SocialCalc.GetSpreadsheetControlObject().sheet;
    coord1 = SocialCalc.crToCoord(1, result.row)
    coord2 = SocialCalc.crToCoord(sheet.attribs.lastcol, result.row)
    coord3 = SocialCalc.crToCoord(editor.firstscrollingcol, result.row)
    editor.RangeAnchor(coord1);
    editor.RangeExtend(coord2);
    editor.MoveECell(coord3);
    SocialCalc.SetMouseMoveUp(SocialCalc.ProcessEditorRowselectMouseMove,
            SocialCalc.ProcessEditorRowselectMouseUp,
            editor.toplevel,
            event);
}

SocialCalc.ProcessEditorRowselectMouseMove = function(e) {
    var event = e || window.event;
    var mouseinfo = SocialCalc.EditorMouseInfo;
    var editor = mouseinfo.editor;
    var sheet = SocialCalc.GetSpreadsheetControlObject().sheet;

    if (!editor) return; // not us, ignore

    var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
    var clientX = event.clientX - pos.left;
    var clientY = event.clientY - pos.top;
    result = SocialCalc.GridMousePosition(editor, clientX, clientY);
    coord2 = SocialCalc.crToCoord(sheet.attribs.lastcol, result.row)
    coord3 = SocialCalc.crToCoord(editor.firstscrollingcol,result.row)
    editor.RangeExtend(coord2);
    editor.MoveECell(coord3);
    return;
}

SocialCalc.ProcessEditorRowselectMouseUp = function(e) {
    var event = e || window.event;
    var mouseinfo = SocialCalc.EditorMouseInfo;
    var editor = mouseinfo.editor;
    if (!editor) return; // not us, ignore
    SocialCalc.RemoveMouseMoveUp(SocialCalc.ProcessEditorRowselectMouseMove,
         SocialCalc.ProcessEditorRowselectMouseUp,
         editor.toplevel,
         e);
    return;
}

SocialCalc.ProcessEditorColselectMouseDown = function(e, ele, result) {
    var event = e || window.event;
    var mouseinfo = SocialCalc.EditorMouseInfo;
    var editor = mouseinfo.editor;
    var sheet = SocialCalc.GetSpreadsheetControlObject().sheet;

    coord1 = SocialCalc.crToCoord(result.col, 1)
    coord2 = SocialCalc.crToCoord(result.col, sheet.attribs.lastrow)
    coord3 = SocialCalc.crToCoord(result.col, editor.firstscrollingrow)
    editor.RangeAnchor(coord1);
    editor.RangeExtend(coord2);
    editor.MoveECell(coord3);
    SocialCalc.SetMouseMoveUp(SocialCalc.ProcessEditorColselectMouseMove,
            SocialCalc.ProcessEditorColselectMouseUp,
            editor.toplevel,
            event);

}

SocialCalc.ProcessEditorColselectMouseMove = function(e) {
    var event = e || window.event;
    var mouseinfo = SocialCalc.EditorMouseInfo;
    var editor = mouseinfo.editor;
    var sheet = SocialCalc.GetSpreadsheetControlObject().sheet;

    if (!editor) return; // not us, ignore

    var pos = SocialCalc.GetElementPositionWithScroll(editor.toplevel);
    var clientX = event.clientX - pos.left;
    var clientY = event.clientY - pos.top;
    result = SocialCalc.GridMousePosition(editor, clientX, clientY);
    coord2 = SocialCalc.crToCoord(result.col, sheet.attribs.lastrow)
    coord3 = SocialCalc.crToCoord(result.col, editor.firstscrollingrow)
    editor.RangeExtend(coord2);
    editor.MoveECell(coord3);
    return;
}

SocialCalc.ProcessEditorColselectMouseUp = function(e) {
    var event = e || window.event;
    var mouseinfo = SocialCalc.EditorMouseInfo;
    var editor = mouseinfo.editor;
    if (!editor) return; // not us, ignore
    SocialCalc.RemoveMouseMoveUp(SocialCalc.ProcessEditorColselectMouseMove,
         SocialCalc.ProcessEditorColselectMouseUp,
         editor.toplevel,
         e);
    return;
}