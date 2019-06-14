 // Update style button state according to selected row style
SocialCalc.UpdateToolBarStateFromCell = function(cell) {

   // reset
   $('.style-btn').removeClass('active');
   $('input[data-command="style.color"]').spectrum("set", scc.defaultCellColor);
   $('input[data-command="style.background-color"]').spectrum("set", scc.defaultCellBackgroundColor);
   $('input[data-command="style.border-color"]').spectrum("set", scc.defaultCellBorderOnColor);
   $('select[data-command="style.border-width"]').setSelectedValue('1px');
   $('.border-options').css('overflow', 'hidden').css('width', '0');

   // apply cell style
   for(var property in cell.style) {
      $('.style-btn[data-command="style.'+ property +'"]').each(function() {
         $(this).toggleClass('active', $(this).data('value') == cell.style[property]);
      })
      $('input[type=color][data-command="style.'+ property +'"]').spectrum("set", cell.style[property]);
      $('select[data-command="style.'+ property +'"]').setSelectedValue(cell.style[property]);
   }
   if (cell.style.border) $('.border-options').animate({'width': '72px'}, 250, 'swing', function() {
      $(this).css('overflow', "visible");
   })
}