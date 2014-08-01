

var jsBoxBuilder = {
    init: function() {
        this.htmlPanel = ko.observable(false);
        this.cssPanel = ko.observable(false);
        this.jsPanel = ko.observable(false);
        this.panels = ko.computed(function() {
            var panels = [];
            if (this.htmlPanel() === true) {
                panels.push('HTML');
            }
            if (this.cssPanel() === true) {
                panels.push('CSS');
            }
            if (this.jsPanel() === true) {
                panels.push('Javascript');
            }
            return panels.join(', ');
        }, this);
        
        this.htmlSource = ko.observable('');
        this.cssSource = ko.observable('');
        this.jsSource = ko.observable('');
        
        // options
        this.isAutorun = ko.observable(false);
        this.isDisabled = ko.observable(false);
        this.disabledMessage = ko.observable('');
        this.isAutorun.subscribe(function(val) {
            if (val === true) {
                this.isDisabled(false);
            }
        }, this);
        this.isDisabled.subscribe(function(val) {
            if (val === true) {
                this.isAutorun(false);
            }
        }, this);
        this.options = ko.computed(function() {
            var options = [];
            if (this.isAutorun() === true) {
                options.push('autorun');
            }
            if (this.isDisabled() === true) {
                options.push('disabled');
            }
            return options.join(', ');
        }, this);
        
        
        // scripts
        this.scripts = ko.observableArray();
        this.scriptUrl = ko.observable('');
        this.hasScripts = ko.computed(function() {
            return this.scripts().length > 0 ? true : false;
        }, this);
        
        // styles
        this.styles = ko.observableArray();
        this.styleUrl = ko.observable('');
        this.hasStyles = ko.computed(function() {
            return this.styles().length > 0 ? true : false;
        }, this);
        
        // artifax
        this.artifax = ko.observableArray();
        this.hasArtifax = ko.computed(function() {
            return this.artifax().length > 0 ? true : false;
        }, this);
        this.artifaxCode = ko.observable('');
        
        // tests
        this.tests = ko.observableArray();
        this.hasTests = ko.computed(function() {
            return this.tests().length > 0 ? true : false;
        }, this);
        this.testCode = ko.observable('');
        this.testLabel = ko.observable('');
        
        this.embed = ko.observable('');
        this.isReady = ko.computed(function() {
            return this.embed().length > 0;
        }, this);
        this.showHint = ko.computed(function() {
            return !this.isReady();
        }, this);
        this.embedRows = ko.computed(function() {
            return this.embed().split('\n').length;
        }, this);
        
        
        
    },
    addStyle: function() {
        var item = this.styleUrl();
        if (!item.length) {
            return;
        }
        this.styles.push(item);
        this.styleUrl('');
    },
    addScript: function() {
        var item = this.scriptUrl();
        if (!item.length) {
            return;
        }
        this.scripts.push(item);
        this.scriptUrl('');
    },
    addArtifax: function() {
        var artifax = this.artifaxCode();
        if (!artifax.length) {
            return;
        }
        this.artifax.push(artifax);
        this.artifaxCode('');
    },
    addTest: function() {
        var test = {
            code: this.testCode(),
            label: this.testLabel()
        };
        if (!test.code) {
            return;
        }
        this.tests.push(test);
        this.testCode('');
        this.testLabel('');
    },
    removeStyle: function(item) {
        removeListItem(this.styles, item);
    },
    removeScript: function(item) {
        removeListItem(this.scripts, item);
    },
    removeArtifax: function(item) {
        removeListItem(this.artifax, item);
    },
    removeTest: function(item) {
        removeListItem(this.tests, item);
    },
    generateCode: function() {
        var code = '';
        var attr = '';
        var ln = '\n';
        var t = '\t';
        var s = ' ';
        
        if (this.isAutorun() === true) {
            attr += s + 'data-jsbox-autorun=true';
        }
        
        if (this.isDisabled() === true) {
            if (this.disabledMessage().length) {
                attr += s + 'data-jsbox-disabled="' + this.disabledMessage() + '"';
            } else {
                attr += s + 'data-jsbox-disabled';
            }
        }
        
        if (this.hasScripts()) {
            attr += s + 'data-jsbox-scripts="' + this.scripts().join(',') + '"';
        }
        
        if (this.hasStyles()) {
            attr += s + 'data-jsbox-styles="' + this.styles().join(',') + '"';
        }
        
        code += '<div data-jsbox' + attr + '>' + ln;
        
        if (this.htmlPanel() === true) {
            code += t + '<pre data-html>' + this.htmlSource() + '</pre>' + ln;
        }
        if (this.cssPanel() === true) {
            code += t + '<pre data-css>' + this.cssSource() + '</pre>' + ln;
        }
        if (this.jsPanel() === true) {
            code += t + '<pre data-js>' + this.jsSource() + '</pre>' + ln;
        }
        
        // artifax
        this.artifax().forEach(function(artifaxCode) {
            var artifax = '<pre data-artifax>' + artifaxCode + '</pre>';
            code += t + artifax + ln;
        });
        
        // tests
        this.tests().forEach(function(test) {
            if (test.label.length) {
                var test = '<pre data-test="' + test.code + '">' + test.label + '</pre>';
            } else {
                var test = '<pre data-test>' + test.code + '</pre>';
            }
            code += t + test + ln;
        });
        
        code += '</div>';
        
        this.embed(code);
    },
    reset: function() {
        this.embed('');
    }
};


function removeListItem(list, item) {
    list.remove(item);
}



ko.bindingHandlers.jsboxPreview = {
    init: function(element, valueAccessor) {
        
    },
    update: function(element, valueAccessor) {
        var source = ko.unwrap(valueAccessor());
        
        var $jsbox = $(element).find('[data-jsbox]');
        if ($jsbox.length) {
            $jsbox.jsbox('dispose').remove();
        }
        
        var $jsbox = $(source);
        $(element).append($jsbox);
        
        $jsbox.jsbox();
        
    },
};



var viewModel = Object.create(jsBoxBuilder);
viewModel.init();

ko.applyBindings(viewModel);



