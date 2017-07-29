$(document).ready(function() {
	console.log("newFinding.js connected");

	var newBackgroundWordCount = 0;
	var newFindingsWordCount = 0;
	var newImplicationsWordCount = 0;

	var newBackgroundTextArea = document.getElementById('newBackgroundTextArea');
	var newBackgroundWordCountSpan = document.getElementById('newBackgroundWordCountSpan');
	Countable.on(newBackgroundTextArea, function(counter) {
		newBackgroundWordCount = counter.words;
	 	newBackgroundWordCountSpan.textContent = newBackgroundWordCount;
	 	if(newBackgroundWordCount > 150) {
	 		$('#newBackgroundWordCountSpan').addClass('overWordCount');
	 	} else if(newBackgroundWordCount <= 150) {
	 		$('#newBackgroundWordCountSpan').removeClass('overWordCount');
	 	}
	});

	var newFindingsTextArea = document.getElementById('newFindingsTextArea');
	var newFindingsWordCountSpan = document.getElementById('newFindingsWordCountSpan');
	Countable.on(newFindingsTextArea, function(counter) {
		newFindingsWordCount = counter.words;
	 	newFindingsWordCountSpan.textContent = newFindingsWordCount;
	 	if(newFindingsWordCount > 150) {
	 		$('#newFindingsWordCountSpan').addClass('overWordCount');
	 	} else if(newFindingsWordCount <= 150) {
	 		$('#newFindingsWordCountSpan').removeClass('overWordCount');
	 	}
	});

	var newImplicationsTextArea = document.getElementById('newImplicationsTextArea');
	var newImplicationsWordCountSpan = document.getElementById('newImplicationsWordCountSpan');
	Countable.on(newImplicationsTextArea, function(counter) {
		newImplicationsWordCount = counter.words;
	 	newImplicationsWordCountSpan.textContent = newImplicationsWordCount;
	 	if(newImplicationsWordCount > 150) {
	 		$('#newImplicationsWordCountSpan').addClass('overWordCount');
	 	} else if(newImplicationsWordCount <= 150) {
	 		$('#newImplicationsWordCountSpan').removeClass('overWordCount');
	 	}
	});

	//	Suppress form submission on enter keypress in tag / text fields
	$(document).on("keypress", ":input:not(textarea)", function(event) {
	    return event.keyCode != 13;
	});

	//	Show available Subject Groups when Category is changed
	$('#newCategoryList').change(function() {
		$('#newSubjectList').addClass('greyedOut');
		$('#newSubjectList').attr('disabled', true);
	 	$('#newSubjectGroupList').val('');
	 	$('#newSubjectGroupList').removeClass('greyedOut');
	 	$('#newSubjectGroupList').attr('disabled', false);
	 	var selectedCategory = $('#newCategoryList').find(":selected").text();
	 	$('#newSubjectGroupList').find('*').each(function() {
	 		$(this).attr('hidden', false);
	 		if($(this).attr('data-category') != selectedCategory) {
	 			$(this).attr('hidden', true);
	 		}
	 	});
	});

	//	Show available Subjects when Subject Group is changed
	$('#newSubjectGroupList').change(function() {
	 	$('#newSubjectList').val('');
	 	$('#newSubjectList').removeClass('greyedOut');
	 	$('#newSubjectList').attr('disabled', false);
	 	var selectedGroup = $('#newSubjectGroupList').val();
	 	$('#newSubjectList').find('*').each(function() {
	 		$(this).attr('hidden', false);
	 		if($(this).attr('data-group') != selectedGroup) {
	 			$(this).attr('hidden', true);
	 		}
	 	});
	});

	//	Functions to run on document ready
	$('#newCategoryList').trigger('change');
	$('#newSubjectGroupList').addClass('greyedOut');
	$('#newSubjectGroupList').attr('disabled', true);
	$('#newSubjectList').addClass('greyedOut');
	$('#newSubjectList').attr('disabled', true);

});
