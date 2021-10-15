(function($) {
    "use strict"; // Start of use strict

    $('iframe').on('load', function(){$(this).height($(this).contents().outerHeight());});
})(jQuery); // End of use strict
