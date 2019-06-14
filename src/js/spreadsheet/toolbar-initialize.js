SocialCalc.InitializeSpreadsheetToolBar = function(spreadsheet) {

   spreadsheet.$container.find('.tools-tabs-links li').click(function() { SocialCalc.SetTab(this); });

   // action btn
   $tableTools = spreadsheet.$container.find('.tool-tab-content[name=table]');
   $tableTools.find('.action-btn').click(function() {
      SocialCalc.DoCmd(this, $(this).data('command'));
   });

   // buttons for styling
   $tableTools.find('.style-btn').click(function() {
      SocialCalc.HandleStyleButtonClicked(this);
   });

   var palette = [
     ["#000000","#3c4042","#5b5b5b","#999999","#bcbcbc","#eeeeee","#f3f6f4","#ffffff"],
     ["#fbeeee","#fef9f3","#fffcf5","#f1f7ef","#eaf1f2","#f0f6fb","#f0edf6","#f7edf1"],
     ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
     ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
     ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
     ["#cc0000","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
     ["#990000","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
     ["#660000","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]

   ];

   $tableTools.find('input[type=color]').spectrum({
      showPalette: true,
      showAlpha: true,
      showInitial: true,
      preferredFormat: "hex",
      showInput: false,
      hideAfterPaletteSelect:true,
      showPaletteOnly: true,
      palette: palette
   });

   scc = SocialCalc.Constants;
   $tableTools.find('[data-command="style.color"] + .sp-replacer').prepend($('<span class="fas fa-font"></span>'));
   $tableTools.find('[data-command="style.background-color"] + .sp-replacer').prepend($('<span class="fas fa-fill-drip"></span>'));
   $tableTools.find('[data-command="style.border-color"] + .sp-replacer').prepend($('<span class="fas fa-tint"></span>'));
   $tableTools.find('input[data-command="style.color"]').spectrum("set", scc.defaultCellColor);
   $tableTools.find('input[data-command="style.background-color"]').spectrum("set", scc.defaultCellBackgroundColor);
   $tableTools.find('input[data-command="style.border-color"]').spectrum("set", scc.defaultCellBorderOnColor);

   $tableTools.find('.style-input, .style-select').change(function() {
      SocialCalc.HandleStyleButtonClicked(this);
   });

   /* ===== Logic for creating fake Select Boxes ===== */
   $('.sel').each(function() {
     $(this).children('select').css('display', 'none');

     var $current = $(this);

     $(this).find('option').each(function(i) {
       if (i == 0) {
         $current.prepend($('<div>', {
           class: $current.attr('class').replace(/sel/g, 'sel__box')
         }));

         var placeholder = $(this).text();
         $current.prepend($('<span>', {
           class: $current.attr('class').replace(/sel/g, 'sel__placeholder'),
           text: placeholder,
           'data-placeholder': placeholder
         }));

         return;
       }

       $current.children('div').append($('<span>', {
         class: $current.attr('class').replace(/sel/g, 'sel__box__options'),
         text: $(this).text(),
         value: $(this).attr('value')
       }));
     });
   });

   // Toggling the `.active` state on the `.sel`.
   $('.sel').click(function() {
     $(this).toggleClass('active');
   });

   // Toggling the `.selected` state on the options.
   $('.sel__box__options').click(function() {
      handleSelectBoxOptionSelected($(this), true);
   });
}

function setSelectBox(object, value) {
   var $element = object.siblings('.sel__box').find('.sel__box__options[value="' + value + '"]');
   handleSelectBoxOptionSelected($element, false);
};

function handleSelectBoxOptionSelected($element, triggerChange) {
   var txt = $element.text();
   var index = $element.index();

   $element.siblings('.sel__box__options').removeClass('selected');
   $element.addClass('selected');

   var $currentSel = $element.closest('.sel');
   $currentSel.children('.sel__placeholder').text(txt);
   $currentSel.children('select').prop('selectedIndex', index + 1);
   if (triggerChange) $currentSel.children('select').trigger('change');
}

$.fn.setSelectedValue = function (value) {
    setSelectBox(this, value);
};