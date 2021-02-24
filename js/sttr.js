let corpusText, tokenArray, ttrValues;
jQuery(bindHandlers);

function bindHandlers() {
    $('#corpus-input').change(e => {
        const reader = new FileReader();
        let file = e.target.files[0];
        $(e.target).val('');  // in case user chooses the same file again
        if (file == undefined)
            return;
        reader.readAsText(file);
        reader.onload = ev => {
            corpusText = ev.target.result;
            $('#corpus-textarea').val(corpusText).trigger('input');
        };
    });
    $('#browse-button').click(_ => $('#corpus-input').trigger('click'));
    $('#clear-button').click(_ => {
		$('#corpus-textarea').val('').trigger('input');
		$('tbody#sttr-results tr').remove();
	});
    $('input[type=radio][name=hyphen-behav]').change(preprocessText);
    $('#corpus-textarea').on('input', preprocessText);
    $('#segment-size').change(checkFormValid);
    $('#sttr-form').submit(e => {
        e.preventDefault();
		$('#analyze-button').attr('disabled', true).html('<span class="spinner-border" role="status" aria-hidden="true"></span>');
        analyzeText();
		$('#analyze-button').removeAttr('disabled').html('Submit')
    });
    checkFormValid();
}

function preprocessText() {
    corpusText = $('#corpus-textarea').val();

    corpusText = corpusText
    .trim()
    .toLowerCase()
    .replace(/[,.;:]/g, ' ')  // dots, commas & colons to spaces
    .replace(/[\t\r\n\x0B\x0C\u0085\u2028\u2029]+/g, ' ')  // tabs & all newlines to spaces https://stackoverflow.com/a/34936253/1427771
    .replace(/[~`!@#$%^&*(){}[\]"'<>?\/\\\|_+=]/g, '')  // remove punctuation
    .replace(/[\u2018\u2019\u201C\u201D\u2013\u2014\u2026]/g, '')  // remove fancy single quotes, double quotes, en + em dashes, ellipsis
    .replace(/ - /g, ' ')    // remove standalone hyphens (e.g. abc - def => abs def)
    .replace(/  +/g, ' ');   // change all multiple spaces to one

    let rep;
    if ($('input[name="hyphen-behav"]:checked').val() === 'single')
        rep = '$1$2';  // treating hyphenated words as one token
    else
        rep = '$1 $2';
    corpusText = corpusText.replace(/([^- ])-([^- ])/g, rep);

    if (corpusText === '')
		tokenArray = [];
	else
		tokenArray = corpusText.split(' ');
    $('#corpus-tokencount').html(tokenArray.length);
    checkFormValid();
}

function checkFormValid() {
    let elem = $('#corpus-textarea')[0];

    if (elem.value === '') {
        elem.setCustomValidity('Please fill out this field.');
        return;
    }

    if (tokenArray.length >= parseInt($('#segment-size').val()))
        elem.setCustomValidity('');
    else
        elem.setCustomValidity('Token count is less than segment size. Please paste a longer piece of text.');
}

function analyzeText() {
    let offset = 0, segSize = parseInt($('#segment-size').val()), count = 0, subArray, segmentTTR, sum = 0;
    ttrValues = [];
    let until = offset + segSize;
    while (until <= tokenArray.length) {
        subArray = tokenArray.slice(offset, until);
        // use ES6 Set to get unique tokens
        segmentTTR = (new Set(subArray)).size / subArray.length;
        ttrValues.push(segmentTTR);
        sum += segmentTTR;
        count += 1;
        offset = until;
        until += segSize;
    }

    if (count === 0)  // failsafe
        return;

    // last element in array is average STTR
    ttrValues.push(sum / count);
    displayResults(ttrValues);
}

function displayResults(ttrValues) {
    $('tbody#sttr-results tr').remove();
    let value, i;
    for (i = 0; i < ttrValues.length - 1; i++) {
        value = Math.round(ttrValues[i] * 1000) / 10;
        $('tbody#sttr-results').append(`<tr><td>${i + 1}</td><td>${value}%</td></tr>`);
    }
    value = Math.round(ttrValues[i] * 1000) / 10;
    $('tbody#sttr-results').append(`<tr class="table-primary"><th>Average</th><th>${value}%</th></tr>`);
}
