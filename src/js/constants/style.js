// List of all constants used for styling
SocialCalc.Css = {
   // Default sheet display values

   defaultCellLayout: "padding:2px 2px 1px 2px;vertical-align:top;",
   defaultCellFontStyle: "normal normal",
   defaultCellFontSize: "13px",
   defaultCellFontFamily: "Arial,Helvetica,sans-serif",

   defaultPaneDividerWidth: "4", // a string
   defaultPaneDividerHeight: "4", // a string

   defaultGridCSS: "1px solid #e2e3e3;", // used as style to set each border when grid enabled (was #ECECEC)

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

   defaultRowNameWidth: 25, // used to set minimum width of the row header column - a string in pixels
   defaultAssumedRowHeight: 22, // used when guessing row heights - number
   defaultColWidth: "120", // text
   defaultMinimumColWidth: 10, // numeric

   // For each of the following default sheet display values at least one of class and/or style are needed

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

   TClessbuttonRepeatWait: 300, // in milliseconds
   TClessbuttonRepeatInterval: 20,//100, // in milliseconds
   TCmorebuttonRepeatWait: 300, // in milliseconds
   TCmorebuttonRepeatInterval: 20,//100, // in milliseconds
   TCscrollareaRepeatWait: 500, // in milliseconds
   TCscrollareaRepeatInterval: 500, // in milliseconds

   //*** SocialCalc.TCPSDragFunctionStart

   TCPStrackinglineClass: "tracklingine", // at least one of class/style for pane slider tracking line display in table control
   TCPStrackinglineStyle: "overflow:hidden;position:absolute;zIndex:100;",
                           // if present, pseudo style (text-align is textAlign)
   TCPStrackinglineThickness: "2px", // narrow dimension of trackling line (string with units)

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
}