(function(){
    b2Vec2 = Box2D.Common.Math.b2Vec2;

    Player = function(stage, scale, img) {
        this.stage = stage;
        this.scale = scale;
        this.box2dUtils = new Box2dUtils(scale);
        this.body = null;
        this.jumpContacts = 0;
        this.jetpack_activated = false;
        this.animationToPlay = "stand"
        this.bitmap = null

        var data = {
            images: ["img/character/walking_1v2.png", "img/character/walking_2v2.png", "img/character/walking_3v2.png", "img/bird.png"],
            //frames: { regX: 250, regY: 220, width: 400, height: 400 },
            frames: { regX: 250, regY: 220, width: 474, height: 384 },
            animations: {
                stand: 3,
                walk: {
                    frames: [0, 1, 2, 1, "stand"],
                    speed: 0.2
                }
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);
        this.bitmap = new createjs.Sprite(spriteSheet, this.animationToPlay);
        this.bitmap.framerate = 5;


        this.bitmap.x = this.x;
        this.bitmap.y = this.y;

        this.BITMAP_SCALE = 0.15
        this.bitmap.scaleX = this.BITMAP_SCALE;
        this.bitmap.scaleY = this.BITMAP_SCALE;
        
        this.stage.addChild(this.bitmap);

        this.skin = this.bitmap;
    }

    Player.prototype = {
        playAnimation: function(animation) {
            if (animation != this.animationToPlay) {
                this.bitmap.gotoAndPlay(animation);
            }
            this.animationToPlay = animation;
        },

        updateAnimation: function(keys) {
            if (keys[37] || keys[39]) {
                this.playAnimation("walk")
            } else {
                this.playAnimation("stand")
            }
        },

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
                        new b2Vec2(0, -25),
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