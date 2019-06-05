SocialCalc.SpreadsheetControl.FindInSheet = function() {
    var searchstatus = $("#searchstatus");
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    if (!this.value.length) {
        searchstatus.text("");
        spreadsheet.sheet.search_cells = [];
        spreadsheet.sheet.selected_search_cell = undefined;
        return;
 }
    var cells = spreadsheet.sheet.cells;
    var regex = new RegExp(this.value, 'im');
    var cell, cellvalue;
    var search_cells = [];
    for (var cell_id in cells) {
        cell = cells[cell_id];
        var cr = SocialCalc.coordToCr(cell_id);
        if (spreadsheet.sheet.rowattribs.hide[cr.row] === 'yes' || spreadsheet.sheet.colattribs.hide[SocialCalc.rcColname(cr.col)] === 'yes') {
            continue;
     }
        if (cell.datatype === 'c') {
            cellvalue = cell.displaystring;
     } else {
            cellvalue = String(cell.datavalue);
     }
        if (cellvalue !== undefined && cellvalue.match(regex)) {
           search_cells.push(cell_id);
     }
 }
    spreadsheet.sheet.search_cells = search_cells;
    if (search_cells.length) {
        spreadsheet.sheet.selected_search_cell = 0;
        spreadsheet.editor.MoveECell(search_cells[0]);
        searchstatus.text("1 of " + search_cells.length);
 } else {
        spreadsheet.sheet.selected_search_cell = undefined;
        searchstatus.text("No Matches");
 }

}

SocialCalc.SpreadsheetControl.SearchSheet = function(direction) {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var sheet = spreadsheet.sheet;
    var cells = sheet.search_cells;
    if (!cells.length) {
        return;
 }
    var selected_cell = sheet.selected_search_cell;
    if (selected_cell === (direction === 0 ? 0 : cells.length-1)) {
        selected_cell = (direction === 0 ? cells.length-1 : 0);
 } else {
        selected_cell += (direction === 0 ? -1 : 1);
 }
    var new_cell = cells[selected_cell];
    sheet.selected_search_cell = selected_cell;
    spreadsheet.editor.MoveECell(new_cell);
    document.getElementById("searchstatus").textContent = String(selected_cell+1) + " of " + cells.length;
}

SocialCalc.SpreadsheetControlSearchUp = function() {
    SocialCalc.SpreadsheetControl.SearchSheet(0);
}

SocialCalc.SpreadsheetControlSearchDown = function() {
    SocialCalc.SpreadsheetControl.SearchSheet(1);
}