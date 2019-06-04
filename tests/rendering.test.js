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
