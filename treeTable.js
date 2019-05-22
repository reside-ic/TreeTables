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
                        return self.buildOrderObject(full['key'], col["data"]).child;
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
                "data": "level",
                "visible": false
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
            if (data.level > 0) {
                $(row).addClass('level-' + data.level);
            }
        };

        this.rows = [];

        this.dt = this.$el.on('init.dt', function () {
            if (options.collapsed) {
                self.$el.DataTable().rows().eq(0).filter(function (rowIdx) {
                    if (self.$el.DataTable().cell(rowIdx, 4).data() === true) {
                        self.collapsed.add(rowIdx + 1);
                    }
                });
            }
            else {
                self.$el.find("tbody tr").addClass("open");
            }
        }).DataTable(options);

        this.$el.find('tbody').on('click', 'tr.has-child', function () {
            self.toggleChildRows($(this))
        });

        if (initialOrder) {
            this.dt.order(initialOrder)
                .draw();
        }
        redraw(this);
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
        redraw(this);
    };

    function redraw(tt) {
        let regex = "^(0";
        tt.collapsed.forEach(function (value) {
            regex = regex + "|" + value;
        });
        regex = regex + ")$";
        const parentRegex = new RegExp(regex);
        tt.rows = tt.dt.rows().eq(0).filter((rowIdx) => {
            return !tt.hasParent(rowIdx + 1, parentRegex);
        });

        $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter((it, i) => it.name !== "ttSearch");

        const ttSearch = function(settings, data, dataIndex) {
            return tt.rows.indexOf(dataIndex) > -1
        };
        $.fn.dataTable.ext.search.push(ttSearch);
        tt.dt.draw();
    }

    TreeTable.prototype.hasParent = function (key, parentRegex) {
        const rowData = this.dt.row(key - 1).data();
        const p = rowData['parent'];
        if (p === 0) return false;
        if (parentRegex.test(p.toString())) return true;
        return this.hasParent(p, parentRegex);
    };

    TreeTable.DEFAULTS = {};

    TreeTable.prototype.buildOrderObject = function (key, column) {
        if (!this.dt) return '';

        const rowData = this.dt.row(key - 1).data();
        if (typeof rowData === 'undefined') {
            return {};
        } else {
            const parent = this.buildOrderObject(rowData['parent'], column);
            let a = parent;
            while (typeof a.child !== 'undefined') {
                a = a.child;
            }
            a.child = {};
            a.child.key = rowData['key'];
            a.child.value = rowData[column];
            return parent;
        }
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
