// List of all constants used for styling
SocialCalc.Css = {
   // Default sheet display values

   defaultCellLayout: "padding:2px 2px 1px 2px;vertical-align:top;",
   defaultCellFontStyle: "normal normal",
   defaultCellFontSize: "small",
   defaultCellFontFamily: "Verdana,Arial,Helvetica,sans-serif",

   defaultPaneDividerWidth: "3", // a string
   defaultPaneDividerHeight: "3", // a string

   defaultGridCSS: "1px solid #C0C0C0;", // used as style to set each border when grid enabled (was #ECECEC)

   defaultCommentClass: "", // class added to cells with non-null comments when grid enabled
   defaultCommentStyle: "background-repeat:no-repeat;background-position:top right;background-image:url(images/sc-commentbg.gif);", // style added to cells with non-null comments when grid enabled
   defaultCommentNoGridClass: "", // class added to cells with non-null comments when grid not enabled
   defaultCommentNoGridStyle: "", // style added to cells with non-null comments when grid not enabled

   defaultReadonlyClass: "", // class added to readonly cells when grid enabled
   defaultReadonlyStyle: "background-repeat:no-repeat;background-position:top right;background-image:url(images/sc-lockbg.gif);", // style added to readonly cells when grid enabled
   defaultReadonlyNoGridClass: "", // class added to readonly cells when grid not enabled
   defaultReadonlyNoGridStyle: "", // style added to readonly cells when grid not enabled

   //*** SocialCalc.format_text_for_display

   defaultLinkFormatString: '<span style="font-size:smaller;text-decoration:none !important;background-color:#66B;color:#FFF;">Link</span>', // used for format "text-link"; you could make this an img tag if desired
   defaultPageLinkFormatString: '<span style="font-size:smaller;text-decoration:none !important;background-color:#66B;color:#FFF;">Page</span>', // used for format "text-link"; you could make this an img tag if desired

   //*** SocialCalc.RenderContext

   defaultRowNameWidth: "30", // used to set minimum width of the row header column - a string in pixels
   defaultAssumedRowHeight: 15, // used when guessing row heights - number
   defaultColWidth: "80", // text
   defaultMinimumColWidth: 10, // numeric

   // For each of the following default sheet display values at least one of class and/or style are needed

   defaultHighlightTypeCursorClass: "",
   defaultHighlightTypeCursorStyle: "color:#FFF;backgroundColor:#A6A6A6;",
   defaultHighlightTypeRangeClass: "",
   defaultHighlightTypeRangeStyle: "color:#000;backgroundColor:#E5E5E5;",

   defaultColnameClass: "", // regular column heading letters, needs a cursor property
   defaultColnameStyle: "overflow:visible;font-size:small;text-align:center;color:#FFFFFF;background-color:#808080;",
   defaultSelectedColnameClass: "", // column with selected cell, needs a cursor property
   defaultSelectedColnameStyle: "overflow:visible;font-size:small;text-align:center;color:#FFFFFF;background-color:#404040;",
   defaultRownameClass: "", // regular row heading numbers
   defaultRownameStyle: "position:relative;overflow:visible;font-size:small;text-align:right;color:#FFFFFF;background-color:#808080;",
   defaultSelectedRownameClass: "", // column with selected cell, needs a cursor property
   defaultSelectedRownameStyle: "position:relative;overflow:visible;font-size:small;text-align:right;color:#FFFFFF;background-color:#404040;",
   defaultUpperLeftClass: "", // Corner cell in upper left
   defaultUpperLeftStyle: "font-size:small;",
   defaultSkippedCellClass: "", // used if present for spanned cells peeking into a pane (at least one of class/style needed)
   defaultSkippedCellStyle: "font-size:small;background-color:#CCC", // used if present
   defaultPaneDividerClass: "", // used if present for the look of the space between panes (at least one of class/style needed)
   defaultPaneDividerStyle: "font-size:small;background-color:#C0C0C0;padding:0px;", // used if present
   defaultUnhideLeftClass: "",
   defaultUnhideLeftStyle: "float:right;width:9px;height:12px;cursor:pointer;background-image:url(images/sc-unhideleft.gif);padding:0;", // used if present
   defaultUnhideRightClass: "",
   defaultUnhideRightStyle: "float:left;width:9px;height:12px;cursor:pointer;background-image:url(images/sc-unhideright.gif);padding:0;", // used if present
   defaultUnhideTopClass: "",
   defaultUnhideTopStyle: "float:left;left:1px;position:absolute;bottom:-4px;width:12px;height:9px;cursor:pointer;background-image:url(images/sc-unhidetop.gif);padding:0;",
   defaultUnhideBottomClass: "",
   defaultUnhideBottomStyle: "float:left;width:12px;height:9px;cursor:pointer;background-image:url(images/sc-unhidebottom.gif);padding:0;",

   defaultColResizeBarClass: "col-resize-bar",
   defaultRowResizeBarClass: "row-resize-bar",

   //** SocialCalc.InputEcho

   defaultInputEchoClass: "", // if present, the class of the popup inputEcho div
   defaultInputEchoStyle: "filter:alpha(opacity=90);opacity:.9;backgroundColor:#FFD;border:1px solid #884;"+
      "fontSize:small;padding:2px 10px 1px 2px;cursor:default;", // if present, pseudo style
   defaultInputEchoPromptClass: "", // if present, the class of the popup inputEcho div
   defaultInputEchoPromptStyle: "filter:alpha(opacity=90);opacity:.9;backgroundColor:#FFD;"+
      "borderLeft:1px solid #884;borderRight:1px solid #884;borderBottom:1px solid #884;"+
      "fontSize:small;fontStyle:italic;padding:2px 10px 1px 2px;cursor:default;", // if present, pseudo style
   defaultInputEchoHintClass: "", // if present, the class of the popup inputEcho div
   defaultInputEchoHintStyle: "filter:alpha(opacity=80);opacity:.8;backgroundColor:#884;border:1px solid #884;"+
      "fontSize:small;fontWeight:bold;padding:2px 2px 2px 2px;color:#FFF;position:absolute;top:-20px;cursor:default;",

   //*** SocialCalc.CreateTableControl

   TCmainStyle: "backgroundColor:#EEE;", // if present, pseudo style (text-align is textAlign) for main div of a table control
   TCmainClass: "", // if present, the CSS class of the main div for a table control
   TCendcapStyle: "backgroundColor:#FFF;", // backgroundColor may be used while waiting for image that may not come
   TCendcapClass: "",
   TCpanesliderClass: "tc-paneslider",
   TClessbuttonStyle: "backgroundColor:#AAA;",
   TClessbuttonClass: "",
   TClessbuttonRepeatWait: 300, // in milliseconds
   TClessbuttonRepeatInterval: 20,//100, // in milliseconds
   TCmorebuttonStyle: "backgroundColor:#AAA;",
   TCmorebuttonClass: "",
   TCmorebuttonRepeatWait: 300, // in milliseconds
   TCmorebuttonRepeatInterval: 20,//100, // in milliseconds
   TCscrollareaStyle: "backgroundColor:#DDD;",
   TCscrollareaClass: "",
   TCscrollareaRepeatWait: 500, // in milliseconds
   TCscrollareaRepeatInterval: 100, // in milliseconds
   TCthumbClass: "",
   TCthumbStyle: "backgroundColor:#CCC;",

   //*** SocialCalc.TCPSDragFunctionStart

   TCPStrackinglineClass: "tracklingine", // at least one of class/style for pane slider tracking line display in table control
   TCPStrackinglineStyle: "overflow:hidden;position:absolute;zIndex:100;",
                           // if present, pseudo style (text-align is textAlign)
   TCPStrackinglineThickness: "2px", // narrow dimension of trackling line (string with units)


   //*** SocialCalc.TCTDragFunctionStart

   TCTDFSthumbstatusvClass: "", // at least one of class/style for vertical thumb dragging status display in table control
   TCTDFSthumbstatusvStyle: "height:20px;width:auto;border:3px solid #808080;overflow:hidden;"+
                           "backgroundColor:#FFF;fontSize:small;position:absolute;zIndex:100;",
                           // if present, pseudo style (text-align is textAlign)
   TCTDFSthumbstatushClass: "", // at least one of class/style for horizontal thumb dragging status display in table control
   TCTDFSthumbstatushStyle: "height:20px;width:auto;border:1px solid black;padding:2px;"+
                           "backgroundColor:#FFF;fontSize:small;position:absolute;zIndex:100;",
                           // if present, pseudo style (text-align is textAlign)
   TCTDFSthumbstatusrownumClass: "", // at least one of class/style for thumb dragging status display in table control
   TCTDFSthumbstatusrownumStyle: "color:#FFF;background-color:#808080;font-size:small;white-space:nowrap;padding:3px;", // if present, real style
   TCTDFStopOffsetv: 0, // offsets for thumbstatus display while dragging
   TCTDFSleftOffsetv: -80,
   TCTDFStopOffseth: -30,
   TCTDFSleftOffseth: 0,


   //*** SocialCalc.TooltipInfo

   // Note: These two values are used to set the TooltipInfo initial values when the code is first read in.
   // Modifying them here after loading has no effect -- you need to modify SocialCalc.TooltipInfo directly
   // to dynamically set them. This is different than most other constants which may be modified until use.

   TooltipOffsetX: 2, // offset in pixels from mouse position (to right on left side of screen, to left on right)
   TooltipOffsetY: 10, // offset in pixels above mouse position for lower edge

   //*** SocialCalc.TooltipDisplay

   TDpopupElementClass: "", // at least one of class/style for tooltip display
   TDpopupElementStyle: "border:1px solid black;padding:1px 2px 2px 2px;textAlign:center;backgroundColor:#FFF;"+
                        "fontSize:7pt;fontFamily:Verdana,Arial,Helvetica,sans-serif;"+
                        "position:absolute;width:auto;zIndex:110;",
                        // if present, pseudo style (text-align is textAlign)


   //
   // SocialCalc Spreadsheet Control module, socialcalcspreadsheetcontrol.js:
   //

   //*** SocialCalc.SpreadsheetControl

   SCToolbarbackground: "background-color:#ffffff;",
   SCTabbackground: "background-color:#CCC;",
   SCTabselectedCSS: "font-size:small;padding:6px 30px 6px 8px;color:#FFF;background-color:#404040;cursor:default;border-right:1px solid #CCC;",
   SCTabplainCSS: "font-size:small;padding:6px 30px 6px 8px;color:#FFF;background-color:#808080;cursor:default;border-right:1px solid #CCC;",

   SCFormulabarheight: 30, // in pixels, will contain a text input box

   SCStatuslineheight: 20, // in pixels
   SCStatuslineCSS: "font-size:10px;padding:3px 0px;",

   //
   // SocialCalc Spreadsheet Viewer module, socialcalcviewer.js:
   //

   //*** SocialCalc.SpreadsheetViewer

   SVStatuslineheight: 20, // in pixels
   SVStatuslineCSS: "font-size:10px;padding:3px 0px;",
}