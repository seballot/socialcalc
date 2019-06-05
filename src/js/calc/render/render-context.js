// *************************************
//
// RenderContext class:
//
// *************************************

SocialCalc.RenderContext = function(sheetobj) {

   var parts, num, s;
   var attribs = sheetobj.attribs;
   var scc = SocialCalc.Constants;

   // properties:

   this.sheetobj = sheetobj;
   this.hideRowsCols = false; // Rendering with panes only works with "false"
                              // !!!! Note: not implemented yet in rendering, just saved as an attribute
   this.showGrid = false;
   this.showRCHeaders = false;
   this.rownamewidth = scc.defaultRowNameWidth;
   this.pixelsPerRow = scc.defaultAssumedRowHeight;

   this.cellskip = {}; // if present, coord of cell covering this cell
   this.coordToCR = {}; // for cells starting spans, coordToCR[coord]={row:row, col:col}
   this.colwidth = []; // precomputed column widths, taking into account defaults
   this.rowheight = []; // precomputed row height, taking into account defaults
   this.totalwidth = 0; // precomputed total table width
   this.totalheight = 0; // precomputed total table height

   this.rowpanes = []; // for each pane, {first: firstrow, last: lastrow}
   this.colpanes = []; // for each pane, {first: firstrow, last: lastrow}
   this.colunhideleft = [];
   this.colunhideright = [];
   this.rowunhidetop = [];
   this.rowunhidebottom = [];
   this.maxcol=0; // max col and row to display, adding long spans, etc.
   this.maxrow=0;

   this.highlights = {}; // for each cell with special display: coord:highlightType (see this.highlightTypes)
   this.cursorsuffix = ""; // added to highlights[cr]=="cursor" to get type to lookup

   // TODO remove those highlight styles?
   this.highlightTypes = // attributes to change when highlit
      {
         cursor: {className: "selected-cell"},
         range: {className: "selected-range"},
         cursorinsertup: { className: "insert-up selected-cell"},
         cursorinsertleft: { className: "insert-left selected-cell"},
         range2: { className: "selected-range-initial"}
   }

   this.cellIDprefix = scc.defaultCellIDPrefix; // if non-null, each cell will render with an ID

   this.defaultlinkstyle = null; // default linkstyle object (allows you to pass values to link renderer)
   this.defaultHTMLlinkstyle = {type: "html"}; // default linkstyle for standalone HTML

   // constants:

   this.defaultfontstyle = scc.defaultCellFontStyle;
   this.defaultfontsize = scc.defaultCellFontSize;
   this.defaultfontfamily = scc.defaultCellFontFamily;

   this.defaultlayout = scc.defaultCellLayout;

   this.defaultpanedividerwidth = scc.defaultPaneDividerWidth;
   this.defaultpanedividerheight = scc.defaultPaneDividerHeight;

   this.gridCSS = scc.defaultGridCSS;

   this.commentClassName = scc.defaultCommentClass; // for cells with non-blank comments when this.showGrid is true
   this.commentCSS = scc.defaultCommentStyle; // any combination of classnames and styles may be used
   this.commentNoGridClassName = scc.defaultCommentNoGridClass; // for cells when this.showGrid is false
   this.commentNoGridCSS = scc.defaultCommentNoGridStyle; // any combination of classnames and styles may be used

   this.readonlyClassName = scc.defaultReadonlyClass; // for readonly cells with non-blank comments when this.showGrid is true
   this.readonlyCSS = scc.defaultReadonlyStyle; // any combination of classnames and styles may be used
   this.readonlyNoGridClassName = scc.defaultReadonlyNoGridClass; // for readonly cells when this.showGrid is false
   this.readonlyNoGridCSS = scc.defaultReadonlyNoGridStyle; // any combination of classnames and styles may be used
   this.readonlyComment = scc.defaultReadonlyComment;

   this.classnames = // any combination of classnames and explicitStyles can be used
      {
         colname: "column-cell",
         rowname: "row-cell",
         selectedcolname: "selected column-cell",
         selectedrowname: "selected row-cell",
         upperleft: "upper-left-cell column-cell",
         skippedcell: scc.defaultSkippedCellClass,
         panedivider: scc.defaultPaneDividerClass,
         unhideleft: scc.defaultUnhideLeftClass,
         unhideright: scc.defaultUnhideRightClass,
         unhidetop: scc.defaultUnhideTopClass,
         unhidebottom: scc.defaultUnhideBottomClass,
         colresizebar: scc.defaultColResizeBarClass,
         rowresizebar: scc.defaultRowResizeBarClass
   };

   this.explicitStyles = // these may be used so you won't need a stylesheet with the classnames
      {
         colname: "",
         rowname: "",
         selectedcolname: "",
         selectedrowname: "",
         upperleft: "",
         skippedcell: scc.defaultSkippedCellStyle,
         panedivider: scc.defaultPaneDividerStyle,
         unhideleft: scc.defaultUnhideLeftStyle,
         unhideright: scc.defaultUnhideRightStyle,
         unhidetop: scc.defaultUnhideTopStyle,
         unhidebottom: scc.defaultUnhideBottomStyle
   };

   // processed info about cell skipping

   this.cellskip = null;
   this.needcellskip = true;

   // precomputed values, filling in defaults indicated by "*"

   this.fonts=[]; // for each fontnum, {style: fs, weight: fw, size: fs, family: ff}
   this.layouts=[]; // for each layout, "padding:Tpx Rpx Bpx Lpx;vertical-align:va;"

   this.needprecompute = true; // need to call PrecomputeSheetFontsAndLayouts

   // if have a sheet object, initialize constants and precomputed values

   if (attribs) {
      this.rowpanes[0] = {first: 1, last: attribs.lastrow};
      this.colpanes[0] = {first: 1, last: attribs.lastcol};
      this.usermaxcol = attribs.usermaxcol;
      this.usermaxrow = attribs.usermaxrow;

   }
   else throw scc.s_rcMissingSheet;

}

