$(document).ready(function() {
	$(window).scroll(function () { 

		if ($(window).scrollTop() > 200) {
			$('#nav_bar').addClass('navbar-sticky');
		}
		if ($(window).scrollTop() < 175) {
			$('#nav_bar').removeClass('navbar-sticky');
		}
	});

	$('#keywordSearch').submit(function (e) {
		if($('#keywordSearchInput').val() === '') {
			e.preventDefault();
		}
	});
});
