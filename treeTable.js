(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($, dt) {
            return factory(dt.$, window, document);
        });
    } else if (typeof exports === 'object') {
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
    } else {
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

    function level(self, key) {
        if (key === 0) {
            return 1
        }

        const parentKey = self.dataDict[key].tt_parent;
        return 1 + level(self, parentKey);
    }

    function hasParent(self, key, parentRegex) {
        const rowData = self.dataDict[key];
        const p = rowData['tt_parent'];
        if (p === 0) return false;
        if (parentRegex.test(p.toString())) return true;
        return hasParent(self, p, parentRegex);
    }

    function buildOrderObject(self, key, column) {

        const rowData = self.dataDict[key];
        const parentKey = rowData['tt_parent'];
        let parent = {};
        if (parentKey > 0) {
            parent = buildOrderObject(self, parentKey, column);
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

    function buildSearchObject(self, key, col, data) {
        const children = self.dataDict[key].children;
        return [data].concat(children.map((c) => {
            return buildSearchObject(self, c.tt_key, col, c[col])
        }));
    }

    if (!$.fn.dataTable) throw new Error('treeTable requires datatables.net');

    $.fn.dataTableExt.oSort['tt-asc'] = function (a, b) {
        return compareObjectAsc(a, b);
    };

    $.fn.dataTableExt.oSort['tt-desc'] = function (a, b) {
        return compareObjectDesc(a, b);
    };

    function createDataDict(data) {
        const children = data.reduce(function (map, obj) {
            if (obj.tt_parent) {
                if (!map[obj.tt_parent]) {
                    map[obj.tt_parent] = [];
                }
                map[obj.tt_parent].push(obj);
            }
            return map;
        }, {});
        return data.reduce(function (map, obj) {
            obj.children = children[obj.tt_key] || [];
            obj.hasChild = obj.children.length > 0;
            map[obj.tt_key] = obj;
            return map;
        }, {});
    }

    const TreeTable = function (element, options) {
        const self = this;
        this.$el = $(element);
        if (options.data) {
            this.init(options);
        } else if (options.ajax) {
            // here create a dummy DataTable using the provided ajax source so that we can use
            // DataTables internal logic to retrieve json and handle any ajax errors
            this.$dummy = $("<table></table>");
            this.$dummyWrapper = $('<div id="dummy-wrapper" style="display:none"></div>');

            $("body").append(this.$dummyWrapper);
            this.$dummyWrapper.append(this.$dummy);
            this.$dummy.DataTable({ajax: options.ajax, columns: options.columns});

            this.$dummy.on('xhr.dt', function (e, settings, json, xhr) {
                self.$dummy.DataTable().destroy();
                self.$dummy.parent().remove();
                if (json != null) {
                    // calling this internal method retrieves data from the json in accordance with
                    // provided DataTable ajax options - https://datatables.net/reference/option/ajax
                    options.data = $.fn.dataTableExt.internal._fnAjaxDataSrc(settings, json);
                    options.ajax = null;
                    self.init(options);
                }
            });
        }
    };

    TreeTable.prototype.init = function (options) {
        const self = this;

        this.collapsed = new Set([]);

        this.data = options.data;
        this.dataDict = createDataDict(options.data);

        this.displayedRows = [];

        this.dt = null;

        const initialOrder = options.order;
        options.order = [];
        options.columns = options.columns || [];
        options.columns.map((col) => {
            const oldRender = col.render;
            col.render = function (data, type, full, meta) {
                switch (type) {
                    case "sort":
                        return buildOrderObject(self, full["tt_key"], col["data"]).child;
                    case "filter":
                        return buildSearchObject(self, full['tt_key'], col["data"], data);
                    default:
                        return oldRender ? oldRender(data, type, full, meta) : data;
                }
            };
            col.type = "tt";
        });

        options.rowId = "tt_key";

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
            if (self.dataDict[data.tt_key].hasChild) {
                cssClass += " has-child ";
            }
            if (data.tt_parent > 0) {
                cssClass += " has-parent";
            }

            cssClass += " level-" + (level(self, data.tt_key) - 2);
            $(row).addClass(cssClass);
        };

        this.dt = this.$el.DataTable(options);

        if (initialOrder) {
            this.dt.order(initialOrder);
        }

        if (options.collapsed) {
            this.collapseAllRows();
        } else {
            this.expandAllRows();
        }

        this.$el.find('tbody').on('click', 'tr.has-child td.tt-details-control', function () {
            self.toggleChildRows($(this).parent("tr"))
        });

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

        this.data.map((d) => {
            if (this.dataDict[d.tt_key].hasChild) {
                this.collapsed.add(d.tt_key);
            }
        });

        this.$el.find("tbody tr.has-child").removeClass("open");
        return this
    };

    TreeTable.prototype.expandAllRows = function () {
        this.collapsed = new Set([]);
        this.$el.one('draw.dt', () => {
            this.$el.find("tbody tr.has-child").addClass("open");
        });
        return this
    };

    TreeTable.prototype.redraw = function () {

        $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter((it, i) => it.name !== "ttExpanded");

        if (this.collapsed.size === 0) {
            this.displayedRows = this.dt.rows().eq(0);
            this.dt.draw();
            return
        }

        let regex = "^(0";
        this.collapsed.forEach(function (value) {
            regex = regex + "|" + value;
        });
        regex = regex + ")$";
        const parentRegex = new RegExp(regex);

        this.displayedRows = this.dt.rows((idx, data) => {
            return !hasParent(this, data["tt_key"], parentRegex)
        }).eq(0);

        const self = this;
        const ttExpanded = function (settings, data, dataIndex) {
            return self.displayedRows.indexOf(dataIndex) > -1
        };

        $.fn.dataTable.ext.search.push(ttExpanded);
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
