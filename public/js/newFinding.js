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
	 	var selectedGroup = $('#newSubjectGroupList').find(":selected").text();
	 	$('#newSubjectList').find('*').each(function() {
	 		$(this).attr('hidden', false);
	 		if($(this).attr('data-group') != selectedGroup) {
	 			$(this).attr('hidden', true);
	 		}
	 	});
	});

	//	Search for preceding Finding
	var precedents = [];
	$('#precedentSearchBtn').click(function() {
		$('.findingSearchWarning').text('');			// Clears any previous 'not found' warning
		var val = $('#precedingID').val();
		if(!val) {
			return;										// Take no action if no search string provided
		}
		for(var i = 0; i < precedents.length; i++) {
			if(precedents[i] === val) {
				return;									// Take no action if search string already used
			}
		}
		var sidUrl = '/findings/i/' + val;
		$.ajax(sidUrl).done(function(finding) {
			if(finding) {
				var DOMString = '<div class="precedentTitle"><input type="checkbox" checked="checked" name="finding[precededBy]" value="' + finding._id + '">' 
					+ finding.title 
					+ '<br>'
					+ finding.citation.full
					+ '</input></div>';
				$('#precedentFindings').append(DOMString);
				precedents.push(val);
			} else {
				$('#precedingSearchWarning').text('Finding with ID ' + val + ' not found...');
			}
		});
	});

	//	Search for following Finding
	var following = [];
	$('#followingSearchBtn').click(function() {
		$('.findingSearchWarning').text('');
		var val = $('#followingID').val();
		if(!val) {
			return;
		}
		for(var i = 0; i < following.length; i++) {
			if(following[i] === val) {
				return;
			}
		}
		var sidUrl = '/findings/i/' + val;
		$.ajax(sidUrl).done(function(finding) {
			if(finding) {
				var DOMString = '<div class="precedentTitle"><input type="checkbox" checked="checked" name="finding[followedBy]" value="' + finding._id + '">' 
					+ finding.title 
					+ '<br>'
					+ finding.citation.full
					+ '</input></div>';
				$('#followingFindings').append(DOMString);
				following.push(val);
			} else {
				$('#followingSearchWarning').text('Finding with ID ' + val + ' not found...');
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
