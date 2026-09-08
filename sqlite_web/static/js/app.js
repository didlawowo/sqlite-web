App = window.App || {};

(function(exports, $) {
    initialize = function() {
        const textareas = document.querySelectorAll('textarea.remember-size');
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const id = entry.target.id;
                const textarea = $(entry.target);
                const newHeight = entry.contentRect.height;
                localStorage.setItem('textarea-' + id + '-height', newHeight);
            }
        });

        textareas.forEach(textarea => {
            if (textarea.id) {
                var height = localStorage.getItem('textarea-' + textarea.id + '-height');
                if (height) {
                    $(textarea).height(height);
                }
                resizeObserver.observe(textarea);
            }
        });

        /* Success and info flashes fade out, warnings and errors stay. */
        setTimeout(function() {
            $('div.alert-success, div.alert-info').fadeTo(300, 0, function() {
                $(this).remove();
            });
        }, 4000);

        /* Toggle long values on/off. */
        $('a.toggle-value').on('click', function(e) {
            e.preventDefault();
            var elem = $(this),
                truncated = elem.siblings('span.truncated'),
                full = elem.siblings('span.full');
            truncated.toggle();
            full.toggle();
        });

        /* Show/hide table info div. */
        var tableInfo = $('div#tableInfo');
        if (tableInfo.length > 0) {
            if (localStorage.getItem('tableInfo') === 'false') {
                tableInfo.hide();
            }

            $('a#toggleTableInfo').on('click', function(e) {
                e.preventDefault();
                var show = !tableInfo.is(':visible');
                localStorage.setItem('tableInfo', show ? 'true' : 'false')
                tableInfo.toggle();
            });
        }

        /* Show SQL (e.g. for indexes / triggers). */
        $('a.view-sql').on('click', function(e) {
            e.preventDefault();
            var elem = $(this),
                pre = elem.siblings('div'),
                modalDiv = $('div#sql-modal');
            modalDiv.find('h5.modal-title').text(elem.data('name'));
            modalDiv.find('.modal-body').empty().append(pre.clone().show());
            modalDiv.modal({'keyboard': true});
        });

        /* Show one of the SQL syntax railroad diagrams. */
        $('a.sql-image').on('click', function(e) {
            e.preventDefault();
            var elem = $(this),
                imgUrl = elem.attr('href'),
                modalDiv = $('div#sql-image-modal');
            modalDiv.find('h5.modal-title').text(elem.text());
            modalDiv.find('.modal-body').empty().append(
                $('<img src="' + imgUrl + '" style="max-width:100%;" />'));
            modalDiv.modal({'keyboard': true});
        });

        /* Toggle helper virtual tables and table typeahead search. */
        $('a#toggle-helper-tables').on('click', function(e) {
            e.preventDefault();
            $('ul#helper-tables').toggle();
        });
        $('input#table-search').on('keyup', function(e) {
            var searchQuery = $(this).val().toUpperCase();
            $('li.table-link').each(function() {
                var elem = $(this),
                    link = elem.find('a'),
                    tableName = (link.attr('title') || link.prop('innerText')).toUpperCase();
                elem.toggle(tableName.indexOf(searchQuery) != -1);
            });
        });

        /* Checkboxes for enabling/disabling inputs. */
        $('input.chk-enable-column').on('click', function (evt) {
            var elem = $(this),
                inp = $('#' + elem.data('target-element'));
            inp.prop('disabled', elem.is(':checked') ? false : true);
        });

        $('input#toggle-checkboxes').on('click', function (evt) {
            $('input.chk-enable-column').prop('checked', $(this).is(':checked'));
            $('input.chk-enable-column').each(function(_) {
                var elem = $(this),
                    inp = $('#' + elem.data('target-element'));
                inp.prop('disabled', elem.is(':checked') ? false : true);
            });
        });

        function syncSelection() {
            $('input.toggle-pk').each(function (_) {
                $(this).closest('tr').toggleClass('row-selected', this.checked);
            });
            $('button.bulk-action').prop('disabled', ($('input.toggle-pk:checked').length == 0));
        }
        $('input#toggle-pk-all').on('click', function (evt) {
            $('input.toggle-pk').prop('checked', $(this).is(':checked'));
            syncSelection();
        });
        $('input.toggle-pk').on('click', syncSelection);

        /* Copy cell values and rows as JSON to the clipboard. */
        function copyText(text, done) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(done);
            } else {
                var ta = $('<textarea style="position:fixed;opacity:0;"></textarea>')
                    .val(text).appendTo('body');
                ta[0].select();
                document.execCommand('copy');
                ta.remove();
                done();
            }
        }

        /* Returns [value, isNull] for a result cell. The full span holds the
           untruncated value and external links keep it in the href. */
        function cellData(td) {
            if (td.children('code').length && td.text().trim() === 'NULL') {
                return [null, true];
            }
            var full = td.find('span.full');
            if (full.length) {
                return [full.text(), false];
            }
            var href = td.children('a').first().attr('href') || '';
            if (/^(https?:|mailto:)/.test(href)) {
                return [href, false];
            }
            return [td.text().trim(), false];
        }

        /* Double-click a cell to copy its value. No overlay chrome to
           collide with the data, the cell flashes as feedback. */
        $('table.cell-content').on('dblclick', 'tbody td', function() {
            var td = $(this);
            if (td.find('input.toggle-pk').length || td.find('a.copy-row').length) {
                return;
            }
            var data = cellData(td);
            copyText(data[1] ? 'NULL' : String(data[0]), function() {
                window.getSelection().removeAllRanges();
                td.addClass('cell-copied');
                setTimeout(function() { td.removeClass('cell-copied'); }, 800);
            });
        });

        $('a.copy-row').on('click', function(e) {
            e.preventDefault();
            var elem = $(this),
                row = elem.parents('tr'),
                cols = row.parents('table').find('thead th[data-col]'),
                tds = row.children('td').filter(function() {
                    var td = $(this);
                    return !td.find('input.toggle-pk').length &&
                           !td.find('a.copy-row').length;
                }),
                accum = {};
            cols.each(function(i) {
                var td = tds.eq(i);
                if (!td.length) return;
                var data = cellData(td),
                    value = data[0];
                if (!data[1] && td.hasClass('num') && isFinite(Number(value))) {
                    value = Number(value);
                }
                accum[$(this).data('col')] = value;
            });
            copyText(JSON.stringify(accum, null, 2), function() {
                var use = elem.find('use');
                use.attr('href', '#i-check');
                setTimeout(function() { use.attr('href', '#i-copy'); }, 800);
            });
        });

        /* Initialize focus on SQL textarea. */
        var sqlTextarea = $('textarea#sql, textarea#table-sql');
        if (sqlTextarea.length > 0) {
            sqlTextarea.focus();
        }
    };

    /* Per-database namespace for localStorage keys. */
    function nsKey(name) {
        return name + ':' + (window.SQLITE_WEB_DB || '');
    }

    Bookmarks = function() {};

    /* Bookmarks remember the query page they were saved on. Each entry is
       a [name, sql, table] triple, table being '' for the generic page.
       Entries stored by older versions lack the table and migrate on
       read. */
    Bookmarks.prototype.initialize = function(options) {
        this.table = options.table;
        this.queryUrl = options.queryUrl;
        this.tableQueryUrl = options.tableQueryUrl;
        this.bkList = [];
        this.bk = {};
        this.container = $('div#bookmarks');
        this.sqlTextarea = $('textarea[name="sql"]');
        this.modal = $('div#bookmark-modal');
        this.inpName = this.modal.find('input#bookmark-name');
        this.btnAdd = $('button#add-bookmark');
        this.btnSave = this.modal.find('button#save-bookmark');
        this.frmSave = this.modal.find('form');
        this.inpFile = $('input#import-bookmarks');

        var queries = JSON.parse(localStorage.getItem(nsKey('bookmarks')) || '[]');
        for (var i = 0; i < queries.length; i++) {
            var name = queries[i][0];
            if (!(name in this.bk)) {
                this.bkList.push(name);
                this.bk[name] = [queries[i][1], queries[i][2] || ''];
            }
        }

        this.bindHandlers();
        this.populateMenu();
    };

    Bookmarks.prototype.bindHandlers = function() {
        var self = this;
        this.btnAdd.on('click', function(e) {
            e.preventDefault();
            self.inpName.val('');
            self.modal.modal({'keyboard': true});
        });

        this.btnSave.on('click', function(e) {
            e.preventDefault();
            self.saveBookmark();
            self.modal.modal('hide');
        });

        this.frmSave.on('submit', function(e) {
            e.preventDefault();
            self.saveBookmark();
            self.modal.modal('hide');
        });

        this.inpFile.on('change', function() {
            if (this.files.length) {
                self.importFile(this.files[0]);
            }
            this.value = '';
        });
    };

    /* Add or overwrite a bookmark, moving it to the front. */
    Bookmarks.prototype.add = function(name, sql, table) {
        var i = this.bkList.indexOf(name);
        if (i >= 0) {
            this.bkList.splice(i, 1);
        }
        this.bkList.unshift(name);
        this.bk[name] = [sql, table];
    };

    Bookmarks.prototype.saveBookmark = function() {
        var name = this.inpName.val();
        if (!name) return;

        this.add(name, this.sqlTextarea.val(), this.table);
        this.saveData();
        this.populateMenu();
    };

    /* The query page a bookmark navigates to, with its sql attached. */
    Bookmarks.prototype.bookmarkUrl = function(name) {
        var sql = this.bk[name][0],
            table = this.bk[name][1],
            url = table
                ? this.tableQueryUrl.replace('__TABLE__', encodeURIComponent(table))
                : this.queryUrl;
        return url + '?sql=' + encodeURIComponent(sql);
    };

    Bookmarks.prototype.deleteBookmark = function(name) {
        if (!name) return;
        var i = this.bkList.indexOf(name);
        if (i < 0) return;

        this.bkList.splice(i, 1);
        delete this.bk[name];
        this.saveData();
        this.populateMenu();
    };

    Bookmarks.prototype.serialize = function() {
        var accum = [];
        for (var i = 0; i < this.bkList.length; i++) {
            var name = this.bkList[i];
            accum.push([name, this.bk[name][0], this.bk[name][1]]);
        }
        return accum;
    };

    Bookmarks.prototype.saveData = function() {
        localStorage.setItem(nsKey('bookmarks'), JSON.stringify(this.serialize()));
    };

    Bookmarks.prototype.exportFile = function() {
        var blob = new Blob([JSON.stringify(this.serialize(), null, 2)],
                            {'type': 'application/json'}),
            url = URL.createObjectURL(blob),
            link = $('<a></a>').attr({'href': url, 'download': 'bookmarks.json'});
        link.appendTo('body');
        link[0].click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    /* Validate the whole file, then merge. Imported names win and the
       file's first bookmark ends up at the front of the menu. */
    Bookmarks.prototype.importFile = function(file) {
        var self = this,
            reader = new FileReader();
        reader.onload = function() {
            var entries = null;
            try {
                entries = JSON.parse(reader.result);
            } catch (e) {}
            var valid = Array.isArray(entries) && entries.every(function(entry) {
                return Array.isArray(entry) &&
                    (entry.length == 2 || entry.length == 3) &&
                    typeof entry[0] === 'string' && entry[0] &&
                    typeof entry[1] === 'string' &&
                    (entry.length == 2 || typeof entry[2] === 'string');
            });
            if (!valid) {
                alert('Import failed. Expected a JSON list of ' +
                      '[name, sql, table] entries.');
                return;
            }
            for (var i = entries.length - 1; i >= 0; i--) {
                self.add(entries[i][0], entries[i][1], entries[i][2] || '');
            }
            self.saveData();
            self.populateMenu();
        };
        reader.readAsText(file);
    };

    Bookmarks.prototype.populateMenu = function() {
        var self = this;
        this.container.empty();
        if (!this.bkList.length) {
            this.container.append(
                $('<span class="dropdown-item-text text-muted small"></span>')
                    .text('No bookmarks yet'));
            this.appendTransfer();
            return;
        }
        for (var i = 0; i < this.bkList.length; i++) {
            var name = this.bkList[i],
                table = this.bk[name][1];

            var elem = $(
                '<div class="dropdown-item">' +
                '<a class="bk-delete float-right" href="#">X</a>' +
                '<a class="bk" href="#" style="display: block;"></a> ' +
                '</div>');
            elem.data('name', name);
            elem.find('a.bk').text(name);
            if (table) {
                elem.find('a.bk').append(
                    $('<small class="text-muted ml-2"></small>')
                        .text('(' + table + ')'));
            }
            var bookmark = elem.find('a.bk'),
                del = elem.find('a.bk-delete');

            bookmark.on('click', function(e) {
                e.preventDefault();
                var name = $(this).parent().data('name');
                window.location = self.bookmarkUrl(name);
            });
            del.on('click', function(e) {
                e.preventDefault();
                var name = $(this).parent().data('name');
                self.deleteBookmark(name);
            });
            this.container.append(elem);
        }
        this.appendTransfer();
    };

    /* Export and import entries at the bottom of the dropdown. */
    Bookmarks.prototype.appendTransfer = function() {
        var self = this;
        this.container.append($('<div class="dropdown-divider"></div>'));
        this.container.append(
            $('<a class="dropdown-item" href="#">Export</a>').on('click', function(e) {
                e.preventDefault();
                self.exportFile();
            }));
        this.container.append(
            $('<a class="dropdown-item" href="#">Import</a>').on('click', function(e) {
                e.preventDefault();
                self.inpFile.trigger('click');
            }));
    };

    Recent = function() {};

    Recent.prototype.initialize = function(sql) {
        this.sqlTextarea = $('textarea[name="sql"]');
        this.form = this.sqlTextarea.parents('form');
        this.queries = JSON.parse(localStorage.getItem(nsKey('recentQueries')) || '[]');
        this.idx = 0;
        if (sql) {
            var accum = [sql];
            for (var i = 0; i < this.queries.length; i++) {
                if (this.queries[i] !== sql) { accum.push(this.queries[i]) };
            }
            this.queries = accum.slice(0, 50);
            localStorage.setItem(nsKey('recentQueries'), JSON.stringify(this.queries));
        }

        this.bindHandlers();
    }

    Recent.prototype.bindHandlers = function() {
        var self = this;
        this.sqlTextarea.on('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) { // ctrl+enter or meta+enter.
                self.form.submit();
            }
            if (e.shiftKey) {
                if (e.keyCode == 38) { // up.
                    self.idx += 1;
                    if (self.idx >= self.queries.length) { self.idx = 0; }
                    self.sqlTextarea.val(self.queries[self.idx]);
                    e.preventDefault();
                } else if (e.keyCode == 40) { // down.
                    self.idx -= 1;
                    if (self.idx < 0) { self.idx = self.queries.length - 1; }
                    self.sqlTextarea.val(self.queries[self.idx]);
                    e.preventDefault();
                }
            }
        });
    };

    exports.initialize = initialize;
    exports.Bookmarks = Bookmarks;
    exports.Recent = Recent;
})(App, jQuery);
