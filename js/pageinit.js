const dtOptions = {
    data: synsdata.data,
    columns: [ { render: renderCell } ],
    // pageLength: 10,
    ordering: false,
    // lengthMenu: [ [10, 20, 50, 100, -1], [10, 20, 50, 100, 'All'] ],
    searchHighlight: true,
    stripeClasses: ['table-success', 'table-primary'],
    processing: true,
    // scrollResize: true,
    scrollY: '70vh', // value will be overridden by scrollResize if enabled
    paging: false,
    language: {
        // paginate: {
        //     next: '<span aria-hidden="true" aria-label="Next">&raquo;</span>',
        //     previous: '<span aria-hidden="true" aria-label="Previous">&laquo;</span>'
        // },
        // lengthMenu: '_MENU_ pp',
        processing: '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>'
    },
    // Swap search box and page size dropdown: https://datatables.net/reference/option/dom
    dom: "<'row'<'col-6'f><'col-6'l>>" + "<'row'<'col-sm-12'tr>>" + 
         "<'row'<'col-sm-12'i><'col-sm-12 col-md-5'p>>",
    initComplete: onTableLoad
};

// initialize datatable on doc ready. Enable tooltips whenever table is redrawn
let dataTable;
$( () => {
    dataTable = $('#tbl').DataTable(dtOptions).on('draw', enableToolTips);    

    $('.navbar-brand, .nav-item, .back-home').click( (e) => {
        e.preventDefault();
        targetIndex = $(e.target).data().slidesTarget;
        $('.navbar-collapse').collapse('hide');
        switchViews(targetIndex);
    } );
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

    if (row.synswnet)
        contents += `<h6>Set 1</h6><p>${row.synswnet}</p>`;
    
    if (row.synswebst)
        contents += `<h6>Set 2</h6><p>${row.synswebst}</p>`

    return contents;
}

function onTableLoad() {
    let searchBox = $('div.dataTables_filter input');
    searchBox.off(); // Remove default datatable search logic
    searchBox.on('input', (e) => {
        let txt = searchBox.val()
        if (txt.length >= 3) {
            dataTable.search(txt).draw();
        }
        else if (txt == '') { // Ensure we clear the search if user backspaces far enough
            dataTable.search('').draw();
        }
    });
    searchBox.focus();
    $('.carousel').carousel({interval: false}) // initialize without auto sliding

    enableToolTips()
}

function enableToolTips() {
    $('[data-toggle="tooltip"]').tooltip({ placement: 'auto' })
}
