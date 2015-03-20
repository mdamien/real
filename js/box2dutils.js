(function(){
	var b2World = Box2D.Dynamics.b2World;
	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var b2AABB = Box2D.Collision.b2AABB;
	var b2BodyDef = Box2D.Dynamics.b2BodyDef;
	var b2Body = Box2D.Dynamics.b2Body;
	var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	var b2Fixture = Box2D.Dynamics.b2Fixture;
	var b2MassData = Box2D.Collision.Shapes.b2MassData;
	var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
	var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
	
	Box2dUtils = function(scale) {
		this.SCALE = scale;
	}
	
	Box2dUtils.prototype = {

			createWorld : function(context) {
		         var world = new b2World(
		        		 new b2Vec2(0, 10),
		        		 true
		        );
	
		         var debugDraw = new b2DebugDraw();

		         debugDraw.SetSprite(context);
		         debugDraw.SetFillAlpha(0.3);
		         debugDraw.SetLineThickness(1.0);
		         debugDraw.SetDrawScale(this.SCALE*1.0);

				 debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		         world.SetDebugDraw(debugDraw);
	
		         return world;
			},
			
			createBody : function(type, world, x, y, dimensions, angle, fixed, userData) {

				if (typeof(fixed) == 'undefined') {
					fixed = true;
				}

				var fixDef = new b2FixtureDef();
				fixDef.userData = userData;

				switch (type) {
					case 'box':
						fixDef.shape = new b2PolygonShape();
						if (angle == null) {
							fixDef.shape.SetAsBox(dimensions.width / this.SCALE, dimensions.height / this.SCALE);
						} else {
							fixDef.shape.SetAsOrientedBox(dimensions.width / this.SCALE, dimensions.height / this.SCALE, 
									new b2Vec2(0, 0),
									angle * (Math.PI / 180)); 
						}
						break;
					case 'ball':
						fixDef.shape = new b2CircleShape(dimensions.radius / this.SCALE);
						break;
				}

				var bodyDef = new b2BodyDef();

				bodyDef.position.x = x / this.SCALE;
				bodyDef.position.y = y / this.SCALE;
				if (fixed) {
					bodyDef.type = b2Body.b2_staticBody;
				} else {
					bodyDef.type = b2Body.b2_dynamicBody;
					fixDef.density = 1.0;
					fixDef.restitution = 0.5;
				}
				return world.CreateBody(bodyDef).CreateFixture(fixDef);
			},
	
			createBox : function(world, x, y, width, height, angle, fixed, userData) {
				var dimensions = {
						width: width,
						height: height
				};
				return this.createBody('box', world, x, y, dimensions, angle, fixed, userData);
			},

			createBall : function(world, x, y, radius, fixed, userData) {
				var dimensions = {
					radius: radius	
				};
				return this.createBody('ball', world, x, y, dimensions, null, fixed, userData);
			},
			
			createPlayer : function(world, x, y, radius, userData) {
				var playerObject = this.createBall(world, x, y, radius, false, userData);
				playerObject.SetDensity(2);
				playerObject.SetRestitution(0.2);
				playerObject.SetFriction(0);
				playerObject.GetBody().SetSleepingAllowed(false);
				playerObject.GetBody().SetFixedRotation(true);
				
				var footDef = new b2FixtureDef();
				footDef.friction = 2;
				footDef.userData = 'footPlayer';
				footDef.shape = new b2PolygonShape();
				footDef.shape.SetAsOrientedBox(10 / this.SCALE, 10 / this.SCALE, 
						new b2Vec2(0, radius / 1.8 / this.SCALE),
						0
				);
				playerObject.GetBody().CreateFixture(footDef);
				
				return playerObject;
			},
			
			createPig : function(world, stage, x, y) {
				var body = this.createBall(world, x, y, 30, false, 'pig');
				return new Pig(body, stage, this.SCALE);
			},
			
			createShortTree : function(world, stage, x, y) {
				var body = this.createBall(world, x, y, 45, true, 'shortTree');
				return new ShortTree(body, stage, x, y, this.SCALE);
			},

			createPlayer : function(world, x, y, radius, userData) {
				var playerObject = this.createBall(world, x, y, radius, false, userData);
				playerObject.SetDensity(2);
				playerObject.SetRestitution(0.2);
				playerObject.SetFriction(0);
				playerObject.GetBody().SetSleepingAllowed(false);
				playerObject.GetBody().SetFixedRotation(true);
				
				var footDef = new b2FixtureDef();
				footDef.friction = 2;
				footDef.userData = 'footPlayer';
				footDef.shape = new b2PolygonShape();
				footDef.shape.SetAsOrientedBox(10 / this.SCALE, 10 / this.SCALE, 
						new b2Vec2(0, radius / 1.8 / this.SCALE),	// position relative to body's center
						0											// angle
				);
				playerObject.GetBody().CreateFixture(footDef);
				
				return playerObject;
			},

			addLineFixture: function(body, coords){
			    var fixDef = new b2FixtureDef;
			    fixDef.shape = new b2PolygonShape;
			    fixDef.density = 1.0;
			    fixDef.friction = 1.0;
			    fixDef.restitution = 0;
			    fixDef.userData = "line";
			    fixDef.shape.SetAsArray(coords,2
			                );
			    body.CreateFixture(fixDef);
			    return fixDef;
			},

			addPhysicLine: function(world, coords) {
			    var bodyDef = new b2BodyDef;
			    bodyDef.type = b2Body.b2_staticBody;
			    bodyDef.position.Set(0,0);
			    bodyDef.userData = "line";
			    var body = world.CreateBody(bodyDef);
			    this.addLineFixture(body, coords);
			    return body;
			}
	}
}());