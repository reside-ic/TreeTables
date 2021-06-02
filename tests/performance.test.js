const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);

const headers = "<thead><th>Name</th></thead>";

function testRenderExpandAndCollapse(fakeData, msToRender = 1000, msToToggle = 100) {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    const start = window.performance.now();

    $table.treeTable({
        data: fakeData,
        columns: [{data: "name"}],
        collapsed: true,
        order: [[1, 'asc']],
        pageLength: 50
    });

    let rendered = window.performance.now();

    expect(rendered - start).toBeLessThan(msToRender);

    $table.data('treeTable')
        .expandAllRows()
        .redraw();

    const expanded = window.performance.now();

    expect(expanded - rendered).toBeLessThan(msToToggle);

    $table.data('treeTable')
        .collapseAllRows()
        .redraw();

    const collapsed = window.performance.now();

    expect(collapsed - expanded).toBeLessThan(msToToggle);
}

test('100 parent rows with children and grandchildren', () => {

    let i = 1;
    const fakeData = [];
    while (i < 600) {
        fakeData.push(
            {"tt_key": i, "tt_parent": 0, name: "parent" + i},
            {"tt_key": i + 1, "tt_parent": i, name: "child" + i},
            {"tt_key": i + 2, "tt_parent": i + 1, name: "grandchild" + i}
        );
        i = i + 3
    }

    testRenderExpandAndCollapse(fakeData, 1200, 200)
});

test('200 parent rows with children and grandchildren', () => {

    let i = 1;
    const fakeData = [];
    while (i < 1200) {
        fakeData.push(
            {"tt_key": i, "tt_parent": 0, name: "parent" + i},
            {"tt_key": i + 1, "tt_parent": i, name: "child" + i},
            {"tt_key": i + 2, "tt_parent": i + 1, name: "grandchild" + i}
        );
        i = i + 3
    }

    testRenderExpandAndCollapse(fakeData, 1200, 200)
});

test('1000 parent rows with children and grandchildren', () => {

    let i = 1;
    const fakeData = [];
    while (i < 6000) {
        fakeData.push(
            {"tt_key": i, "tt_parent": 0, name: "parent" + i},
            {"tt_key": i + 1, "tt_parent": i, name: "child" + i},
            {"tt_key": i + 2, "tt_parent": i + 1, name: "grandchild" + i}
        );
        i = i + 3
    }

    testRenderExpandAndCollapse(fakeData, 3500, 500)
});

test('100 parent rows with 5 children each', () => {

    let i = 1;
    const fakeData = [];
    while (i < 600) {
        fakeData.push(
            {"tt_key": i, "tt_parent": 0, name: "parent" + i},
            {"tt_key": i + 1, "tt_parent": i, name: "child" + i + 1},
            {"tt_key": i + 2, "tt_parent": i, name: "child" + i + 2},
            {"tt_key": i + 3, "tt_parent": i, name: "child" + i + 3},
            {"tt_key": i + 4, "tt_parent": i, name: "child" + i + 4}
        );
        i = i + 5
    }

    testRenderExpandAndCollapse(fakeData, 500)
});

test('4000 parent rows with 5 children each', () => {

    let i = 1;
    const fakeData = [];
    while (i < 24000) {
        fakeData.push(
            {"tt_key": i, "tt_parent": 0, name: "parent" + i},
            {"tt_key": i + 1, "tt_parent": i, name: "child" + i + 1},
            {"tt_key": i + 2, "tt_parent": i, name: "child" + i + 2},
            {"tt_key": i + 3, "tt_parent": i, name: "child" + i + 3},
            {"tt_key": i + 4, "tt_parent": i, name: "child" + i + 4}
        );
        i = i + 5
    }

    testRenderExpandAndCollapse(fakeData, 6000, 750)
});

test('40 parent rows with 3 generations of 2 children each', () => {

    let i = 1;
    const fakeData = [];
    while (i < 600) {
        fakeData.push(
            {"tt_key": i, "tt_parent": 0, name: "parent" + i},
            {"tt_key": i + 1, "tt_parent": i, name: "child" + i + 1},
            {"tt_key": i + 2, "tt_parent": i, name: "child" + i + 2},
            {"tt_key": i + 3, "tt_parent": i + 1, name: "grandchild" + i + 3},
            {"tt_key": i + 4, "tt_parent": i + 2, name: "grandchild" + i + 4},
            {"tt_key": i + 5, "tt_parent": i + 1, name: "grandchild" + i + 5},
            {"tt_key": i + 6, "tt_parent": i + 2, name: "grandchild" + i + 6},
            {"tt_key": i + 7, "tt_parent": i + 3, name: "greatgrandchild" + i + 7},
            {"tt_key": i + 8, "tt_parent": i + 4, name: "greatgrandchild" + i + 8},
            {"tt_key": i + 9, "tt_parent": i + 3, name: "greatgrandchild" + i + 9},
            {"tt_key": i + 10, "tt_parent": i + 4, name: "greatgrandchild" + i + 10},
            {"tt_key": i + 11, "tt_parent": i + 5, name: "greatgrandchild" + i + 11},
            {"tt_key": i + 12, "tt_parent": i + 6, name: "greatgrandchild" + i + 12},
            {"tt_key": i + 13, "tt_parent": i + 5, name: "greatgrandchild" + i + 13},
            {"tt_key": i + 14, "tt_parent": i + 6, name: "greatgrandchild" + i + 14}
        );
        i = i + 15
    }

    testRenderExpandAndCollapse(fakeData, 500)
});