const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);

const headers = "<thead><th>Name</th></thead>";

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


test('can sort rows with null data', () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b"},
        {"tt_key": 2, "tt_parent": 4, name: "f"},
        {"tt_key": 3, "tt_parent": 4, name: "d"},
        {"tt_key": 4, "tt_parent": 0, name: null},
        {"tt_key": 5, "tt_parent": 4, name: null}
    ];

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

    expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("b");
    expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("");
    expect($($table.find("tbody tr")[2]).find("td")[1].textContent).toBe("d");
    expect($($table.find("tbody tr")[3]).find("td")[1].textContent).toBe("f");
    expect($($table.find("tbody tr")[4]).find("td")[1].textContent).toBe("");
});
