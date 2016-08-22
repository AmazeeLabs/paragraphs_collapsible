(function ($) {
  /**
   * Paragraphs Drag&Drop functions
   * */
  Drupal.behaviors.paragraphsCollapsibleWidget = {
    attach: function (context, settings) {
      var paragraphGuide = '> td > div > .form-wrapper > .paragraph-type-top, > td > div.ajax-new-content > div > .form-wrapper > .paragraph-type-top';

      function loadExcerption($row, textData) {
        // Paragraph types where we show excerpt of text.
        var excerptTypes = ['Text', 'Quote'];

        $row.each(function() {
          var thisType = $(this).find(paragraphGuide).find('> .paragraph-type-title > em').html();
          if (jQuery.inArray(thisType, excerptTypes) != -1) {
           if (textData == 'CKEDITOR') {
             id = $(this).find('.paragraphs-subform textarea').attr('id');
             textData = CKEDITOR.instances[id].getData();
           }
           else {
             textData = $(this).find('.paragraphs-subform textarea').text();
           }
           textData = textData
             .replace(/(<([^>]+)>)/ig, "")
             .slice(0, 150) + '...';

            $(this).find(paragraphGuide).find('> .paragraph-type-title .excerpt').html(textData);
          }
        });
      }

      function updateExcerption($row) {
        loadExcerption($row, 'CKEDITOR');
      }

      /**
       * Setting up all the toggler and reference attributes
       * */
      $('.field--widget-entity-reference-paragraphs table.field-multiple-table .field-label').each(function(paragraphIndex){
        var $this = $(this);

        // set reference attribute for the table
        var $table = $this.parents('table.field-multiple-table').first();
        $table.attr('data-paragraph-reference', paragraphIndex);

        $table.find('> tbody > tr').once('paragraph-item-once').each(function(paragraphRowIndex){
          var $row = $(this),
              character = '[+]';

          // set references for each row
          $row.attr('data-row-reference', paragraphIndex + '-' + paragraphRowIndex);

          // check for error elements
          if ($row.find('.error').length || $row.find(' > td > .ajax-new-content').length) {
            $row.addClass('expanded');
            character = '[-]';
          }

          // create toggler for each paragraph element
          if ($row.find(paragraphGuide).find('+ .paragraphs-subform').length) {
            $row.find(paragraphGuide).find('> .paragraph-type-title').once('paragraph-item-toggle-once').append('<a class="paragraph-item-toggle" data-row-reference="' + paragraphIndex + '-' + paragraphRowIndex + '">' + character + '</a>');
            $row.find(paragraphGuide).find('> .paragraph-type-title').append('<blockquote class="excerpt expanded"></blockquote>');
            loadExcerption($row);
          }


        });
        
        // create overarching toggler
        var togglerText = 'Expand all';

        if ($table.find('> tbody > tr').length <= 1 || ($table.find('> tbody > tr').length && $table.find('> tbody > tr.expanded').length)) {
          togglerText = 'Collapse all';
        }

        $this.once('paragraph-toggle-once').append('<a class="paragraph-toggle" data-paragraph-reference="' + paragraphIndex + '">' + Drupal.t(togglerText) + '</a>');
      });

      /**
       * Complete paragraph toggler
       * */
      $('.paragraph-toggle', context).once('paragraph-rows-toggle').on('click', function(e){
        e.preventDefault();

        var $toggle = $(this),
            $rows = $('tr[data-row-reference^="' + $toggle.attr('data-paragraph-reference') + '-"]');

        if ($toggle.text() == 'Collapse all') {
          $toggle.text(Drupal.t('Expand all'));
          $rows.removeClass('expanded').find(paragraphGuide).find('> .paragraph-type-title .paragraph-item-toggle').text('[+]');
          $rows.find('blockquote.excerpt').addClass('expanded');
          updateExcerption($rows);
        } else {
          $toggle.text(Drupal.t('Collapse all'));
          $rows.addClass('expanded').find(paragraphGuide).find('> .paragraph-type-title .paragraph-item-toggle').text('[-]');
          $rows.find('blockquote.excerpt').removeClass('expanded');
        }
      });

      /**
       * Individual paragraph element toggler
       * */
      $('.paragraph-item-toggle', context).once('paragraph-row-toggle').on('click', function(e){
        e.preventDefault();

        var $toggle = $(this),
            $row = $('tr[data-row-reference="' + $toggle.attr('data-row-reference') + '"]');

        // expand / collapse row
        $row.toggleClass('expanded');
        $row.find('blockquote.excerpt').toggleClass('expanded');
        if ($row.find('blockquote.excerpt').hasClass('expanded')) {
          updateExcerption($row);
        }

        // visually show expanded / collapsed
        $toggle.text() == '[+]' ? $toggle.text('[-]') : $toggle.text('[+]');

        // check if we expanded / collapsed all the rows
        var $rowsToggler = $('table[data-paragraph-reference="' + $toggle.attr('data-row-reference').charAt(0) + '"]').find(' > thead .paragraph-toggle');

        // change overarching toggler text when all row items are expanded / collapsed
        if ($row.hasClass('expanded') && $row.siblings().length == $row.siblings('.expanded').length) {
          $rowsToggler.text(Drupal.t('Collapse all'));
        } else if ($row.siblings().length == $row.siblings(':not(.expanded)').length) {
          $rowsToggler.text(Drupal.t('Expand all'));
        }
      });
    }
  };

})(jQuery);
