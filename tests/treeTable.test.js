const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);

const fakeData = [
    {"tt_key": 1, "tt_parent": 0, name: "first-parent"},
    {"tt_key": 2, "tt_parent": 1, name: "first-child"},
    {"tt_key": 3, "tt_parent": 2, name: "second-child"},
    {"tt_key": 4, "tt_parent": 0, name: "no-children"}];

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

    $table.find("tbody tr").trigger('click');
    expect($table.find("tbody tr").length).toBe(3);

    $table.find("tbody tr").trigger('click');
    expect($table.find("tbody tr").length).toBe(2);
});

test('starting with all rows open can toggle child rows when row is clicked', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: false});

    expect($table.find("tbody tr").length).toBe(4);

    $table.find("tbody tr").trigger('click');
    expect($table.find("tbody tr").length).toBe(2);

    $table.find("tbody tr").trigger('click');
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

test('rows are sorted by top level parents first', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b"},
        {"tt_key": 2, "tt_parent": 4, name: "f"},
        {"tt_key": 3, "tt_parent": 4, name: "d"},
        {"tt_key": 4, "tt_parent": 0, name: "a"}];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: false});

    const dt = $table.DataTable();

    dt.order([1, 'asc'])
        .draw();

    expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("a");
    expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("d");
    expect($($table.find("tbody tr")[2]).find("td")[1].textContent).toBe("f");
    expect($($table.find("tbody tr")[3]).find("td")[1].textContent).toBe("b");

});

test('rows are sorted (asc) initially if order option is provided', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b"},
        {"tt_key": 2, "tt_parent": 4, name: "f"},
        {"tt_key": 3, "tt_parent": 4, name: "d"},
        {"tt_key": 4, "tt_parent": 0, name: "a"},
        {"tt_key": 5, "tt_parent": 0, name: "a"}];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [[1, 'asc']]
    });

    expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("a");
    expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("d");
    expect($($table.find("tbody tr")[2]).find("td")[1].textContent).toBe("f");
    expect($($table.find("tbody tr")[3]).find("td")[1].textContent).toBe("a");
    expect($($table.find("tbody tr")[4]).find("td")[1].textContent).toBe("b");

});

test('rows are sorted (desc) initially if order option is provided', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b"},
        {"tt_key": 2, "tt_parent": 4, name: "f"},
        {"tt_key": 3, "tt_parent": 4, name: "d"},
        {"tt_key": 4, "tt_parent": 0, name: "a"},
        {"tt_key": 5, "tt_parent": 0, name: "a"}];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [[1, 'desc']]
    });

    expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("b");
    expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("a");
    expect($($table.find("tbody tr")[2]).find("td")[1].textContent).toBe("f");
    expect($($table.find("tbody tr")[3]).find("td")[1].textContent).toBe("d");
    expect($($table.find("tbody tr")[4]).find("td")[1].textContent).toBe("a");

});

test('rows can be re-sorted', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b"},
        {"tt_key": 2, "tt_parent": 4, name: "f"},
        {"tt_key": 3, "tt_parent": 4, name: "d"},
        {"tt_key": 4, "tt_parent": 0, name: "a"}];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false,
        order: [1, "desc"]
    });

    expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("b");

    $table.DataTable()
        .order([1, "asc"])
        .draw();

    expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("a");
    expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("d");
    expect($($table.find("tbody tr")[2]).find("td")[1].textContent).toBe("f");
    expect($($table.find("tbody tr")[3]).find("td")[1].textContent).toBe("b");
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

    parentRow.trigger("click");
    expect($table.find("tbody tr").length).toBe(1)
});

test('can collapse all rows', async () => {

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

    parentRow.trigger("click");
    expect($table.find("tbody tr").length).toBe(2);

    // parent row is now open
    expect(parentRow.hasClass("open")).toBe(true);

    // child row is not open
    expect($($table.find("tbody tr")[1]).hasClass("open")).toBe(false);

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
    childRow.trigger("click");

    expect($table.find("tbody tr").length).toBe(2);

    // parent row is still open
    expect($($table.find("tbody tr")[0]).hasClass("open")).toBe(true);

    // child row is not open
    expect(childRow.hasClass("open")).toBe(false);

});

test("custom cell render functions are executed and don't affect row sorting", () => {

    const headers = "<thead><th>Custom col</th><th>Name</th></thead>";

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b"},
        {"tt_key": 2, "tt_parent": 4, name: "f"},
        {"tt_key": 3, "tt_parent": 4, name: "d"},
        {"tt_key": 4, "tt_parent": 0, name: "a"}];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [
            {data: "name", render: () => "TEST"},
            {data: "name"}
        ],
        collapsed: false,
        order: [1, "desc"]
    });

    $table.DataTable()
        .order([1, "asc"])
        .draw();

    expect($($table.find("tbody tr")[0]).find("td")[2].textContent).toBe("a");
    expect($($table.find("tbody tr")[1]).find("td")[2].textContent).toBe("d");
    expect($($table.find("tbody tr")[2]).find("td")[2].textContent).toBe("f");
    expect($($table.find("tbody tr")[3]).find("td")[2].textContent).toBe("b");

    expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("TEST");
    expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("TEST");
    expect($($table.find("tbody tr")[2]).find("td")[1].textContent).toBe("TEST");
    expect($($table.find("tbody tr")[3]).find("td")[1].textContent).toBe("TEST");

});
