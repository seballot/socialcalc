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

   this.controlthickness = scc.defaultTableControlThickness; // other dimension of complete control in pixels
   this.sliderthickness = scc.defaultTCSliderThickness;
   this.buttonthickness = scc.defaultTCButtonThickness;
   this.thumbthickness = scc.defaultTCThumbThickness;
   this.minscrollingpanesize = this.buttonthickness+this.buttonthickness+this.thumbthickness+20; // the 20 is to leave a little space

   }

// Methods:

SocialCalc.TableControl.prototype.CreateTableControl = function() {return SocialCalc.CreateTableControl(this);};
SocialCalc.TableControl.prototype.PositionTableControlElements = function() {SocialCalc.PositionTableControlElements(this);};
SocialCalc.TableControl.prototype.ComputeTableControlPositions = function() {SocialCalc.ComputeTableControlPositions(this);};

// Functions:

SocialCalc.CreateTableControl = function(control) {

   var s, functions, params;
   var AssignID = SocialCalc.AssignID;
   var setStyles = SocialCalc.setStyles;
   var scc = SocialCalc.Constants;

   var imageprefix = control.editor.imageprefix;
   var vh = control.vertical ? "v" : "h";
   var SCLoc = SocialCalc.LocalizeString;

   control.main = document.createElement("div");
   s = control.main.style;
   s.height = (control.vertical ? control.size : control.controlthickness)+"px";
   s.width = (control.vertical ? control.controlthickness : control.size)+"px";
   s.zIndex = 0;
   setStyles(control.main, scc.TCmainStyle);
   s.backgroundImage="url("+imageprefix+"main-"+vh+".gif)";
   if (scc.TCmainClass) control.main.className = scc.TCmainClass;

   control.main.style.display="none"; // wait for layout

   control.endcap = document.createElement("div");
   s = control.endcap.style;
   s.height = control.controlthickness+"px";
   s.width = control.controlthickness+"px";
   s.zIndex = 1;
   s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
   s.position = "absolute";
   setStyles(control.endcap, scc.TCendcapStyle);
   s.backgroundImage="url("+imageprefix+"endcap-"+vh+".gif)";
   if (scc.TCendcapClass) control.endcap.className = scc.TCendcapClass;
   AssignID(control.editor, control.endcap, "endcap"+vh);

   control.main.appendChild(control.endcap);

   control.paneslider = document.createElement("div");
   s = control.paneslider.style;
   s.height = (control.vertical ? control.sliderthickness : control.controlthickness)+"px";
   s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
   s.width = (control.vertical ? control.controlthickness : control.sliderthickness)+"px";
   s.position = "absolute";
   s[control.vertical?"top":"left"] = "4px";
   s.zIndex = 3;
   s.backgroundImage="url("+imageprefix+"paneslider-"+vh+".gif)";
   if (scc.TCpanesliderClass) control.paneslider.className = scc.TCpanesliderClass;
   AssignID(control.editor, control.paneslider, "paneslider"+vh);
   control.paneslider.title = SCLoc(control.vertical ? "Drag to lock pane horizontally" : "Drag to lock pane vertically");

   functions = {MouseDown:SocialCalc.TCPSDragFunctionStart,
                    MouseMove: SocialCalc.TCPSDragFunctionMove,
                    MouseUp: SocialCalc.TCPSDragFunctionStop,
                    Disabled: function() {return control.editor.busy;}};

   functions.control = control; // make sure this is there

   // Drag pane slider - every thing but app view
   if (SocialCalc._app != true) SocialCalc.DragRegister(control.paneslider, control.vertical, !control.vertical, functions, control.editor.toplevel);

   control.main.appendChild(control.paneslider);

   control.lessbutton = document.createElement("div");
   s = control.lessbutton.style;
   s.height = (control.vertical ? control.buttonthickness : control.controlthickness)+"px";
   s.width = (control.vertical ? control.controlthickness : control.buttonthickness)+"px";
   s.zIndex = 2;
   s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
   s.position = "absolute";
   setStyles(control.lessbutton, scc.TClessbuttonStyle);
   s.backgroundImage="url("+imageprefix+"less-"+vh+"n.gif)"
   if (scc.TClessbuttonClass) control.lessbutton.className = scc.TClessbuttonClass;
   AssignID(control.editor, control.lessbutton, "lessbutton"+vh);

   params = {repeatwait:scc.TClessbuttonRepeatWait, repeatinterval:scc.TClessbuttonRepeatInterval,
             normalstyle: "backgroundImage:url("+imageprefix+"less-"+vh+"n.gif);",
             downstyle: "backgroundImage:url("+imageprefix+"less-"+vh+"d.gif);",
             hoverstyle: "backgroundImage:url("+imageprefix+"less-"+vh+"h.gif);"};
   functions = {MouseDown:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, -1);},
                Repeat:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, -1);},
                Disabled: function() {return control.editor.busy;}};

   SocialCalc.ButtonRegister(control.editor, control.lessbutton, params, functions);

   control.main.appendChild(control.lessbutton);

   control.morebutton = document.createElement("div");
   s = control.morebutton.style;
   s.height = (control.vertical ? control.buttonthickness : control.controlthickness)+"px";
   s.width = (control.vertical ? control.controlthickness : control.buttonthickness)+"px";
   s.zIndex = 2;
   s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
   s.position = "absolute";
   setStyles(control.morebutton, scc.TCmorebuttonStyle);
   s.backgroundImage="url("+imageprefix+"more-"+vh+"n.gif)"
   if (scc.TCmorebuttonClass) control.morebutton.className = scc.TCmorebuttonClass;
   AssignID(control.editor, control.morebutton, "morebutton"+vh);

   params = {repeatwait:scc.TCmorebuttonRepeatWait, repeatinterval:scc.TCmorebuttonRepeatInterval,
             normalstyle: "backgroundImage:url("+imageprefix+"more-"+vh+"n.gif);",
             downstyle: "backgroundImage:url("+imageprefix+"more-"+vh+"d.gif);",
             hoverstyle: "backgroundImage:url("+imageprefix+"more-"+vh+"h.gif);"};
   functions = {MouseDown:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, +1);},
                Repeat:function(){if(!control.editor.busy) control.editor.ScrollRelative(control.vertical, +1);},
                Disabled: function() {return control.editor.busy;}};

   SocialCalc.ButtonRegister(control.editor, control.morebutton, params, functions);

   control.main.appendChild(control.morebutton);

   control.scrollarea = document.createElement("div");
   s = control.scrollarea.style;
   s.height = control.controlthickness+"px";
   s.width = control.controlthickness+"px";
   s.zIndex = 1;
   s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
   s.position = "absolute";
   setStyles(control.scrollarea, scc.TCscrollareaStyle);
   s.backgroundImage="url("+imageprefix+"scrollarea-"+vh+".gif)";
   if (scc.TCscrollareaClass) control.scrollarea.className = scc.TCscrollareaClass;
   AssignID(control.editor, control.scrollarea, "scrollarea"+vh);

   params = {repeatwait:scc.TCscrollareaRepeatWait, repeatinterval:scc.TCscrollareaRepeatWait};
   functions = {MouseDown:SocialCalc.ScrollAreaClick, Repeat:SocialCalc.ScrollAreaClick,
                Disabled: function() {return control.editor.busy;}};
   functions.control = control;

   SocialCalc.ButtonRegister(control.editor, control.scrollarea, params, functions);

   control.main.appendChild(control.scrollarea);

   control.thumb = document.createElement("div");
   s = control.thumb.style;
   s.height =  (control.vertical ? control.thumbthickness : control.controlthickness)+"px";
   s.width = (control.vertical ? control.controlthickness : control.thumbthickness)+"px";
   s.zIndex = 2;
   s.overflow = "hidden"; // IE will make the DIV at least font-size height...so use this
   s.position = "absolute";
   setStyles(control.thumb, scc.TCthumbStyle);
   control.thumb.style.backgroundImage="url("+imageprefix+"thumb-"+vh+"n.gif)";
   if (scc.TCthumbClass) control.thumb.className = scc.TCthumbClass;
   AssignID(control.editor, control.thumb, "thumb"+vh);

   functions = {MouseDown:SocialCalc.TCTDragFunctionStart,
                MouseMove: SocialCalc.TCTDragFunctionMove,
                MouseUp: SocialCalc.TCTDragFunctionStop,
                Disabled: function() {return control.editor.busy;}};
   functions.control = control; // make sure this is there

   // Drag pane slider - every thing but app view
   if (SocialCalc._app != true) SocialCalc.DragRegister(control.thumb, control.vertical, !control.vertical, functions, control.editor.toplevel);

   params = {normalstyle: "backgroundImage:url("+imageprefix+"thumb-"+vh+"n.gif)", name:"Thumb",
             downstyle:  "backgroundImage:url("+imageprefix+"thumb-"+vh+"d.gif)",
             hoverstyle:  "backgroundImage:url("+imageprefix+"thumb-"+vh+"h.gif)"};
   SocialCalc.ButtonRegister(control.editor, control.thumb, params, null); // give it button-like visual behavior

   control.main.appendChild(control.thumb);

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

   var editor = control.editor;

   if (control.vertical) {
      border = control.controlborder+"px";
      control.endcap.style.top = control.endcapstart+"px";
      control.endcap.style.left = border;
      control.paneslider.style.top = control.panesliderstart+"px";
      control.paneslider.style.left = border
      control.lessbutton.style.top = control.lessbuttonstart+"px";
      control.lessbutton.style.left = border;
      control.morebutton.style.top = control.morebuttonstart+"px";
      control.morebutton.style.left = border;
      control.scrollarea.style.top = control.scrollareastart+"px";
      control.scrollarea.style.left = border;
      control.scrollarea.style.height = control.scrollareasize+"px";
      realend = Math.max(editor.context.sheetobj.attribs.lastrow, editor.firstscrollingrow+1);
      thumbpos = ((editor.firstscrollingrow-(editor.lastnonscrollingrow+1))*(control.scrollareasize-3*control.thumbthickness))/
         (realend-(editor.lastnonscrollingrow+1))+control.scrollareastart-1;
      thumbpos = Math.floor(thumbpos);
      control.thumb.style.top = thumbpos+"px";
      control.thumb.style.left = border;
      }
   else {
      border = control.controlborder+"px";
      control.endcap.style.left = control.endcapstart+"px";
      control.endcap.style.top = border;
      control.paneslider.style.left = control.panesliderstart+"px";
      control.paneslider.style.top = border
      control.lessbutton.style.left = control.lessbuttonstart+"px";
      control.lessbutton.style.top = border;
      control.morebutton.style.left = control.morebuttonstart+"px";
      control.morebutton.style.top = border;
      control.scrollarea.style.left = control.scrollareastart+"px";
      control.scrollarea.style.top = border;
      control.scrollarea.style.width = control.scrollareasize+"px";
      realend = Math.max(editor.context.sheetobj.attribs.lastcol, editor.firstscrollingcol+1);
      thumbpos = ((editor.firstscrollingcol-(editor.lastnonscrollingcol+1))*(control.scrollareasize-control.thumbthickness))/
         (realend-editor.lastnonscrollingcol)+control.scrollareastart-1;
      thumbpos = Math.floor(thumbpos);
      control.thumb.style.left = thumbpos+"px";
      control.thumb.style.top = border;
      }
   control.thumbpos = thumbpos;
   control.main.style.display="block";

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
      control.controlborder = editor.gridposition.left+editor.tablewidth; // border=left position
      control.endcapstart = editor.gridposition.top; // start=top position
      control.panesliderstart = editor.firstscrollingrowtop-control.sliderthickness;
      control.lessbuttonstart = editor.firstscrollingrowtop-1;
      control.morebuttonstart = editor.gridposition.top+editor.tableheight-control.buttonthickness;
      control.scrollareastart = editor.firstscrollingrowtop-1+control.buttonthickness;
      control.scrollareaend = control.morebuttonstart-1;
      control.scrollareasize = control.scrollareaend-control.scrollareastart+1;
      }
   else {
      control.controlborder = editor.gridposition.top+editor.tableheight; // border=top position
      control.endcapstart = editor.gridposition.left; // start=left position
      control.panesliderstart = editor.firstscrollingcolleft-control.sliderthickness;
      control.lessbuttonstart = editor.firstscrollingcolleft-1;
      control.morebuttonstart = editor.gridposition.left+editor.tablewidth-control.buttonthickness;
      control.scrollareastart = editor.firstscrollingcolleft-1+control.buttonthickness;
      control.scrollareaend = control.morebuttonstart-1;
      control.scrollareasize = control.scrollareaend-control.scrollareastart+1;
      }
   }