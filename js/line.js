(function(){
	b2Vec2 = Box2D.Common.Math.b2Vec2;

	Line = function(box2dUtils, world, stage, scale, coords) {
		this.box2dUtils = box2dUtils;
		this.world = world;
		this.skin = null;
		this.body == null;
		this.stage = stage;
		this.scale = scale;
		this.coords = coords;
		this.init();
	};
	
	Line.prototype = {
		
		init: function() {
			var line = new createjs.Shape();
			this.stage.addChild(line);
			this.skin = line;
			this.update_graphics();
			this.update_physics();

		},

		update_physics: function(){
			if(this.body == null){
				if(this.coords[0].x != this.coords[1].x){
					this.body = this.box2dUtils.addPhysicLine(
						this.world,this.coords)
				}
			}else{
				this.body.DestroyFixture(this.body.GetFixtureList())
				this.box2dUtils.addLineFixture(this.body, this.coords)
			}
		},

		update_graphics: function(){
			var line = this.skin;
			line.graphics.clear();
			line.graphics.setStrokeStyle(3);
			line.graphics.beginStroke('orange');
			line.graphics.moveTo(this.coords[0].x*this.scale,
					this.coords[0].y*this.scale);
			line.graphics.lineTo(this.coords[1].x*this.scale,
					this.coords[1].y*this.scale);
			line.graphics.endStroke();
			this.skin = line;
			this.stage.addChild(line);
		},

		setEnd: function(end) {
			this.coords[1] = end;
			this.update_physics();
			this.update_graphics();
		},
	};
	
}());