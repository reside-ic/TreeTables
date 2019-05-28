(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($, dt) {
            return factory(dt.$, window, document);
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
        if (a.tt_key !== b.tt_key) {
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
        if (a.tt_key !== b.tt_key) {
            return ((a.value < b.value) ? -1 : ((a.value > b.value) ? 1 : 0));
        } else if (typeof a.child === 'undefined' && typeof b.child === 'undefined') {
            return ((a.value < b.value) ? -1 : ((a.value > b.value) ? 1 : 0));
        } else if (typeof a.child !== 'undefined' && typeof b.child !== 'undefined') {
            return compareObjectAsc(a.child, b.child);
        } else {
            return typeof a.child !== 'undefined' ? 1 : -1;
        }
    }

    function level (self, key) {
        if (key === 0) {
            return 1
        }
        const parentKey = self.data.filter((d) => d.tt_key === key)[0].tt_parent;
        return 1 + level(self, parentKey);
    }

    function hasChild (self, key) {
        return self.data.filter((d) => d["tt_parent"] === key).length > 0;
    }

    function getIdxForKey(self, key) {
        return self.dt.rows().eq(0).filter((rowIdx) => {
            const row = self.dt.row(rowIdx).data();
            return row.tt_key === key;
        })[0];
    }

    function hasParent(self, rowIdx, parentRegex) {
        const rowData = self.dt.row(rowIdx).data();
        const p = rowData['tt_parent'];
        if (p === 0) return false;
        if (parentRegex.test(p.toString())) return true;
        const parentIdx = getIdxForKey(self, p);
        return hasParent(self, parentIdx, parentRegex);
    }

    function buildOrderObject (self, rowIdx, key, column) {
        if (!self.dt) return '';

        const rowData = self.dt.row(rowIdx).data();

        const parentKey = rowData['tt_parent'];
        let parent = {};
        if (parentKey > 0) {
            const parentIdx = getIdxForKey(self, parentKey);
            parent = buildOrderObject(self, parentIdx, parentKey, column);
        }
        let a = parent;
        while (typeof a.child !== 'undefined') {
            a = a.child;
        }
        a.child = {};
        a.child.tt_key = rowData['tt_key'];
        a.child.value = rowData[column];
        return parent;
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
                        return buildOrderObject(self, meta.row, full['key'], col["data"]).child;
                    default:
                        return oldRender ? oldRender(data, type, full, meta) : data;
                }
            };
            col.type = "tt";
        });

        this.$el.find("thead tr").prepend("<th></th>");

        options.columns = [{
            "class": "tt-details-control",
            "orderable": false,
            "data": null,
            "defaultContent": "<div class='expander'></div>",
            "width": 50
        }].concat(options.columns).concat([
            {
                "data": "tt_key",
                "visible": false
            },
            {
                "data": "tt_parent",
                "visible": false
            }
        ]);

        options.createdRow = function (row, data) {
            let cssClass = "";
            if (hasChild(self, data.tt_key)) {
               cssClass += " has-child ";
            }
            if (data.tt_parent > 0) {
                cssClass += " has-parent";
            }

            cssClass += " level-" + (level(self, data.tt_key) - 2);
            $(row).addClass(cssClass);
        };

        this.data = options.data;
        this.rows = [];

        this.dt = this.$el.on('init.dt', () => {
            if (options.collapsed) {
                this.collapseAllRows();
            }
            else {
                this.$el.find("tbody tr").addClass("open");
            }
        }).DataTable(options);

        this.$el.find('tbody').on('click', 'tr.has-child', function () {
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
        const key = row.data().tt_key;

        if (this.collapsed.has(key)) {
            this.collapsed.delete(key);
            $tr.addClass('open');
        } else {
            this.collapsed.add(key);
            $tr.removeClass('open');
        }

        this.redraw();
    };

    TreeTable.prototype.collapseAllRows = function () {
        const dt = this.$el.DataTable();
        dt.rows().eq(0).filter((rowIdx) => {
            const row = dt.row(rowIdx).data();
            if (hasChild(this, row.tt_key)) {
                this.collapsed.add(row.tt_key);
            }
        });
        return this
    };

    TreeTable.prototype.expandAllRows = function () {
        this.collapsed = new Set([]);
        return this
    };

    TreeTable.prototype.redraw = function () {
        let regex = "^(0";
        this.collapsed.forEach(function (value) {
            regex = regex + "|" + value;
        });
        regex = regex + ")$";
        const parentRegex = new RegExp(regex);
        this.rows = this.dt.rows().eq(0).filter((rowIdx) => {
            return !hasParent(this, rowIdx, parentRegex);
        });

        $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter((it, i) => it.name !== "ttSearch");

        const self = this;
        const ttSearch = function (settings, data, dataIndex) {
            return self.rows.indexOf(dataIndex) > -1
        };

        $.fn.dataTable.ext.search.push(ttSearch);
        this.dt.draw();
    };

    TreeTable.DEFAULTS = {};

    const old = $.fn.treeTable;

    $.fn.treeTable = function (option) {
        return this.each(function () {
            const $this = $(this);
            let data = $this.data('treeTable');
            const options = $.extend({}, TreeTable.DEFAULTS, typeof option === 'object' && option);

            if (!data) $this.data('treeTable', (data = new TreeTable(this, options)));
        });
    };

    $.fn.treeTable.Constructor = TreeTable;

    $.fn.treeTable.noConflict = function () {
        $.fn.treeTable = old;
        return this;
    };
}));
