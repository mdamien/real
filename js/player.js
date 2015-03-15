(function(){
	Player = function(stage, scale) {
		this.stage = stage;
		this.scale = scale;
		this.box2dUtils = new Box2dUtils(scale);
		this.body = null;
		this.jumpContacts = 0;

		var bitmap = new createjs.Bitmap("img/bird.png");

		bitmap.x = this.x;
		bitmap.y = this.y;

		this.BITMAP_SCALE = 0.15
		bitmap.scaleX = this.BITMAP_SCALE;
		bitmap.scaleY = this.BITMAP_SCALE;

		bitmap.regX = 250;
		bitmap.regY = 170;

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
		}
	}
}());