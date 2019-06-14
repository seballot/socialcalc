 // Update style button state according to selected row style
SocialCalc.UpdateToolBarStateFromCell = function(cell) {

   // reset
   $('.style-btn').removeClass('active');
   $('input[data-command="style.color"]').spectrum("set", scc.defaultCellColor);
   $('input[data-command="style.background-color"]').spectrum("set", scc.defaultCellBackgroundColor);
   $('input[data-command="style.border-color"]').spectrum("set", scc.defaultCellBorderOnColor);
   $('select[data-command="style.border-width"]').setSelectedValue('1px');

   // apply cell style
   for(var property in cell.style) {
      $('.style-btn[data-command="style.'+ property +'"]').each(function() {
         $(this).toggleClass('active', $(this).data('value') == cell.style[property]);
      })
      $('input[type=color][data-command="style.'+ property +'"]').spectrum("set", cell.style[property]);
      $('select[data-command="style.'+ property +'"]').setSelectedValue(cell.style[property]);
   }
}