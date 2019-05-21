const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net')(window, $);
require("../treeTable")(window, $);
const sinon = require("sinon");

const fakeData = [
    {key: 1, parent: 0, level: 0, name: "first-parent", hasChild: true},
    {key: 2, parent: 1, level: 1, name: "first-child", hasChild: true},
    {key: 3, parent: 2, level: 2, name: "second-child", hasChild: false},
    {key: 4, parent: 0, level: 0, name: "no-children", hasChild: false}];

const headers = "<thead><th></th>\n" +
    "        <th>Path</th>\n" +
    "        <th>Key</th>\n" +
    "        <th>Parent</th>\n" +
    "        <th>HasChild</th>\n" +
    "        <th>Name</th></thead>";

test('begins with child rows collapsed if collapsed: true', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: true});
    $table.data('treeTable');
    expect($table.find("tbody tr").length).toBe(2);
});

test('begins with child rows expanded if collapsed: false', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}], collapsed: false});
    $table.data('treeTable');
    expect($table.find("tbody tr").length).toBe(4);
});

test('toggles child rows when row is clicked', () => {
    const $table = $(document.createElement('table'));
    $table.append($(headers));

    $table.treeTable({data: fakeData, columns: [{data: "name"}]});
    var plugin = $table.data('treeTable');

    plugin.toggleChildRows = sinon.spy();

    $table.find("tbody tr").trigger('click');
    expect(plugin.toggleChildRows.called).toBe(true);
});