// Methods:

SocialCalc.RenderContext.prototype.PrecomputeSheetFontsAndLayouts = function() {SocialCalc.PrecomputeSheetFontsAndLayouts(this);};
SocialCalc.RenderContext.prototype.CalculateCellSkipData = function() {SocialCalc.CalculateCellSkipData(this);};
SocialCalc.RenderContext.prototype.CalculateColWidthData = function() {SocialCalc.CalculateColWidthData(this);};
SocialCalc.RenderContext.prototype.CalculateRowHeightData = function() {SocialCalc.CalculateRowHeightData(this);};
SocialCalc.RenderContext.prototype.SetRowPaneFirstLast = function(panenum, first, last) {this.rowpanes[panenum]={first:first, last:last};};
SocialCalc.RenderContext.prototype.SetColPaneFirstLast = function(panenum, first, last) {this.colpanes[panenum]={first:first, last:last};};
SocialCalc.RenderContext.prototype.CoordInPane = function(coord, rowpane, colpane) {return SocialCalc.CoordInPane(this, coord, rowpane, colpane);};
SocialCalc.RenderContext.prototype.CellInPane = function(row, col, rowpane, colpane) {return SocialCalc.CellInPane(this, row, col, rowpane, colpane);};
SocialCalc.RenderContext.prototype.RenderSheet = function(oldtable, linkstyle) {return SocialCalc.RenderSheet(this, oldtable, linkstyle);};
SocialCalc.RenderContext.prototype.RenderColGroup = function() {return SocialCalc.RenderColGroup(this);};
SocialCalc.RenderContext.prototype.RenderColHeaders = function() {return SocialCalc.RenderColHeaders(this);};
SocialCalc.RenderContext.prototype.RenderSizingRow = function() {return SocialCalc.RenderSizingRow(this);};
SocialCalc.RenderContext.prototype.RenderRow = function(rownum, rowpane, linkstyle) {return SocialCalc.RenderRow(this, rownum, rowpane, linkstyle);};
SocialCalc.RenderContext.prototype.RenderSpacingRow = function() {return SocialCalc.RenderSpacingRow(this);};
SocialCalc.RenderContext.prototype.RenderCell = function(rownum, colnum, rowpane, colpane, noElement, linkstyle)
      {return SocialCalc.RenderCell(this, rownum, colnum, rowpane, colpane, noElement, linkstyle);};
