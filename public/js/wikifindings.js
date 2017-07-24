$(document).ready(function() {
	console.log("wikifindings.js connected");

	const area = document.getElementById('newBackgroundTextArea')
	const callback = counter => console.log(counter)

	Countable.on(area, callback)
});
