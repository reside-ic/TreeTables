const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);

const fakeData = [
    {"tt_key": 1, "tt_parent": 0, name: "CEO"},
    {"tt_key": 2, "tt_parent": 1, name: "CFO"},
    {"tt_key": 3, "tt_parent": 1, name: "CTO"},
    {"tt_key": 4, "tt_parent": 3, name: "Backend dev"},
    {"tt_key": 5, "tt_parent": 3, name: "Frontend dev"}
];

const headers = "<thead><th>Name</th></thead>";

test("immediate parent rows are returned if a child matches the filter", () => {

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false
    });

    $table.DataTable()
        .search("CFO")
        .draw();

    const rows = $table.find("tbody tr");

    expect(rows.length).toBe(2);
    expect($(rows[0]).find("td")[1].textContent).toBe("CEO");
    expect($(rows[1]).find("td")[1].textContent).toBe("CFO");

});

test("all parent rows are returned if a child matches the filter", () => {

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: false
    });

    $table.DataTable()
        .search("backend")
        .draw();

    const rows = $table.find("tbody tr");

    expect(rows.length).toBe(3);
    expect($(rows[0]).find("td")[1].textContent).toBe("CEO");
    expect($(rows[1]).find("td")[1].textContent).toBe("CTO");
    expect($(rows[2]).find("td")[1].textContent).toBe("Backend dev");
});

test("parent rows are returned even if children are hidden", () => {

    const fakeData = [
        {"tt_key": 2, "tt_parent": 0, name: "CFO"},
        {"tt_key": 3, "tt_parent": 0, name: "CTO"},
        {"tt_key": 4, "tt_parent": 3, name: "Backend dev"},
        {"tt_key": 4, "tt_parent": 3, name: "Frontend dev"}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: true
    });

    expect($table.find("tbody tr").length).toBe(2);

    $table.DataTable()
        .search("Backend dev")
        .draw();

    const rows = $table.find("tbody tr");

    expect(rows.length).toBe(1);
    expect($(rows[0]).find("td")[1].textContent).toBe("CTO");

});

test("parent rows are returned even if their value is null if a child matches the filter", () => {

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    const data = [...fakeData,
        {
            "tt_key": 6, "tt_parent": 0, name: null
        },
        {
            "tt_key": 7, "tt_parent": 6, name: "mytestvalue"
        }
    ];

    $table.treeTable({
        data: data,
        columns: [{data: "name"}],
        collapsed: false
    });

    $table.DataTable()
        .search("mytestvalue")
        .draw();

    const rows = $table.find("tbody tr");

    expect(rows.length).toBe(2);
    expect($(rows[0]).find("td")[1].textContent).toBe("");
    expect($(rows[1]).find("td")[1].textContent).toBe("mytestvalue");

});

test("can handle null child rows", () => {

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    const data = [...fakeData,
        {
            "tt_key": 6, "tt_parent": 0, name: "whatever"
        },
        {
            "tt_key": 7, "tt_parent": 6, name: null
        },
        {
            "tt_key": 8, "tt_parent": 6, name: "mytestvalue"
        }
    ];

    $table.treeTable({
        data: data,
        columns: [{data: "name"}],
        collapsed: false
    });

    $table.DataTable()
        .search("mytestvalue")
        .draw();

    const rows = $table.find("tbody tr");

    expect(rows.length).toBe(2);
    expect($(rows[0]).find("td")[1].textContent).toBe("whatever");
    expect($(rows[1]).find("td")[1].textContent).toBe("mytestvalue");

});

