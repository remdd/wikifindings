$(document).ready(function() {
	console.log("wikifindings.js connected");

	$(window).scroll(function () { 
		console.log($(window).scrollTop());

		if ($(window).scrollTop() > 174) {
			$('#nav_bar').addClass('navbar-sticky');
		}
		if ($(window).scrollTop() < 175) {
			$('#nav_bar').removeClass('navbar-sticky');
		}
	});

});
