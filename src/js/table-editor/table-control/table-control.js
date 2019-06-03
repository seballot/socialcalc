// *************************************
//
// TableControl class:
//
// This class deals with the horizontal and verical scrollbars and pane sliders.
//
// +--------------+
// | Endcap       |
// +- - - - - - - +
// |              |
// +--------------+
// | Pane Slider  |
// +--------------+
// |              |
// | Less Button  |
// |              |
// +--------------+
// | Scroll Area  |
// |              |
// |              |
// +--------------+
// | Thumb        |
// +--------------+
// |              |
// +--------------+
// |              |
// | More Button  |
// |              |
// +--------------+
//
// *************************************

SocialCalc.TableControl = function(editor, vertical, size) {

   var scc = SocialCalc.Constants;

   this.editor = editor; // the TableEditor this belongs to

   this.vertical = vertical; // true if vertical control, false if horizontal
   this.size = size; // length in pixels

   this.main = null; // main element containing all the others
   this.endcap = null; // the area at the top/left between the end and the pane slider
   this.paneslider = null; // the slider to adjust the pane split
   this.lessbutton = null; // the top/left scroll button
   this.morebutton = null; // the bottom/right scroll button
   this.scrollarea = null; // the area between the scroll buttons
   this.thumb = null; // the sliding thing in the scrollarea

   // computed position values:

   this.controlborder = null; // left or top screen position for vertical or horizontal control
   this.endcapstart = null; // top or left screen position for vertical or horizontal control
   this.panesliderstart = null;
   this.lessbuttonstart = null;
   this.morebuttonstart = null;
   this.scrollareastart = null;
   this.scrollareaend = null;
   this.scrollareasize = null;
   this.thumbpos = null;

   // constants:

   this.controlthickness = 12; // other dimension of complete control in pixels
   this.sliderthickness = 8;
   this.buttonthickness = 12;
   this.thumbthickness = 0; // auto calculated
   this.minscrollingpanesize = this.buttonthickness+this.buttonthickness+this.thumbthickness+20; // the 20 is to leave a little space

   }

// Methods:

SocialCalc.TableControl.prototype.CreateTableControl = function() {return SocialCalc.CreateTableControl(this);};
SocialCalc.TableControl.prototype.PositionTableControlElements = function() {SocialCalc.PositionTableControlElements(this);};
SocialCalc.TableControl.prototype.ComputeTableControlPositions = function() {SocialCalc.ComputeTableControlPositions(this);};

// Functions:

SocialCalc.CreateTableControl = function(control) {

   var s, functions, params;
   var scc = SocialCalc.Constants;
   var vh = control.vertical ? "v" : "h";

   control.main = document.getElementById("te_tablecontrol" + vh);
   control.fixedpane = $(control.main).find(".tc-fixed-pane")[0];

   // PANE SLIDER

   control.paneslider = $(control.main).find(".tc-panes-slider")[0];

   functions = {MouseDown:SocialCalc.TCPSDragFunctionStart,
                    MouseMove: SocialCalc.TCPSDragFunctionMove,
                    MouseUp: SocialCalc.TCPSDragFunctionStop,
                    Disabled: function() {return control.editor.busy;}};

   functions.control = control; // make sure this is there

   if (SocialCalc._app != true) SocialCalc.DragRegister(control.paneslider, control.vertical, !control.vertical, functions, control.editor.toplevel);

   // LESS BUTTON

   control.lessbutton = $(control.main).find(".tc-less-button")[0];

   params = {repeatwait:scc.TClessbuttonRepeatWait, repeatinterval:scc.TClessbuttonRepeatInterval};
   functions = {MouseDown:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, -1);},
                Repeat:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, -1);},
                Disabled: function() {return control.editor.busy;}};

   SocialCalc.ButtonRegister(control.editor, control.lessbutton, params, functions);

   // MORE BUTTON

   control.morebutton = $(control.main).find(".tc-more-button")[0];

   params = {repeatwait:scc.TCmorebuttonRepeatWait, repeatinterval:scc.TCmorebuttonRepeatInterval };
   functions = {MouseDown:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, +1);},
                Repeat:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, +1);},
                Disabled: function() {return control.editor.busy;}};

   SocialCalc.ButtonRegister(control.editor, control.morebutton, params, functions);

   // SCROLL AREA

   control.scrollarea = $(control.main).find(".tc-scroll-area")[0];

   params = {repeatwait:scc.TCscrollareaRepeatWait, repeatinterval:scc.TCscrollareaRepeatInterval};
   functions = {MouseDown:SocialCalc.ScrollAreaClick, Repeat:SocialCalc.ScrollAreaClick,
                Disabled: function() {return control.editor.busy;}};
   functions.control = control;

   SocialCalc.ButtonRegister(control.editor, control.scrollarea, params, functions);

   // THUMB

   control.thumb = $(control.main).find(".tc-thumb")[0];

   functions = {MouseDown:SocialCalc.TCTDragFunctionStart,
                MouseMove: SocialCalc.TCTDragFunctionMove,
                MouseUp: SocialCalc.TCTDragFunctionStop,
                Disabled: function() {return control.editor.busy;}};
   functions.control = control; // make sure this is there

   if (SocialCalc._app != true) SocialCalc.DragRegister(control.thumb, control.vertical, !control.vertical, functions, control.editor.toplevel);

   return control.main;
}

