(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($) {
            return factory($, window, document);
        });
    }
    else if (typeof exports === 'object') {
        // CommonJS
        module.exports = function (root, $) {
            if (!root) {
                root = window;
            }

            if (!$ || !$.fn.dataTable) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory($, root, root.document);
        };
    }
    else {
        // Browser
        factory(jQuery, window, document);
    }
}(function ($) {

    function compareObjectDesc(a, b) {
        if (!a || !b) {
            return 0
        }
        if (a.key !== b.key) {
            return ((a.value < b.value) ? 1 : ((a.value > b.value) ? -1 : 0));
        } else if (typeof a.child === 'undefined' && typeof b.child === 'undefined') {
            return ((a.value < b.value) ? 1 : ((a.value > b.value) ? -1 : 0));
        } else if (typeof a.child !== 'undefined' && typeof b.child !== 'undefined') {
            return compareObjectDesc(a.child, b.child);
        } else {
            return typeof a.child !== 'undefined' ? 1 : -1;
        }
    }

    function compareObjectAsc(a, b) {
        if (!a || !b) {
            return 0
        }
        if (a.key !== b.key) {
            return ((a.value < b.value) ? -1 : ((a.value > b.value) ? 1 : 0));
        } else if (typeof a.child === 'undefined' && typeof b.child === 'undefined') {
            return ((a.value < b.value) ? -1 : ((a.value > b.value) ? 1 : 0));
        } else if (typeof a.child !== 'undefined' && typeof b.child !== 'undefined') {
            return compareObjectAsc(a.child, b.child);
        } else {
            return typeof a.child !== 'undefined' ? 1 : -1;
        }
    }

    if (!$.fn.dataTable) throw new Error('treeTable requires datatables.net');
    const DataTable = $.fn.dataTable;

    $.fn.dataTableExt.oSort['tt-asc'] = function (a, b) {
        return compareObjectAsc(a, b);
    };

    $.fn.dataTableExt.oSort['tt-desc'] = function (a, b) {
        return compareObjectDesc(a, b);
    };

    const TreeTable = function (element, options) {
        const self = this;
        this.collapsed = new Set([]);
        this.$el = $(element);
        this.dt = null;
        const initialOrder = options.order;
        options.order = [];
        options.columns = options.columns || [];
        options.columns.map((col) => {
            const oldRender = col.render;
            col.render = function (data, type, full, meta) {
                switch (type) {
                    case "sort":
                        return self.buildOrderObject(meta.row, full['key'], col["data"]).child;
                    default:
                        return oldRender ? oldRender(data, type, full, meta) : data;
                }
            };
            col.type = "tt";
        });

        options.columns = [
            {
                "class": "tt-details-control",
                "orderable": false,
                "data": null,
                "defaultContent": "<div class='expander'></div>",
                "width": 50
            },
            {
                "data": "key",
                "visible": false
            },
            {
                "data": "parent",
                "visible": false
            },
            {
                "data": "hasChild",
                "visible": false
            }
        ].concat(options.columns);

        options.createdRow = function (row, data, dataIndex) {
            if (data.hasChild) {
                $(row).addClass('has-child');
            }
        };

        this.rows = [];

        this.dt = this.$el.on('init.dt', ()  => {
            if (options.collapsed) {
                this.collapseAllRows();
            }
            else {
                this.$el.find("tbody tr").addClass("open");
            }
        }).DataTable(options);

        this.$el.find('tbody').on('click', 'tr.has-child', function() {
            self.toggleChildRows($(this))
        });

        if (initialOrder) {
            this.dt.order(initialOrder)
                .draw();
        }

        this.redraw();
    };

    TreeTable.prototype.toggleChildRows = function ($tr) {

        const row = this.dt.row($tr);
        const key = row.data().key;

        if (this.collapsed.has(key)) {
            this.collapsed.delete(key);
            $tr.addClass('open');
        } else {
            this.collapsed.add(key);
            $tr.removeClass('open');
        }
        this.redraw();
    };

    TreeTable.prototype.collapseAllRows = function() {
        const dt = this.$el.DataTable();
        dt.rows().eq(0).filter((rowIdx) => {
            const row = dt.row(rowIdx).data();
            if (row.hasChild) {
                this.collapsed.add(row.key);
            }
        });
    };

    TreeTable.prototype.redraw = function() {
            let regex = "^(0";
            this.collapsed.forEach(function (value) {
                regex = regex + "|" + value;
            });
            regex = regex + ")$";
            const parentRegex = new RegExp(regex);
            this.rows = this.dt.rows().eq(0).filter((rowIdx) => {
                return !this.hasParent(rowIdx, parentRegex);
            });

            $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter((it, i) => it.name !== "ttSearch");

            const self = this;
            const ttSearch = function (settings, data, dataIndex) {
                return self.rows.indexOf(dataIndex) > -1
            };

            $.fn.dataTable.ext.search.push(ttSearch);
            this.dt.draw();
    };

    TreeTable.prototype.hasParent = function (rowIdx, parentRegex) {
        const rowData = this.dt.row(rowIdx).data();
        const p = rowData['parent'];
        if (p === 0) return false;
        if (parentRegex.test(p.toString())) return true;
        const parentIdx = this.getIdxForKey(p);
        return this.hasParent(parentIdx, parentRegex);
    };

    TreeTable.DEFAULTS = {};

    TreeTable.prototype.buildOrderObject = function (rowIdx, key, column) {
        if (!this.dt) return '';

        const rowData = this.dt.row(rowIdx).data();

        const parentKey = rowData['parent'];
        let parent = {};
        if (parentKey > 0) {
            const parentIdx = this.getIdxForKey(parentKey);
            parent = this.buildOrderObject(parentIdx, parentKey, column);
        }
        let a = parent;
        while (typeof a.child !== 'undefined') {
            a = a.child;
        }
        a.child = {};
        a.child.key = rowData['key'];
        a.child.value = rowData[column];
        return parent;

    };

    TreeTable.prototype.getIdxForKey = function (key) {
        return this.dt.rows().eq(0).filter((rowIdx) => {
            const row = this.dt.row(rowIdx).data();
            return row.key === key;
        })[0];
    };

    const old = $.fn.treeTable;

    $.fn.treeTable = function (option) {
        return this.each(function () {
            const $this = $(this);
            let data = $this.data('treeTable');
            const options = $.extend({}, TreeTable.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data) $this.data('treeTable', (data = new TreeTable(this, options)));
        });
    };

    $.fn.treeTable.Constructor = TreeTable;

    $.fn.treeTable.noConflict = function () {
        $.fn.treeTable = old;
        return this;
    };
}));
