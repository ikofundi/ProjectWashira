$(document).ready(function() {

    $(".break").hide();
    $("#how").click(function() {
        $(".break").show();
    });
    
    $(".whyus1").hide();
    $("#stepdiv1").mouseenter(function() {
       $(".whyus1").show();

    });
    $("#stepdiv1").mouseleave(function() {
        $(".whyus1").hide();

    });
    $(".whyus2").hide();
    $("#stepdiv2").mouseenter(function() {
        $(".whyus2").show();

    });
    $("#stepdiv2").mouseleave(function() {
        $(".whyus2").hide();

    });
    $(".whyus3").hide();
    $("#stepdiv3").mouseenter(function() {
        $(".whyus3").show();

    });
    $("#stepdiv3").mouseleave(function() {
        $(".whyus3").hide();

    });
    $(".whyus4").hide();
    $("#stepdiv4").mouseenter(function() {
        $(".whyus4").show();

    });
    $("#stepdiv4").mouseleave(function() {
        $(".whyus4").hide();

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