//
// ScrollAreaClick - Button function to process pageup/down clicks
//

SocialCalc.ScrollAreaClick = function(e, buttoninfo, bobj) {

   var control = bobj.functionobj.control;
   var pos = SocialCalc.GetElementPositionWithScroll(control.editor.toplevel);
   var clickpos = control.vertical ? buttoninfo.clientY-pos.top : buttoninfo.clientX-pos.left;
   if (control.editor.busy) { // ignore if busy - wait for next repeat
      return;
      }
   control.editor.PageRelative(control.vertical, clickpos > control.thumbpos ? 1 : -1);

   return;

}
//
// PositionTableControlElements
//

SocialCalc.PositionTableControlElements = function(control) {

   var border, realend, thumbpos;
   if (control.preventRenderScrollBar) return;
   var editor = control.editor;
   if (control.vertical) {
      control.paneslider.style.top = control.panesliderstart +"px";
      control.fixedpane.style.height = editor.firstscrollingrowtop + "px";

      // Calculate scrollbar Thumb position depending on first visible row
      // This calculation must be the same than in thumb.js TCTDragFunctionMove
      var tableVisibleScrollableHeight = editor.tableheight - editor.firstscrollingrowtop;
      var pourcentHeight = editor.firstVisibleRowHeightToTopScrollableContainer / (editor.tableFullScrollableHeight - tableVisibleScrollableHeight);

      control.thumbthickness = control.scrollareasize * tableVisibleScrollableHeight / editor.tableFullScrollableHeight;
      var maxHeightPx = control.scrollareasize - control.thumbthickness;
      thumbpos = pourcentHeight * maxHeightPx;

      control.thumb.style.top = Math.floor(thumbpos)+"px";
      control.thumb.style.height = control.thumbthickness + "px";
      }
   else {
      control.paneslider.style.left = control.panesliderstart +"px";
      control.fixedpane.style.width = editor.firstscrollingcolleft + "px";

      // Calculate scrollbar Thumb position depending on first visible col
      // This calculation must be the same than in thumb.js TCTDragFunctionMove
      var tableVisibleScrollableWidth = editor.tablewidth - editor.firstscrollingcolleft;
      var pourcentWidth = editor.firstVisibleColWidthToTopScrollableContainer / (editor.tableFullScrollableWidth - tableVisibleScrollableWidth);
      control.thumbthickness = control.scrollareasize * tableVisibleScrollableWidth / editor.tableFullScrollableWidth;
      var maxWidthPx = control.scrollareasize - control.thumbthickness;
      thumbpos = pourcentWidth * maxWidthPx;

      control.thumb.style.left = Math.floor(thumbpos)+"px";
      control.thumb.style.width = control.thumbthickness + "px";
      }

   control.thumbpos = thumbpos;

   }

//
// ComputeTableControlPositions
//
// This routine computes the screen positions and other values needed for laying out
// the table control elements.
//

SocialCalc.ComputeTableControlPositions = function(control) {

   var editor = control.editor;

   if (!editor.gridposition || !editor.headposition) throw("Can't compute table control positions before editor positions");

   if (control.vertical) {
      control.scrollareasize = $(control.scrollarea).height();
      control.panesliderstart = editor.firstscrollingrowtop - $(control.paneslider).height();
      }
   else {
      control.scrollareasize = $(control.scrollarea).width();
      control.panesliderstart = editor.firstscrollingcolleft - $(control.paneslider).width();
      }
   }
