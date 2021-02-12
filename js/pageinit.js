const dtOptions = {
    data: synsdata.data,
    columns: [ { render: renderCell } ],
    ordering: false,
    searchHighlight: true,
    stripeClasses: ['table-success', 'table-primary'],
    processing: true,
    scrollResize: true,
    scrollY: '300', // value will be overridden by scrollResize (if enabled)
    scrollCollapse: true,
    paging: false,
    language: {
        processing: '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>',
        info: '_TOTAL_ rows',
        infoEmpty: '_TOTAL_ rows',
        infoFiltered: '(out of _MAX_)'
    },
    initComplete: enableToolTips,
    dom: "<'row'<'col-12'tr>><'row'<'col-12 text-center small'i>>",    
};

let dataTable;

// jQuery on doc ready
$( () => {
    // initialize datatable. Re-enable tooltips on table redraw (needed when paging is on)
    dataTable = $('#tbl').DataTable(dtOptions).on('draw', enableToolTips);

    // Enable switching views on navbar and back buttons
    $('.navbar-brand, .nav-item, .back-home').click( (e) => {
        e.preventDefault();
        targetIndex = $(e.target).data().slidesTarget;
        $('.navbar-collapse').collapse('hide');
        switchViews(targetIndex);
    } );

    // Define searchbox functionality
    let searchBox = $('#th-search-box');
    searchBox.on('keyup search', function(e) {
        let txt = this.value;
        // Do not search on 1 or 2 letters, very inefficient
        if (txt.length >= 3) {
            dataTable.search(txt).draw();
        }
        else if (txt == '') {
            // Ensure we clear the search if user backspaces all thy way (or clears textbox by Esc)
            dataTable.search('').draw();
        }
    });
    searchBox.focus(); // active on page load
});

function switchViews(target) {
    $('div.slides').hide(0, ()=> $(`div.slides[data-slide-index="${target}"]`).show(0) );    
}

function renderCell(d, t, row) {
    let focality = row.focality, categ = row.categ, subcat = row.subcat;
    let focalities = {
        'Affect Non-Focal' : 'N',
        'Affect Focal' : 'F'
    },
    categories = {
        'Cognitive Conditions' : 'CC',
        'Cognitive-Behavioral Conditions': 'CB',
        'Affective States' : 'AS',
        'Affective-Cognitive Conditions' : 'AC',
        'Affective-Behavioral Conditions' : 'AB'
    },
    subcategories = {
        'Frames of Mind' : 'F',
        'States' : 'S',
        'State-like Conditions' : 'L'
    };

    let wordClassAbbrev = focalities[focality] + ',' + categories[categ] + ',' + subcategories[subcat];
    let wordTooltip = focality + ' &gt; ' + categ + ' &gt; ' + subcat;

    contents = `
    <p class="float-right">
        <abbr class="initialism" data-toggle="tooltip" title="${wordTooltip}">${wordClassAbbrev}</abbr>
    </p>
    <p>
        <span class="font-weight-bold" >${row.phrase}</span>
    </p>`;

    if (row.synswnet) {
        contents += `<p>${row.synswnet}</p><hr style="width: 90%;">`;
    }
    
    if (row.synswebst) {
        contents += `<p>${row.synswebst}</p>`
    }

    return contents;
}

function enableToolTips() {
    $('[data-toggle="tooltip"]').tooltip({ placement: 'auto' })
}
