/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

(function (manywho) {

    const inline = React.createClass({

        render: function () {
            const children = manywho.model.getChildren(this.props.id, this.props.flowKey);

            return <div className="clearfix">
                {this.props.children || manywho.component.getChildComponents(children, this.props.id, this.props.flowKey)}
            </div>;
        }

    });

    manywho.component.registerContainer('inline_flow', inline);

    manywho.styling.registerContainer('inline_flow', (item, container) => {
        return ['pull-left'];
    });

} (manywho));
