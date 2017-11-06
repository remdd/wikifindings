$(document).ready(function() {
	console.log('newfinding.js connected...');
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

	//	Form validation fixes
	$('#submitBtn').click(function() {
		if(newBackgroundWordCount > 200) {
			alert("The 'Background' field must contain fewer than 200 hundred words - ideally no more than 150.");
			return false;
		}
		if(newFindingsWordCount > 200) {
			alert("The 'Findings' field must contain fewer than 200 hundred words - ideally no more than 150.");
			return false;
		}
		if(newImplicationsWordCount > 200) {
			alert("The 'Implications' field must contain fewer than 200 hundred words - ideally no more than 150.");
			return false;
		}
		var authors = $('#citation_authors').has("option").length;
		if(authors === 0) {
			alert("You must enter at least one of the authors of the the original research article.");
			return false;
		}
	});

	$('#imageUploadInput').on('change', function() {
		if(typeof(FileReader) == "undefined") {
			alert("Your browser does not support HTML5, which is required for this functionality.");
		} else {
			var container = $("#imagePreview");
			container.empty();
			var reader = new FileReader();
			reader.onload = function(e) {
				$('<img />', {'src': e.target.result }).appendTo(container);
				$('#imageUploadData').val(e.target.result);
			}
			reader.readAsDataURL($(this)[0].files[0]);
		}
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
 		$('#newSubjectName').attr('disabled', true);
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
 		$('#newSubjectName').attr('disabled', false);
	});

	//	Search for preceding Finding
	$('#precedentSearchBtn').click(function() {
		$('.findingSearchWarning').text('');			// Clears any previous 'not found' warning
		var val = $('#precedingID').val();
		if(!val) {
			return;										// Take no action if no search string provided
		}
		var sidUrl = '/findings/i/' + val;
		$.ajax(sidUrl).done(function(finding) {
			if(finding) {
				var add = true;
				$('.precedingTitle').each(function() {
					if($(this).children().first().val() === finding._id) {				//	Checks value of input elements that are children to .precedingTitle class divs
						add = false;
					}
				});
				if(add) {
					var DOMString = '<div class="precedingTitle relativeTitle"><input type="checkbox" checked="checked" name="finding[precededBy]" value="' + finding._id + '">' 
						+ finding.title 
						+ '<br>'
						+ finding.citation.full
						+ '</input></div>';
					$('#precedentFindings').append(DOMString);
					$('#precedingID').val('');
				} else {
					$('#precedingSearchWarning').text('Finding ' + val + ' is already listed.');
				}
			} else {
				$('#precedingSearchWarning').text('Finding with ID ' + val + ' not found...');
			}
		});
	});

	//	Search for following Finding
	$('#followingSearchBtn').click(function() {
		$('.findingSearchWarning').text('');
		var val = $('#followingID').val();
		if(!val) {
			return;
		}
		var sidUrl = '/findings/i/' + val;
		$.ajax(sidUrl).done(function(finding) {
			if(finding) {
				var add = true;
				$('.followingTitle').each(function() {
					if($(this).children().first().val() === finding._id) {
						add = false;
					}
				});
				if(add) {
					var DOMString = '<div class="followingTitle relativeTitle"><input type="checkbox" checked="checked" name="finding[followedBy]" value="' + finding._id + '">' 
						+ finding.title 
						+ '<br>'
						+ finding.citation.full
						+ '</input></div>';
					$('#followingFindings').append(DOMString);
					$('#followingID').val('');
				} else {
					$('#followingSearchWarning').text('Finding ' + val + ' is already listed.');
				}
			} else {
				$('#followingSearchWarning').text('Finding with ID ' + val + ' not found...');
			}
		});
	});

	//	Display 'add new subject' fields on click
	$('#showAddDiv').click(function() {
		$('.addSubjectDiv').toggle('fast');
		var newColor = randomColor();
		$('#newSubjectColor').attr('value', newColor);
	});

	//	Add new subject
	$('#addSubjectBtn').click(function() {
		var newSubject = {
			subject: {
				subjectName: $('#newSubjectName').val(),
				subjectColor: $('#newSubjectColor').val()
			},
			subjectGroup: $('#newSubjectGroupList').val()
		}
		$.ajax("/tree/newSubject", {
			data: newSubject,
			type: 'post'
		}).done(function(response) {
			$('#newSubjectName').val('');
			$('#addSubjectWarning').text(response.msg);
			if(response.subjectId) {
				$('#newSubjectList').append('<option selected value="' + response.subjectId + '" label="' + response.subjectName + '">' + response.subjectName + '</option>');
			}
			$('.addSubjectDiv').toggle('fast');
		});
	});

	//	AJAX call to Crossref.org to autofill from DOI key
	$('#checkDOI').click(checkDOI);
	function checkDOI() {
		var DOI = $('#citation_DOI').val();
		var URL = 'https://api.crossref.org/works/' + DOI;
		$.ajax({
			url: URL,
			error: function() {
				$('#DOIWarning').html("<span class='warningSpan'>Warning</span>: DOI <strong>" + DOI + "</strong> did not resolve at <a href='https://www.crossref.org'>crossref.org</a>.");
			},
			success: function() {
				$('#DOIWarning').html("<span class='successSpan'>Success</span>: DOI <strong>" + DOI + "</strong> found on <a href='https://www.crossref.org'>crossref.org</a> and autofilled where possible.")
			}
		}).done(function(res) {
			if(res.status === 'ok') {
				//	Clear any previous form values
				$('#citation_title, #citation_journal, #citation_year, #citation_location').val('');
				$('#citation_authors').tagsinput('removeAll');

				//	Get & Set new values	
				console.log(res);
				if(res.message.title) {
					$('#citation_title').val(res.message.title);
				}
				if(res.message['container-title']) {
					$('#citation_journal').val(res.message['container-title']);
				}

				//	Get & Set year of publication
				var year, created, print, online;
				if(res.message.created['date-time']) {
					created = (parseInt(res.message.created['date-time']));
					year = created;
					console.log(created);
				} if(res.message['published-print'] && res.message['published-print']['date-parts'][0][0]) {
					print = (parseInt(res.message['published-print']['date-parts'][0][0]));
					console.log(print);
					if(print < year) {
						year = print;
					}
				} if(res.message['published-online'] && res.message['published-online']['date-parts'][0][0]) {
					online = (parseInt(res.message['published-online']['date-parts'][0][0]));
					console.log(online);
					if(online < year) {
						year = online;
					}
				}
				if(year !== undefined) {
					$('#citation_year').val(year);
				}

				//	Get & Set location in publication
				var location = '';
				if(res.message.volume) {
					location += res.message.volume;
				} if(res.message.issue) {
					location += '(' + res.message.issue + ')';
				} if(res.message.page) {
					location += ':' + res.message.page;
				}
				if(location != '') {
					$('#citation_location').val(location);
				}
				if(res.message.author && res.message.author.length > 0) {
					var authors = [];
					for(var i = 0; i < res.message.author.length; i++) {
						var author;
						if(res.message.author[i].family) {
							author = res.message.author[i].family;
						} if(res.message.author[i].given) {
							author += ' ';
							var forenames = res.message.author[i].given.split(/\W+/);			//	Split given name string at one or more non-word characters
							forenames.forEach(function(forename) {
								author += forename.slice(0,1)									//	Concatenate first initial of each forename to 'author' string
							});
						}
						authors.push(author);
					}
					authors.forEach(function(author) {
						$('#citation_authors').tagsinput('add', author);
					});
				} 
			}
		});
		return false;
	}

	//	Functions to run on document ready
	$('#newCategoryList').trigger('change');
	$('#newSubjectGroupList').addClass('greyedOut');
	$('#newSubjectGroupList').attr('disabled', true);
	$('#newSubjectList').addClass('greyedOut');
	$('#newSubjectList').attr('disabled', true);

});
