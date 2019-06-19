const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);

const fakeData = [
    {"tt_key": 4, "tt_parent": 0, name: "first-parent"},
    {"tt_key": 5, "tt_parent": 4, name: "first-child"},
    {"tt_key": 6, "tt_parent": 5, name: "second-child"},
    {"tt_key": 7, "tt_parent": 0, name: "no-children"}];

const headers = "<thead><th>Name</th></thead>";

test('begins with child rows collapsed if collapsed: true', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: true});
    expect($table.find("tbody tr").length).toBe(2);
});

test('begins with child rows expanded if collapsed: false', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: false});
    expect($table.find("tbody tr").length).toBe(4);
});

test('starting collapsed can toggle child rows when row is clicked', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: true});

    expect($table.find("tbody tr").length).toBe(2);

    $table.find("tbody td.tt-details-control").trigger('click');
    expect($table.find("tbody tr").length).toBe(3);

    $table.find("tbody td.tt-details-control").trigger('click');
    expect($table.find("tbody tr").length).toBe(2);
});

test('starting with all rows open can toggle child rows when row is clicked', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: false});

    expect($table.find("tbody tr").length).toBe(4);

    $table.find("tbody td.tt-details-control").trigger('click');
    expect($table.find("tbody tr").length).toBe(2);

    $table.find("tbody td.tt-details-control").trigger('click');
    expect($table.find("tbody tr").length).toBe(4);
});

test('rows with children have has-child css class', () => {

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: false});

    expect($($table.find("tbody tr")[0]).hasClass("has-child")).toBe(true);
    expect($($table.find("tbody tr")[1]).hasClass("has-child")).toBe(true);
    expect($($table.find("tbody tr")[2]).hasClass("has-child")).toBe(false);

});

test('nested child rows are hidden when their parent is', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent"},
        {"tt_key": 2, "tt_parent": 1, name: "child"},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [[1, 'asc']]
    });

    const parentRow = $($table.find("tbody tr")[0]);
    expect(parentRow.find("td")[1].textContent).toBe("parent");
    expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("child");
    expect($($table.find("tbody tr")[2]).find("td")[1].textContent).toBe("grandchild");

    parentRow.find("td.tt-details-control").trigger("click");
    expect($table.find("tbody tr").length).toBe(1)
});

test('can collapse all rows', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent"},
        {"tt_key": 2, "tt_parent": 1, name: "child"},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [[1, 'asc']]
    });

    expect($table.find("tbody tr").length).toBe(3);
    expect($table.find("tbody tr.open").length).toBe(2);

    $table.data('treeTable')
        .collapseAllRows()
        .redraw();

    expect($table.find("tbody tr").length).toBe(1);
    expect($table.find("tbody tr.open").length).toBe(0);
});

test('can collapse all rows and then toggle one', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent"},
        {"tt_key": 2, "tt_parent": 1, name: "child"},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [[1, 'asc']]
    });

    expect($table.find("tbody tr").length).toBe(3);
    expect($table.find("tbody tr.open").length).toBe(2);

    $table.data('treeTable')
        .collapseAllRows()
        .redraw();

    expect($table.find("tbody tr").length).toBe(1);
    expect($table.find("tbody tr.open").length).toBe(0);

    const parentRow = $($table.find("tbody tr")[0]);
    expect(parentRow.find("td")[1].textContent).toBe("parent");

    parentRow.find("td.tt-details-control").trigger("click");
    expect($table.find("tbody tr").length).toBe(2);

    // parent row is now open
    expect(parentRow.hasClass("open")).toBe(true);

    // child row is not open
    expect($($table.find("tbody tr")[1]).hasClass("open")).toBe(false);

});

test('can toggle one row then collapse all', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent"},
        {"tt_key": 2, "tt_parent": 1, name: "child"},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [[1, 'asc']]
    });

    expect($table.find("tbody tr").length).toBe(3);
    expect($table.find("tbody tr.open").length).toBe(2);

    const childRow = $($table.find("tbody tr")[1]);
    childRow.find("td.tt-details-control").trigger("click");

    expect($table.find("tbody tr").length).toBe(2);
    expect($table.find("tbody tr.open").length).toBe(1);

    $table.data('treeTable')
        .collapseAllRows()
        .redraw();

    expect($table.find("tbody tr").length).toBe(1);
    expect($table.find("tbody tr.open").length).toBe(0);
});

test('can expand all rows', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent"},
        {"tt_key": 2, "tt_parent": 1, name: "child"},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: true,
        order: [[1, 'asc']]
    });

    expect($table.find("tbody tr").length).toBe(1);
    expect($table.find("tbody tr.open").length).toBe(0);

    $table.data('treeTable')
        .expandAllRows()
        .redraw();

    expect($table.find("tbody tr").length).toBe(3);
    expect($table.find("tbody tr.open").length).toBe(2);
});

test('can expand all rows and then toggle one', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent"},
        {"tt_key": 2, "tt_parent": 1, name: "child"},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: true,
        order: [[1, 'asc']]
    });

    $table.data('treeTable')
        .expandAllRows()
        .redraw();

    expect($table.find("tbody tr").length).toBe(3);
    expect($table.find("tbody tr.open").length).toBe(2);

    const childRow = $($table.find("tbody tr")[1]);
    childRow.find("td.tt-details-control").trigger("click");

    expect($table.find("tbody tr").length).toBe(2);

    // parent row is still open
    expect($($table.find("tbody tr")[0]).hasClass("open")).toBe(true);

    // child row is not open
    expect(childRow.hasClass("open")).toBe(false);

});

test('can toggle one row then expand all', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent"},
        {"tt_key": 2, "tt_parent": 1, name: "child"},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [[1, 'asc']]
    });

    expect($table.find("tbody tr").length).toBe(3);
    expect($table.find("tbody tr.open").length).toBe(2);

    const childRow = $($table.find("tbody tr")[1]);
    childRow.find("td.tt-details-control").trigger("click");

    expect($table.find("tbody tr").length).toBe(2);
    expect($table.find("tbody tr.open").length).toBe(1);

    $table.data('treeTable')
        .expandAllRows()
        .redraw();

    expect($table.find("tbody tr").length).toBe(3);
    expect($table.find("tbody tr.open").length).toBe(2);
});
