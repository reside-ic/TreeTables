const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);

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

const headers = "<thead><th>Name</th></thead>";

test("can render with null data", () => {

    const fakeData = [
        {"tt_key": 1, "tt_parent": 0, name: "b"},
        {"tt_key": 2, "tt_parent": 0, name: null}
    ];

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        data: fakeData,
        columns: [
            {data: "name"}
        ],
        collapsed: false,
        order: [1, "desc"]
    });

});

test("can render ajax data from simple ajax source", (done) => {

    const fakeData = {
        "data": [
            {"tt_key": 1, "tt_parent": 0, "name": "e"},
            {"tt_key": 2, "tt_parent": 0, "name": "f"}
        ]
    };

    $.ajax = jest.fn().mockImplementation((params) => {
        return Promise.resolve(params.success(fakeData));
    });

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        ajax: "fakeData.json",
        columns: [
            {data: "name"}
        ],
        collapsed: false,
        order: [1, "desc"]
    });

    setTimeout(() => {
        expect($.ajax.mock.calls.length).toBe(1);
        expect($.ajax.mock.calls[0][0].url).toBe("fakeData.json");
        const $dummy = $("#dummy-wrapper table");
        const oSettings = $dummy.dataTable().fnSettings();
        $dummy.trigger("xhr.dt", [oSettings, oSettings.json]);
        setTimeout(() => {
            expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("f");
            expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("e");
            done();
        });
    });

});

test("can render ajax data from object ajax source", (done) => {

    const fakeData = {
        "test": [
            {"tt_key": 1, "tt_parent": 0, "name": "c"},
            {"tt_key": 2, "tt_parent": 0, "name": "d"}
        ]
    };

    $.ajax = jest.fn().mockImplementation((params) => {
        return Promise.resolve(params.success(fakeData));
    });

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        ajax: {url: "fakeData.json", dataSrc: "test"},
        columns: [
            {data: "name"}
        ],
        collapsed: false,
        order: [1, "desc"]
    });

    setTimeout(() => {
        expect($.ajax.mock.calls.length).toBe(1);
        expect($.ajax.mock.calls[0][0].url).toBe("fakeData.json");
        const $dummy = $("#dummy-wrapper table");
        const oSettings = $dummy.dataTable().fnSettings();
        $dummy.trigger("xhr.dt", [oSettings, oSettings.json]);
        setTimeout(() => {
            expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("d");
            expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("c");
            done();
        });
    });

});

test("can render ajax data from function ajax source", (done) => {

    const fakeData = {
        "data": [
            {"tt_key": 1, "tt_parent": 0, "name": "a"},
            {"tt_key": 2, "tt_parent": 0, "name": "b"}
        ]
    };

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        ajax: () => fakeData,
        columns: [
            {data: "name"}
        ],
        collapsed: false,
        order: [1, "desc"]
    });

    setTimeout(() => {
        const $dummy = $("#dummy-wrapper table");
        const oSettings = $dummy.dataTable().fnSettings();
        $dummy.trigger("xhr.dt", [oSettings, oSettings.jqXHR]);
        setTimeout(() => {
            expect($($table.find("tbody tr")[0]).find("td")[1].textContent).toBe("b");
            expect($($table.find("tbody tr")[1]).find("td")[1].textContent).toBe("a");
            done();
        });

    });

});

test("DataTables error is shown if ajax request fails", (done) => {

    $.ajax = jest.fn().mockImplementation((params) => {
        return Promise.resolve(params.error({readyState: 4}));
    });

    window.alert = jest.fn();

    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({
        ajax: "whatever",
        columns: [
            {data: "name"}
        ],
        collapsed: false,
        order: [1, "desc"]
    });

    setTimeout(() => {
        const $dummy = $("#dummy-wrapper table");
        const oSettings = $dummy.dataTable().fnSettings();
        $dummy.trigger("xhr.dt", [oSettings, oSettings.json, oSettings.jqXHR]);
        setTimeout(() => {
            // expect the DataTables error alert to be fired
            expect(window.alert.mock.calls.length).toBe(1);
            expect(window.alert.mock.calls[0][0]).toContain("Ajax error");
            expect($($table.find("tbody tr")[0]).find("td").length).toBe(0);
            done();
        });

    });

});
