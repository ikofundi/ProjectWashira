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
    //  $("#bookfundi").mouseenter(function() {
    //     $(".navbar-default").css("background-color", "green");

    // });
    // $("#bookfundi").mouseleave(function() {
    //     $(".navbar-default").css("background-color", "#ebb92f");
    // });
    $("#step1").mouseenter(function() {
       $(this).fadeOut(100);

    });
    $("#step1").mouseleave(function() {
       $(this).fadeIn();
    });
    //     $("#stepdiv2").mouseenter(function() {
    //    $("#step2").attr('src', "/images/accessg.png");

    // });
    // $("#step2").mouseleave(function() {
    //    $(this).attr('src', "/images/access.png");
    // });
    // $("#step3").mouseenter(function() {
    //    $(this).attr('src', "/images/payg.png");

    // });
    // $("#step3").mouseleave(function() {
    //    $(this).attr('src', "/images/pay.png");
    // });
    //  $("#step4").mouseenter(function() {
    //    $(this).attr('src', "/images/fundig.png");

    // });
    // $("#step4").mouseleave(function() {
    //    $(this).attr('src', "/images/fundi.png");
    // });
});
