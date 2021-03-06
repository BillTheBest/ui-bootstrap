(function (manywho, window) {

    var content = React.createClass({

        changeInterval: null,
        skipSetContent: false,
        editor: null,

        initializeEditor: function () {

            var self = this;
            var model = manywho.model.getComponent(this.props.id, this.props.flowKey);

            var customPlugins = manywho.settings.global('richtext.custom_plugins', this.props.flowKey, null);
            if (customPlugins)
                Object.keys(customPlugins).forEach(function (name) {
                    tinymce.PluginManager.add(name, customPlugins[name])
                });

            tinymce.init({
                selector: 'textarea#content-' + this.props.id,
                plugins: manywho.settings.global('richtext.plugins', this.props.flowKey, []),
                external_plugins: manywho.settings.global('richtext.external_plugins', this.props.flowKey, []),
                width: model.width * 19, // Multiply the width by a "best guess" font-size as the manywho width is columns and tinymce width is pixels
                height: model.height * 16, // Do the same for the height
                readonly: !model.isEditable,
                menubar: 'edit insert view format table tools',
                toolbar: manywho.settings.global('richtext.toolbar', this.props.flowKey, []),
                content_css: manywho.settings.global('richtext.content_css', this.props.flowKey, []),
                importcss_append: manywho.settings.global('richtext.importcss_append', this.props.flowKey, false),
                importcss_file_filter: manywho.settings.global('richtext.importcss_file_filter', this.props.flowKey, null),
                nanospell_server: manywho.settings.global('richtext.nanospell_server', this.props.flowKey, null),
                moxiemanager_title: manywho.settings.global('richtext.moxiemanager_title', this.props.flowKey, null),
                moxiemanager_fullscreen: manywho.settings.global('richtext.moxiemanager_fullscreen', this.props.flowKey, null),

                setup: function (editor) {

                    self.editor = editor;

                    if (!self.props.isDesignTime) {

                        if (manywho.settings.global('richtext.imageUploadEnabled', self.props.flowKey, true))
                            editor.addButton('mwimage', {
                                title: 'Images',
                                icon: 'image',
                                onclick: function () {
                                    self.setState({
                                        isImageUploadOpen: true
                                    });
                                    self.render();
                                }
                            });

                        editor.on('change', self.handleChange);

                        if (model.hasEvents)
                            editor.on('blur', self.handleEvent);
                    }

                    editor.on('init', function () {
                        this.getDoc().body.style.fontSize = manywho.settings.global('richtext.fontsize', self.props.flowKey, '13px');
                    });
                }
            });
        },

        statics: {
            isLoadingTinyMce: false,

            loadTinyMce: function (callback) {

                manywho.component.getByName('content').isLoadingTinyMce = true;

                var script = document.createElement('script');
                script.src = manywho.settings.global('richtext.url');

                script.onload = function () {

                    manywho.component.getByName('content').isLoadingTinyMce = false;
                    callback.apply();

                };

                window.document.body.appendChild(script);

            }

        },

        getInitialState: function () {

            return {
                isImageUploadOpen: false
            }

        },

        componentDidMount: function () {

            var self = this;

            if (!window.tinymce) {

                var component = manywho.component.getByName('content');

                if (!component.isLoadingTinyMce) {

                    component.loadTinyMce(function () {

                        self.initializeEditor();

                    });

                } else {

                    var loaderInterval = setInterval(function () {

                        if (window.tinymce) {

                            self.initializeEditor();
                            clearInterval(loaderInterval);

                        }

                    }, 50);

                }

            } else {

                self.initializeEditor();

            }

        },

        componentWillUnmount: function () {
            if (this.editor) {
                try {
                    this.editor.remove();
                } catch (ex) {
                    manywho.log.error(ex);
                }
            }
        },

        handleChange: function (e) {
            var content = this.editor.getContent();
            manywho.state.setComponent(this.props.id, {
                contentValue: content
            }, this.props.flowKey, true);
            this.forceUpdate();
        },

        handleEvent: function (e) {

            manywho.component.handleEvent(this, manywho.model.getComponent(this.props.id, this.props.flowKey), this.props.flowKey);

        },

        renderFileDialog: function () {

            var tableAttributes = {
                flowKey: this.props.flowKey,
                id: this.props.id,
                selectionEnabled: true
            };

            var uploadAttributes = {
                flowKey: this.props.flowKey,
                id: this.props.id,
                multiple: true
            };

            if (!this.props.isDesignTime) {
                tableAttributes = manywho.utils.extend(tableAttributes, {
                    onRowClicked: this.onFileTableRowClicked
                });
                uploadAttributes = manywho.utils.extend(tableAttributes, {
                    uploadComplete: this.onUploadComplete
                });
            }

            return React.DOM.div({
                className: 'modal show'
            }, [
                React.DOM.div({
                    className: 'modal-dialog full-screen',
                    onKeyUp: this.onEnter
                }, [
                    React.DOM.div({
                        className: 'modal-content full-screen'
                    }, [
                        React.DOM.div({
                            className: 'modal-body'
                        }, [
                            React.DOM.ul({
                                className: 'nav nav-tabs'
                            }, [
                                React.DOM.li({
                                    className: 'active'
                                }, [
                                    React.DOM.a({
                                        href: '#files',
                                        'data-toggle': 'tab'
                                    }, 'File List')
                                ]),
                                React.DOM.li({
                                    className: ''
                                }, [
                                    React.DOM.a({
                                        href: '#upload',
                                        'data-toggle': 'tab'
                                    }, 'Direct Upload')
                                ])
                            ]),
                            React.DOM.div({
                                className: 'tab-content'
                            }, [
                                React.DOM.div({
                                    className: 'tab-pane active',
                                    id: 'files'
                                }, [
                                    React.createElement(manywho.component.getByName('table'), tableAttributes)
                                ]),
                                React.DOM.div({
                                    className: 'tab-pane',
                                    id: 'upload'
                                }, [
                                    React.createElement(manywho.component.getByName('file-upload'), uploadAttributes)
                                ])
                            ])
                        ]),
                        React.DOM.div({
                            className: 'modal-footer'
                        }, [
                            React.DOM.button({
                                className: 'btn btn-default',
                                onClick: this.onFileCancel
                            }, 'Cancel')
                        ])
                    ])
                ])
            ]);

        },

        onUploadComplete: function (response) {

            var imageUri = manywho.utils.getObjectDataProperty(response.objectData[0].properties, 'Download Uri');
            var imageName = manywho.utils.getObjectDataProperty(response.objectData[0].properties, 'Name');

            if (imageUri) {

                tinymce.activeEditor.execCommand('mceInsertContent', false, '<img src="' + imageUri.contentValue + '" alt="' + imageName.contentValue + '"/>');

                this.setState({
                    isImageUploadOpen: false
                });

            }

        },

        onFileCancel: function (event) {

            this.setState({
                isImageUploadOpen: false
            });

        },

        onFileTableRowClicked: function (event) {

            var imageUri = event.currentTarget.lastChild.innerText;

            var imageName = event.currentTarget.firstChild.innerText;

            if (imageUri != null && imageUri.length > 0) {

                tinymce.activeEditor.execCommand('mceInsertContent', false, '<img src="' + imageUri + '" alt="' + imageName + '"/>');

                this.setState({
                    isImageUploadOpen: false
                });

            }

        },

        render: function () {

            manywho.log.info('Rendering Content: ' + this.props.id);

            var model = manywho.model.getComponent(this.props.id, this.props.flowKey);
            var state = manywho.state.getComponent(this.props.id, this.props.flowKey) || {};
            var outcomes = manywho.model.getOutcomes(this.props.id, this.props.flowKey);
            var value = (state) ? state.contentValue : model.contentValue;
            var isValid = !(model.isValid === false || state.isValid === false);

            var attributes = {
                id: 'content-' + this.props.id,
                placeholder: model.hintValue,
                maxLength: model.maxSize,
                cols: model.width,
                rows: model.height,
                value: value
            };

            attributes['data-flowkey'] = this.props.flowKey;

            if (!this.props.isDesignTime)
                attributes.defaultValue = value;

            if (!model.isEnabled)
                attributes.disabled = 'disabled';

            if (model.isRequired)
                attributes.required = '';

            if (!model.isEditable)
                attributes.readOnly = 'readonly';

            var classNames = [
                    'form-group',
                    (model.isVisible == false) ? 'hidden' : '',
                    (isValid) ? '' : 'has-error'
                ]
                .concat(manywho.styling.getClasses(this.props.parentId, this.props.id, 'content', this.props.flowKey))
                .join(' ');

            var childElements = [React.DOM.label({
                    htmlFor: 'content-' + this.props.id
                }, [
                    model.label,
                    (model.isRequired) ? React.DOM.span({
                        className: 'input-required'
                    }, ' *') : null
                ]),
                React.DOM.textarea(attributes, null),
                React.DOM.span({
                    className: 'help-block'
                }, model.validationMessage || state.validationMessage),
                outcomes && outcomes.map(function (outcome) {
                    return React.createElement(manywho.component.getByName('outcome'), {
                        id: outcome.id,
                        flowKey: this.props.flowKey
                    });
                }, this)
            ];

            if (this.state.isImageUploadOpen) {

                childElements.push(this.renderFileDialog());

            }

            return React.DOM.div({
                className: classNames,
                id: this.props.id
            }, childElements);

        }

    });

    manywho.component.register('content', content);

}(manywho, window));