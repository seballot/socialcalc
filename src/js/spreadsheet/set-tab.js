//
// SocialCalc.SetTab(obj)
//
// The obj argument is either a string with the tab name or a DOM element with an ID
//

SocialCalc.SetTab = function(obj) {

   var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
   var $container = spreadsheet.$container;
   var $newTabLink;

   if (typeof obj == "string") $newTabLink = spreadsheet.$container.find('#' + obj);
   else $newTabLink = $(obj);

   var $oldTabLink = $container.find('.tools-tabs-links li.active')

   $container.find('.tools-tabs-links li').removeClass('active');
   $newTabLink.addClass('active');

   $container.find('.tool-tab-content').removeClass('active');
   $container.find('.tool-tab-content[name="' + $newTabLink.attr('name') + '"]').addClass('active');

   $container.find('.panels-container .panel').removeClass('active');
   var newView = $newTabLink.data('view');
   $container.find('.panels-container .panel[name="' + newView + '"]').addClass('active');
   if (newView == "sheet") spreadsheet.editor.ScheduleRender();

   // spreadsheet.currentTab = newtabnum;
   if ($oldTabLink.data('onunclick')) SocialCalc.GetFunctionByName($oldTabLink.data('onunclick'))(spreadsheet);

   if ($newTabLink.data('onclick')) SocialCalc.GetFunctionByName($newTabLink.data('onclick'))(spreadsheet);

   var onClickFocus = $newTabLink.data('onclickFocus')
   if (onClickFocus) {
      element = $container.find('#' + $newTabLink.data('onclickFocus')).focus();
      SocialCalc.CmdGotFocus(element || onClickFocus);
  }
   else
      SocialCalc.KeyboardFocus();
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