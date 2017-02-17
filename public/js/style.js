$(document).ready(function() {
    // var $element = $('#logo');

    // $(window).scroll(function() {

    //     if ($(this).scrollTop() > 0) {
    //         $element.fadeOut(1000);
    //     } else {
    //         $element.fadeIn(1000);
    //     }
    // });
    $(".whyus1").hide();
    $("#stepdiv1").mouseenter(function() {
        $(".whyus1").show();

    });
    $("#stepdiv1").mouseleave(function() {
        $(".whyus1").hide();

    });
   
   
    jQuery(function() {
        var $els = $('div[id^=quote]'),
            i = 0,
            len = $els.length;

        $els.slice(1).hide();
        setInterval(function() {
            $els.eq(i).fadeOut(function() {
                i = (i + 1) % len
                $els.eq(i).fadeIn();
            })
        }, 5500)
    })

});
