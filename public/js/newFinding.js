$(document).ready(function() {
	console.log("wikifindings.js connected");

	var newBackgroundTextArea = document.getElementById('newBackgroundTextArea');
	var newBackgroundWordCountSpan = document.getElementById('newBackgroundWordCountSpan');
	Countable.on(newBackgroundTextArea, function(counter) {
	 	newBackgroundWordCountSpan.textContent = counter.words;
	});

	var newFindingsTextArea = document.getElementById('newFindingsTextArea');
	var newFindingsWordCountSpan = document.getElementById('newFindingsWordCountSpan');
	Countable.on(newFindingsTextArea, function(counter) {
	 	newFindingsWordCountSpan.textContent = counter.words;
	});

	var newImplicationsTextArea = document.getElementById('newImplicationsTextArea');
	var newImplicationsWordCountSpan = document.getElementById('newImplicationsWordCountSpan');
	Countable.on(newImplicationsTextArea, function(counter) {
	 	newImplicationsWordCountSpan.textContent = counter.words;
	});

});
