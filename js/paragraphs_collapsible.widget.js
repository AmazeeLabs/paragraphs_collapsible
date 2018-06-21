(function($) {
  /**
   * Paragraphs Drag&Drop functions
   * */
  Drupal.behaviors.paragraphsCollapsibleWidget = {
    attach: function(context, settings) {
      var paragraphGuide =
        '> td > div > .form-wrapper > .paragraph-type-top, > td > div.ajax-new-content > div > .form-wrapper > .paragraph-type-top';

      /**
       * Trims, if characters are more than 50, slices
       * by 50 characters and appends ... to the data.
       * @param {String} data
       */
      function trimData(data) {
        data = data.trim().replace(/(<([^>]+)>)/gi, '');
        return (
          '"' + (data.length > 50 ? data.slice(0, 50) + '...' : data + '"')
        );
      }

      /**
       * Returns the value of the CKEDITOR if present.
       * @param {Element} textarea
       */
      function getCKEDITORData(textarea) {
        var id = textarea.attr('id');
        return (
          CKEDITOR &&
          CKEDITOR.instances &&
          CKEDITOR.instances[id] &&
          CKEDITOR.instances[id].getData()
        );
      }

      /**
       * Returns the value/text of the element
       * for each paragraph based on the type.
       * @param {Element} paragraphRow
       * @param {String} type
       */
      function getParagraphData(paragraphRow, type) {
        var textData = '';
        switch (type) {
          case 'text':
            var $textarea = paragraphRow.find('textarea.form-textarea');
            var CKEDITORData = getCKEDITORData($textarea);
            textData = CKEDITORData ? CKEDITORData : $textarea.text();
            break;

          case 'background_font':
            textData = paragraphRow.find('input.form-text').val();
            break;

          case 'image':
            textData = paragraphRow
              .find('.media-image .field--name-name')
              .text();
            break;

          case 'hero_teaser':
            textData = paragraphRow
              .find('.field--name-field-title input.form-text')
              .val();
            break;

          case 'text_with_media':
            textData = paragraphRow
              .find('.media-image .field--name-name')
              .text();
            var textData1 = paragraphRow
              .find('.teaser-entity-browser__admin-title')
              .text();
            textData = trimData(textData) + '<br />' + trimData(textData1);
            break;

          case 'text_highlight':
            textData = paragraphRow.find('textarea.form-textarea').val();
            break;

          case 'quicklinks':
            textData = paragraphRow
              .find(
                '.field--name-field-quicklinks-links .form-type-textfield .form-text'
              )
              .val();
            break;

          case 'data_table':
            textData = paragraphRow.find('.label.form-wrapper').text();
            break;

          case 'text_highlight_with_image':
            textData = paragraphRow
              .find('.field--name-field-thwi-title input')
              .val();
            break;

          case 'notification':
            textData = paragraphRow
              .find('.inline-entity-form-taxonomy_term-label')
              .text();
            break;

          default:
            break;
        }

        return textData;
      }

      /**
       * Sets the content of each paragraph.
       * @param {Array} row
       * @param {String} type
       */
      function setContent(row, type) {
        var $row = $(row);
        var $element = $row
          .find(paragraphGuide)
          .find('> .paragraph-type-title');
        var $paragraphRow = $row.find('.paragraphs-subform');
        var text = getParagraphData($paragraphRow, type);

        if (text) {
          text = text.indexOf('<br />') > -1 ? text : trimData(text); // Needed for Image + Teaser to display both

          if ($row.find('.excerpt').length == 0) {
            $element.append(
              '<blockquote class="excerpt expanded"></blockquote>'
            );
          }

          $element.find('.excerpt').html(text);
        }
      }

      function loadExcerption($row) {
        $row.each(function() {
          var paragraphType = $(this)
            .find('.form-wrapper')
            .attr('data-paragraphs-item-bundle');
          setContent($row, paragraphType);
        });
      }

      function updateExcerption($row) {
        loadExcerption($row);
      }

      /**
       * Setting up all the toggler and reference attributes
       * */
      $('.field--widget-entity-reference-paragraphs table.field-multiple-table').each(function(paragraphIndex){
        var $this = $(this); // set reference attribute for the table

        var $paragraphTitles = $this.find('.paragraph-type-title');

        if(!$paragraphTitles.length) {
          return;
        }

        $this.find('> tbody > tr').once('paragraph-item-once').each(function(paragraphRowIndex){
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
            var thisType = $row.find(paragraphGuide).find('> .paragraph-type-title > em').html();
            loadExcerption($row);
          }
        });

        // create overarching toggler
        var togglerText = 'Expand all';

        if ($this.find('> tbody > tr').length <= 1 || ($this.find('> tbody > tr').length && $this.find('> tbody > tr.expanded').length)) {
          togglerText = 'Collapse all';
        }

        $this.find('.field-label').first().once('paragraph-toggle-once').append('<a class="paragraph-toggle" data-paragraph-reference="' + paragraphIndex + '">' + Drupal.t(togglerText) + '</a>');
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
