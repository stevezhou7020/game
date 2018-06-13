cc.Class({
    extends: cc.Component,

    properties: {        
        vis: true,

        number: {
            default: 1,
            step: 1,
        },

        color: {
            default: 1,
            step: 1,
        },

        originPos: 0,
        selectable: false,
        selected: false,
    },

    updateCard: function() {
        var nodes = this.node.children[0].children;
        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            node.active = this.vis;
            if (node.name == "number") {
                var spr = node.getComponent(cc.Sprite);
                if (this.color == 1 || this.color == 3) {
                    spr.spriteFrame = cc.ResourceMgr.cards["b_" + this.number]; 
                }
                else {
                    spr.spriteFrame = cc.ResourceMgr.cards["r_" + this.number]; 
                }
            }
            else if (node.name == "color") {
                var spr = node.getComponent(cc.Sprite);
                spr.spriteFrame = cc.ResourceMgr.cards["TypeS" + this.color]; 
            }
            else if (node.name == "center") {
                var spr = node.getComponent(cc.Sprite);
                spr.spriteFrame = cc.ResourceMgr.cards["Type" + this.color]; 
            }
        }

        var bk = this.node.children[0].getComponent(cc.Sprite);
        if (this.vis)
            bk.spriteFrame = cc.ResourceMgr.cards["poker"];
        else
            bk.spriteFrame = cc.ResourceMgr.cards["pokerbk"];
    },

    set: function(id, _vis) {
        if (_vis === true || _vis === false)
            this.vis = _vis;

        if (id >= 0) {
            if (id <= 0x0D) {
                this.number = id;
                this.color = 4;
            }
            else if (id <= 0x1D) {
                this.number = id - 0x10;
                this.color = 3;
            }
            else if (id <= 0x2D) {
                this.number = id - 0x20;
                this.color = 2;
            }
            else if (id <= 0x3D) {
                this.number = id - 0x30;
                this.color = 1;
            }
        }

        this.updateCard();
    },

    get: function() {
        return this.number;
    },

    select: function(_selected) {
        if (this.selectable && this.selected != _selected) {
            this.selected = _selected;

            if (this.selected) {
                this.originPos = this.node.y;
                this.node.y = this.node.y + 30;
            }
            else
                this.node.y = this.originPos;
        }
    },

    onLoad: function() {
        this.updateCard();
    },

    onClicked: function() {
        this.select(!this.selected);
    },

    // called every frame
    // update: function (dt) {

    // },
});
