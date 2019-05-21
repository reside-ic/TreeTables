const $ = window.$ = window.jQuery = require("jquery");
require('datatables.net');
require('datatables.net-dt');
require('datatables.net-bs4');
import treeTable from '../treeTable'

treeTable(jQuery);

$(document).ready(function () {

    const fakeData = [
        {key: 1, parent: 0, level: 0, name: "first-parent", hasChild: true},
        {key: 2, parent: 1, level: 1, name: "first-child", hasChild: true},
        {key: 3, parent: 2, level: 2, name: "second-child", hasChild: false},
        {key: 4, parent: 0, level: 0, name: "no-children", hasChild: false}];


    const dt = $('#test-table').treeTable({
        "data": fakeData,
        "columns": [
            {
                "data": "name"
            }]
    });

});