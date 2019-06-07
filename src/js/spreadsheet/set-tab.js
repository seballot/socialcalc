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