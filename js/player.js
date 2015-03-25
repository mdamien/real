(function(){
    b2Vec2 = Box2D.Common.Math.b2Vec2;

    Player = function(stage, scale, img) {
        this.stage = stage;
        this.scale = scale;
        this.box2dUtils = new Box2dUtils(scale);
        this.body = null;
        this.jumpContacts = 0;
        this.jetpack_activated = true;

        //SpriteSheet data for Sprite animation.
        var data = {
            images: ["img/bird.png", "img/carotte.png"],
            frames: { regX: 250, regY: 190, width: 400, height: 370 },
            animations: {
                stand:0,
                walk: {
                    frames: [0, 1],
                    speed: 0.1
                }
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);
        var bitmap = new createjs.Sprite(spriteSheet, "walk");
        bitmap.framerate = 5;

        bitmap.gotoAndPlay("walk");

    //    var bitmap = new createjs.Bitmap(img);
        bitmap.x = this.x;
        bitmap.y = this.y;

        this.BITMAP_SCALE = 0.15
        bitmap.scaleX = this.BITMAP_SCALE;
        bitmap.scaleY = this.BITMAP_SCALE;

      //  bitmap.regX = 250;
    //    bitmap.regY = 190;

        this.stage.addChild(bitmap);

        this.skin = bitmap;
    }
    
    Player.prototype = {

        createPlayer : function(world, x, y, radius) {
            this.body = this.box2dUtils.createPlayer(world, x, y, radius, 'player');
        },
    
        jump : function() {
            if (this.jumpContacts > 0) {
                this.body.GetBody().ApplyImpulse(
                        new b2Vec2(0, -12),
                        this.body.GetBody().GetWorldCenter());
            }
            else {
                if(this.jetpack_activated){
                    this.body.GetBody().ApplyForce(
                        new b2Vec2(0, -2),
                        this.body.GetBody().GetWorldCenter());
                }
            }
        },
        
        moveRight : function() {
            var vel = this.body.GetBody().GetLinearVelocity();
            vel.x = 140 / this.scale;
        },
        
        moveLeft : function() {
            var vel = this.body.GetBody().GetLinearVelocity();
            vel.x = -140 / this.scale;
        },

        update: function() {
            this.skin.x = this.body.GetBody().GetWorldCenter().x * this.scale;
            this.skin.y = this.body.GetBody().GetWorldCenter().y * this.scale;
            this.skin.scaleX = (this.body.GetBody().GetLinearVelocity().x > -0.001 ? 1 : -1)*this.BITMAP_SCALE;
        },

        setPos: function(x, y) {
            this.body.m_body.SetPosition({x:x, y:y});
        }
    }
}());