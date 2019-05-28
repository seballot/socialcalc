//
// The main SocialCalc code module of the SocialCalc package
//
/*
// (c) Copyright 2010 Socialtext, Inc.
// All Rights Reserved.
//
// The contents of this file are subject to the Artistic License 2.0; you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at http://socialcalc.org/licenses/al-20/.
//
// Some of the other files in the SocialCalc package are licensed under
// different licenses. Please note the licenses of the modules you use.
//
// Code History:
//
// Initially coded by Dan Bricklin of Software Garden, Inc., for Socialtext, Inc.
// Based in part on the SocialCalc 1.1.0 code written in Perl.
// The SocialCalc 1.1.0 code was:
//    Portions (c) Copyright 2005, 2006, 2007 Software Garden, Inc.
//    All Rights Reserved.
//    Portions (c) Copyright 2007 Socialtext, Inc.
//    All Rights Reserved.
// The Perl SocialCalc started as modifications to the wikiCalc(R) program, version 1.0.
// wikiCalc 1.0 was written by Software Garden, Inc.
// Unless otherwise specified, referring to "SocialCalc" in comments refers to this
// JavaScript version of the code, not the SocialCalc Perl code.
//
*/

/*

**** Overview ****

This is the beginning of a library of routines for displaying and editing spreadsheet
data in a browser. The HTML that includes this does not need to have anything
specific to the spreadsheet or editor already present -- everything is dynamically
added to the DOM by this code, including the rendered sheet and any editing controls.

The library has a few parts. This is the main SocialCalc code module.
Other parts are the Table Editor module, the Formula module, and the Format Number module.
Note: The Table Editor module is licensed under a different license than this module.

The class/object style is derived from O'Reilly's JavaScript by Flanagan, 5th Edition,
section 9.3, page 157.

All of the data, object definitions, functions, etc., are stored as properties of the SocialCalc
object so as not to clutter up the global variables nor conflict with other names.

A design goal (not tested yet for success) is to make it possible to have more than one
spreadsheet active on a page, perhaps even open for editing. It is assumed, though, that
there is only one mouse and one keyboard (a good assumption on most PCs today but not in the
new "touch and surface world" Apple and Microsoft are working towards).

The testing has been on Windows Firefox (2 and 3),
Internet Explorer (6 and 7), Opera (9.23 and mainly later), Mac Safari (3.1), and Mac Firefox (2.0.0.6).
There are small issues with Firefox before 2.0 (cosmetic with drag handles) and larger ones
with Opera before 9.5 (the Delete key isn't recognized in some cases -- the 9.5 version was still
in beta and this bug affects other products like GMail, I believe).

The data is stored in a SocialCalc.Sheet object. The data is organized in a form similar to that
used by SocialCalc 1.1.0. There is a function for converting a normal SocialCalc spreadsheet
save data string (the spreadsheet part of a SocialCalc data file) into this internal form.

The SocialCalc.RenderContext class provides methods for rendering a table into the DOM representing
part of the spreadsheet. It is assumed that the spreadsheet could possibly be very large
and that rendering the whole thing at once could be too time consuming. It is also set up so
that it might be possible to have some of the sheet data only be loaded on demand (such as by Ajax).
The rendering can render cells to the right and below the already active area of the spreadsheet
so that you can scroll to that "clean" area without explicitly doing "add row/column". The class also
does simple operations such as "scrolling" within that table. The table may optionally include
row and column headers and may be split into panes. Most of the code assumes any number of panes,
but only the rightmost pane has scrolling code. In normal operation there would be one or two
panes horizontally and vertically. The panes may start on any row/column, though a given row/column
should only appear in one pane at a time (not all code enforces this, yet).

The RenderContext is designed to be rendered as part of a SocialCalc.TableEditor. The TableEditor
includes the spreadsheet grid as well as scrollbars, pane sliders, and (eventually) editing controls.
The layout is dynamic and may be recomputed on the fly, such as in response to resizing the browser
window.

The scrollbars and pane sliders are created using SocialCalc.TableControl objects. These in turn
make use of Dragging, ToolTip, Button, and MouseWheel functions.

The keyboard input is handled by keyboard code.

There are also some helper routines.

More comments yet to come...

*/


var SocialCalc;
if (!SocialCalc) SocialCalc = {};

// *************************************
//
// Shared values
//
// These are "global" values shared by the classes, including default settings
//
// *************************************

// Callbacks

SocialCalc.Callbacks = {

   // The next two are used by SocialCalc.format_text_for_display

   // The function to expand wiki text - should be set if you want wikitext expansion
   // The form is: expand_wiki(displayvalue, sheetobj, linkstyle, valueformat)
   //    valueformat is text-wiki followed by optional sub-formats, e.g., text-wikipagelink

   expand_wiki: null,

   expand_markup: function(displayvalue, sheetobj, linkstyle) // the old function to expand wiki text - may be replaced
                   {return SocialCalc.default_expand_markup(displayvalue, sheetobj, linkstyle);},

   // MakePageLink is used to create the href for a link to another "page"
   // The form is: MakePageLink(pagename, workspacename, linktyle, valueformat), returns string

   MakePageLink: null,

   // NormalizeSheetName is used to make different variations of sheetnames use the same cache slot

   NormalizeSheetName: null // use default - lowercase

   };

SocialCalc.sheetfields = ["defaultrowheight", "defaultcolwidth", "circularreferencecell", "recalc", "needsrecalc", "usermaxcol", "usermaxrow"];
SocialCalc.sheetfieldsshort = ["h", "w", "circularreferencecell", "recalc", "needsrecalc", "usermaxcol", "usermaxrow"];

SocialCalc.sheetfieldsxlat = ["defaulttextformat", "defaultnontextformat",
                              "defaulttextvalueformat", "defaultnontextvalueformat",
                              "defaultcolor", "defaultbgcolor", "defaultfont", "defaultlayout"];
SocialCalc.sheetfieldsxlatshort = ["tf", "ntf", "tvf", "ntvf", "color", "bgcolor", "font", "layout"];
SocialCalc.sheetfieldsxlatxlt = ["cellformat", "cellformat", "valueformat", "valueformat",
                                  "color", "color", "font", "layout"];



/* For Debugging:
var ustack="";
for (var i=0;i<sheet.changes.stack.length;i++) {
   ustack+=(i-0)+":"+sheet.changes.stack[i].command[0]+" of "+sheet.changes.stack[i].command.length+"/"+sheet.changes.stack[i].undo[0]+" of "+sheet.changes.stack[i].undo.length+",";
   }
alert(cmdstr+"|"+sheet.changes.stack.length+"--"+ustack);
*/
   if(SocialCalc._app) {
     // widgets need focus. In app mode, render widgets only when required. Rather than default of render everything
     if(cellChanged) {
       if(sheet.renderneeded == true && attrib!="value" && attrib!="text" && attrib!="formula" && attrib!="constant" && attrib!="empty") sheet.widgetsClean = false;  // force widgets to render
       else if(attrib=="all") sheet.widgetsClean = false;  // force widgets to render - because of undo
       }
     else {
       if(sheet.renderneeded == true) sheet.widgetsClean = false;  // force widgets to render
       }
     }



// *************************************
//
// Clipboard Object:
//
// This is a single object.
// Stores the clipboard, which is shared by all active sheets.
// Like the undo stack, it does not persist from one editing session to another.
//
// *************************************

SocialCalc.Clipboard = {

   // properties:

   clipboard:  "" // empty or string in save format with "copiedfrom:" set to a range

   }
