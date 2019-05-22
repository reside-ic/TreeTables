const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);

const fakeData = [
    {"tt_key": 1, "tt_parent": 0, name: "first-parent", hasChild: true},
    {"tt_key": 2, "tt_parent": 1, name: "first-child", hasChild: true},
    {"tt_key": 3, "tt_parent": 2, name: "second-child", hasChild: false},
    {"tt_key": 4, "tt_parent": 0, name: "no-children", hasChild: false}];

const headers = "<thead><th>Key</th>\n" +
    "        <th>Parent</th>\n" +
    "        <th>HasChild</th>\n" +
    "        <th>Name</th></thead>";

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
    $table.data('treeTable');

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
    $table.data('treeTable');

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
        {"tt_key": 1, "tt_parent": 0, name: "b", hasChild: false},
        {"tt_key": 2, "tt_parent": 4, name: "f", hasChild: false},
        {"tt_key": 3, "tt_parent": 4, name: "d", hasChild: false},
        {"tt_key": 4, "tt_parent": 0, name: "a", hasChild: true}];

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

test('rows are sorted initially if order option is provided', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b", hasChild: false},
        {"tt_key": 2, "tt_parent": 4, name: "f", hasChild: false},
        {"tt_key": 3, "tt_parent": 4, name: "d", hasChild: false},
        {"tt_key": 4, "tt_parent": 0, name: "a", hasChild: true}];

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
    expect($($table.find("tbody tr")[3]).find("td")[1].textContent).toBe("b");

});

test('nested child rows are hidden when their parent is', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "parent", hasChild: true},
        {"tt_key": 2, "tt_parent": 1, name: "child", hasChild: true},
        {"tt_key": 3, "tt_parent": 2, name: "grandchild", hasChild: false}
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

