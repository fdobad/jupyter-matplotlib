var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');

var version = require('../package.json').version;

var ToolbarModel = widgets.DOMWidgetModel.extend({
    defaults: function() {
        return _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
            _model_name: 'ToolbarModel',
            _view_name: 'ToolbarView',
            _model_module: 'jupyter-matplotlib',
            _view_module: 'jupyter-matplotlib',
            _model_module_version: '^'+ version,
            _view_module_version: '^' + version,
            toolitems: [],
            orientation: 'vertical'
        });
    }
});

var ToolbarView = widgets.DOMWidgetView.extend({
    render: function() {
        this.create_toolbar();

        this.el.appendChild(this.toolbar_container);

        this.model_events();
    },

    create_toolbar: function() {
        var toolbar_items = this.model.get('toolitems');

        this.current_action = '';

        this.toolbar_container = document.createElement('div');
        this.toolbar_container.classList = this.get_container_class();
        this.toggle_button = document.createElement('button');

        this.toggle_button.classList = 'ipympl_button jupyter-widgets jupyter-button';
        this.toggle_button.setAttribute('href', '#');
        this.toggle_button.setAttribute('title', 'Toggle Interaction');
        this.toggle_button.style.outline = 'none';
        this.toggle_button.addEventListener('click', this.toggle_interaction.bind(this));

        var icon = document.createElement('i');
        icon.classList = 'center fa fa-bars';
        this.toggle_button.appendChild(icon);

        this.toolbar_container.appendChild(this.toggle_button);

        this.toolbar = document.createElement('div');
        this.toolbar.classList = this.get_container_class();
        this.toolbar_container.appendChild(this.toolbar);

        for(var toolbar_ind in toolbar_items) {
            var name = toolbar_items[toolbar_ind][0];
            var tooltip = toolbar_items[toolbar_ind][1];
            var image = toolbar_items[toolbar_ind][2];
            var method_name = toolbar_items[toolbar_ind][3];
            if (!name) { continue; };

            var button = document.createElement('button');
            button.classList = 'ipympl_button jupyter-widgets jupyter-button';
            button.setAttribute('href', '#');
            button.setAttribute('title', tooltip);
            button.style.outline = 'none';
            button.addEventListener('click', this.toolbar_button_onclick(method_name));

            var icon = document.createElement('i');
            icon.classList = 'center fa fa-' + image;
            button.appendChild(icon);

            this.toolbar.appendChild(button);
        }
    },

    get_container_class: function() {
        var orientation = this.model.get('orientation');
        if (orientation == 'vertical') {
            return 'jupyter-widgets widget-container widget-box widget-vbox';
        } else {
            return 'jupyter-widgets widget-container widget-box widget-hbox';
        }
    },

    toolbar_button_onclick: function(name) {
        var toolbar_widget = this;

        return function(event) {
            var button = event.target;

            // Special case for pan and zoom as they are toggle buttons
            if (name == 'pan' || name == 'zoom') {
                if (toolbar_widget.current_action == '') {
                    toolbar_widget.current_action = name;
                    button.classList.add('mod-active');
                }
                else if (toolbar_widget.current_action == name) {
                    toolbar_widget.current_action = '';
                    button.classList.remove('mod-active');
                }
                else {
                    toolbar_widget.current_action = name;
                    [].forEach.call(toolbar_widget.toolbar.children, function(child) {
                        child.classList.remove('mod-active');
                    });
                    button.classList.add('mod-active');
                }
            }

            var message = {
                'type': 'toolbar_button',
                'name': name
            };

            toolbar_widget.send(message);
        };
    },

    toggle_interaction: function() {
        // Toggle the interactivity of the figure.
        var visible = this.toolbar.style.display !== 'none';
        this.toolbar.style.display = visible ? 'none' : '';
    },

    model_events: function() {
        this.model.on('change:orientation', this.update_orientation.bind(this));
    },

    update_orientation: function() {
        this.toolbar_container.classList = this.get_container_class();
        this.toolbar.classList = this.get_container_class();
    }
});

module.exports = {
    ToolbarModel: ToolbarModel,
    ToolbarView: ToolbarView
}
