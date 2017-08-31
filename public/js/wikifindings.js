$(document).ready(function() {
	console.log("wikifindings.js connected");

	$(window).scroll(function () { 

		if ($(window).scrollTop() > 200) {
			$('#nav_bar').addClass('navbar-sticky');
		}
		if ($(window).scrollTop() < 175) {
			$('#nav_bar').removeClass('navbar-sticky');
		}
	});

});
