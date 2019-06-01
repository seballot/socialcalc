//
// SocialCalc.SetTab(obj)
//
// The obj argument is either a string with the tab name or a DOM element with an ID
//

SocialCalc.SetTab = function(obj) {

   // var newtab, tname, newtabnum, newview, i, vname, ele;
   // var menutabs = {};
   // var tools = {};

   // var tabs = spreadsheet.tabs;
   // var views = spreadsheet.views;

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var $container = spreadsheet.$container;
   var $newTabLink;

   if (typeof obj == "string") $newTabLink = spreadsheet.$container.find('#' + obj);
   else $newTabLink = $(obj);

   var $oldTabLink = $container.find('.tools-tabs-links li.active')


   // if (spreadsheet.editor.busy && // if busy and switching from "sheet", ignore
   //       (!tabs[spreadsheet.currentTab].view || tabs[spreadsheet.currentTab].view=="sheet")) {
   //    for (i=0; i<tabs.length; i++) {
   //       if(tabs[i].name==newtab && (tabs[i].view && tabs[i].view!="sheet")) {
   //          return;
   //          }
   //       }
   //    }




   $container.find('.tools-tabs-links li').removeClass('active');
   $newTabLink.addClass('active');

   $container.find('.tool-tab-content').removeClass('active');
   $container.find('.tool-tab-content[name="' + $newTabLink.attr('name') + '"]').addClass('active');

   $container.find('.panels-container .panel').removeClass('active');
   var newView = $newTabLink.data('view');
   $container.find('.panels-container .panel[name="' + newView + '"]').addClass('active');
   if (newView == "sheet") spreadsheet.editor.ScheduleRender();

   // for (i=0; i<tabs.length; i++) {
   //    tname = tabs[i].name;
   //    menutabs[tname] = document.getElementById(spreadsheet.idPrefix+tname+"tab");
   //    tools[tname] = document.getElementById(spreadsheet.idPrefix+tname+"tools");
   //    if (tname==newtab) {
   //       newtabnum = i;
   //       tools[tname].style.display = "block";
   //       menutabs[tname].style.cssText = spreadsheet.tabselectedCSS;
   //       }
   //    else {
   //       tools[tname].style.display = "none";
   //       menutabs[tname].style.cssText = spreadsheet.tabplainCSS;
   //       }
   //    }

   // spreadsheet.currentTab = newtabnum;
   if ($oldTabLink.data('onunclick')) SocialCalc.GetFunctionByName($oldTabLink.data('onunclick'))(spreadsheet);

   if ($newTabLink.data('onclick')) SocialCalc.GetFunctionByName($newTabLink.data('onclick'))(spreadsheet);

   // if (tabs[newtabnum].onclick) {
   //    tabs[newtabnum].onclick(spreadsheet, newtab);
   //    }

   // for (vname in views) {
   //    if ((!tabs[newtabnum].view && vname == "sheet") || tabs[newtabnum].view == vname) {
   //       views[vname].element.style.display = "block";
   //       newview = vname;
   //       }
   //    else {
   //       views[vname].element.style.display = "none";
   //       }
   //    }

   var onClickFocus = $newTabLink.data('onclickFocus')
   if (onClickFocus) {
      element = $container.find('#' + $newTabLink.data('onclickFocus')).focus();
      SocialCalc.CmdGotFocus(element || onClickFocus);
     }
   else
      SocialCalc.KeyboardFocus();


   // if (views[newview].needsresize && views[newview].onresize) {
   //    views[newview].needsresize = false;
   //    views[newview].onresize(spreadsheet, views[newview]);
   //    }

   // if (newview == "sheet") {
   //    spreadsheet.statuslineDiv.style.display = "block";
   //    spreadsheet.editor.ScheduleRender();
   //    }
   // else {
   //    spreadsheet.statuslineDiv.style.display = "none";
   //    }

   return;

   }

 /**
 * Returns the function that you want to execute through its name.
 * It returns undefined if the function || property doesn't exists
 *
 * @param functionName {String}
 * @param context {Object || null}
 */
SocialCalc.GetFunctionByName = function (functionName, context) {
    // If using Node.js, the context will be an empty object
    if(typeof(window) == "undefined") {
        context = context || global;
    }else{
        // Use the window (from browser) as context if none providen.
        context = context || window;
    }

    // Retrieve the namespaces of the function you want to execute
    // e.g Namespaces of "MyLib.UI.alerti" would be ["MyLib","UI"]
    var namespaces = functionName.split(".");

    // Retrieve the real name of the function i.e alerti
    var functionToExecute = namespaces.pop();

    // Iterate through every namespace to access the one that has the function
    // you want to execute. For example with the alert fn "MyLib.UI.SomeSub.alert"
    // Loop until context will be equal to SomeSub
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }

    // If the context really exists (namespaces), return the function or property
    if(context){
        return context[functionToExecute];
    }else{
        return undefined;
    }
}