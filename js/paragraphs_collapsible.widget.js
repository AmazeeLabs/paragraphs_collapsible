(function ($) {
  /**
   * Paragraphs Drag&Drop functions
   * */
  Drupal.behaviors.paragraphs = {
    attach: function (context, settings) {
      var paragraphGuide = '> td > div > .form-wrapper > .paragraph-type-top';

      /**
       * Setting up all the toggler and reference attributes
       * */
      $('table.field-multiple-table .field-label').each(function(paragraphIndex){
        var $this = $(this);

        // set reference attribute for the table
        var $table = $this.parents('table.field-multiple-table').first();
        $table.attr('data-paragraph-reference', paragraphIndex);

        // create overarching toggler (only if there is more than one)
        if ($table.find('> tbody > tr').length > 1) {
          $this.once('paragraph-toggle-once').append('<a class="paragraph-toggle" data-paragraph-reference="' + paragraphIndex + '">' + Drupal.t('Expand all') + '</a>');
        }

        $table.find('> tbody > tr').once('paragraph-item-once').each(function(paragraphRowIndex){
          var $row = $(this);

          // set references for each row
          $row.attr('data-row-reference', paragraphIndex + '-' + paragraphRowIndex);

          // create toggler for each paragraph element
          if ($row.find(paragraphGuide + ' + .paragraphs-subform').length) {
            $row.find(paragraphGuide + ' > .paragraph-type-title').once('paragraph-item-toggle-once').append('<a class="paragraph-item-toggle" data-row-reference="' + paragraphIndex + '-' + paragraphRowIndex + '">[+]</a>');
          }
        });
      });

      /**
       * Complete paragraph toggler
       * */
      $('.paragraph-toggle', context).once('paragraph-rows-toggle').on('click', function(e){
        e.preventDefault();

        var $toggle = $(this),
            $rows = $('tr[data-row-reference*="' + $toggle.attr('data-paragraph-reference') + '-"]');

        if ($toggle.text() == 'Collapse all') {
          $toggle.text(Drupal.t('Expand all'));
          $rows.removeClass('expanded').find(paragraphGuide + ' > .paragraph-type-title .paragraph-item-toggle').text('[+]');
        } else {
          $toggle.text(Drupal.t('Collapse all'));
          $rows.addClass('expanded').find(paragraphGuide + ' > .paragraph-type-title .paragraph-item-toggle').text('[-]');
        }
      });

      /**
       * Individual paragraph element toggler
       * */
      $('.paragraph-item-toggle', context).once('paragraph-row-toggle').on('click', function(e){
        e.preventDefault();

        var $toggle = $(this);

        // expand / collapse row
        $('tr[data-row-reference="' + $toggle.attr('data-row-reference') + '"]').toggleClass('expanded');

        // visually show expanded / collapsed
        $toggle.text() == '[+]' ? $toggle.text('[-]') : $toggle.text('[+]');
      });
    }
  };

})(jQuery);
