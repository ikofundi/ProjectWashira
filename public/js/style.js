$(document).ready(function() {
    var $element = $('#logo');

    $(window).scroll(function() {

        if ($(this).scrollTop() > 0) {
            $element.fadeOut(1000);
        } else {
            $element.fadeIn(1000);
        }
    });
    $("#bookfundi").mouseenter(function() {
        $(this).css("background-color", "#ebb92f");

    });
    $("#bookfundi").mouseleave(function() {
        $(this).css("background-color", "green");

    });
    $("#bookfundi").mouseenter(function() {
        $("#bookfunditext").css("color", "green");

    });
    $("#bookfundi").mouseleave(function() {
        $("#bookfunditext").css("color", "white");
    });
    $("#bookfundi").mouseenter(function() {
        $("#iko").css("color", "green");

    });
    $("#bookfundi").mouseleave(function() {
        $("#iko").css("color", "#ebb92f");
    });
    $("#navtext").mouseenter(function() {
        $(this).css("color", "green");

    });
    $("#navtext").mouseleave(function() {
        $(this).css("color", "white");
    });
    $("#navtext").mouseenter(function() {
        $(this).css("background-color", "#ebb92f");

    });
    $("#navtext").mouseleave(function() {
        $(this).css("background-color", "green");
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
