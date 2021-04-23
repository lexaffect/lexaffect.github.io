let corpusText, tokenArray;

jQuery(function bindHandlers() {
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
		$('#sttr-results').val('');
        $('#segment-count').html('');
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
});

function preprocessText() {
    corpusText = $('#corpus-textarea').val();

    // https://en.wikipedia.org/wiki/Bullet_(typography)#In_Unicode
    let bulletsRe = /[\u2022\u2023\u2043\u204C\u204D\u2219\u25CB\u25D8\u25E6\u2619\u2765\u2767\u29BE\u29BF]/g;

	corpusText = corpusText
      .trim()
      .toLowerCase()
      .replace(/[,.;:\/\u2013\u2014&+*=~]/g, ' ')// change dot/comma/colon/forward-slash/en/emdash and more to spaces
      .replace(/[`!@#$%^(){}[\]"'<>?\|_]/g, '')  // remove most other punctuation
      .replace(/[“”‘’\u2026]/g, '')              // remove fancy double quotes, single quotes, ellipsis
      .replace(/-{2,}/g, ' ')                    // remove sequences of hyphens (p ---- q => p   q)
      .replace(/\s-\s/g, ' ')                    // remove standalone hyphens (abc - def => abc def)
      .replace(/([^\s])-\s/g, '$1 ')             // ...and hyphens with space on right side only (abc- def => abc def)
      .replace(/\s-([^\s])/g, ' $1')             // ...or left side only (abc -def => abc def)
      .replace(bulletsRe, ' ')                   // change all bullets to space
      .replace(/\s+/g, ' ');                     // change all whitespace chunks to a single space

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
    let until = offset + segSize;
    while (until <= tokenArray.length) {
        subArray = tokenArray.slice(offset, until);
        // use ES6 Set to get unique tokens
        segmentTTR = (new Set(subArray)).size / subArray.length;
        sum += segmentTTR;
        count += 1;
        offset = until;
        until += segSize;
    }

    if (count === 0)  // failsafe
        return;

    // remove the last discarded segment, if there is one
    if (offset < tokenArray.length-1)
        tokenArray.splice(offset);

    // last element in array is average STTR
    let msttr = sum / count;
    displayResults(msttr, count);
}

function displayResults(msttr, count) {
    let value = Math.round(msttr * 1000) / 10;  // round off to 1 digit
    $('#sttr-results').val(value + '%');
    $('#segment-count').html(count);
    $('#corpus-textarea').val(tokenArray.join(' '));
    $('#corpus-tokencount').html(tokenArray.length);
}
