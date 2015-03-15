(function(){
	// "Import" des classes box2dweb
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
	// "Import" des classes box2dweb "Joints"
	var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;
	var b2DistanceJointDef =  Box2D.Dynamics.Joints.b2DistanceJointDef;
	var b2RevoluteJointDef =  Box2D.Dynamics.Joints.b2RevoluteJointDef;
	var b2PrismaticJointDef =  Box2D.Dynamics.Joints.b2PrismaticJointDef;
	var b2PulleyJointDef =  Box2D.Dynamics.Joints.b2PulleyJointDef;
	var b2LineJointDef =  Box2D.Dynamics.Joints.b2LineJointDef;
	var b2WeldJointDef =  Box2D.Dynamics.Joints.b2WeldJointDef;
	var b2FrictionJointDef =  Box2D.Dynamics.Joints.b2FrictionJointDef;
	var b2GearJointDef =  Box2D.Dynamics.Joints.b2GearJointDef;
	
	/**
	 * Constructeur
	 */
	Box2dUtils = function(scale) {
		this.SCALE = scale;	// Définir l'échelle
	}
	
	/**
	 * Classe Box2dUtils
	 */
	Box2dUtils.prototype = {
	
			/**
			 * Créer le "monde" 2dbox
			 * @param context le contexte 2d dans lequel travailler
			 * @return b2World
			 */
			createWorld : function(context) {
		         var world = new b2World(
		        		 new b2Vec2(0, 10),	// gravité
		        		 true				// doSleep
		        );
	
		         // Définir la méthode d'affichage du débug
		         var debugDraw = new b2DebugDraw();
		         // Définir les propriétés d'affichage du débug
		         debugDraw.SetSprite(context);		// contexte
		         debugDraw.SetFillAlpha(0.3);		// transparence
		         debugDraw.SetLineThickness(1.0); 	// épaisseur du trait
		         debugDraw.SetDrawScale(this.SCALE*1.0);		// échelle
		         // Affecter la méthode de d'affichage du débug au monde 2dbox
				 debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		         world.SetDebugDraw(debugDraw);
	
		         return world;
			},
			
			/**
			 * Créer un objet
			 * @param string type : le type d'objet à créer
			 * @param b2World world : le monde 2dbox dans lequel ajouter l'objet
			 * @param Number x : position x de l'objet
			 * @param Number y : position y de l'objet
			 * @param Object dimensions : les dimensions de l'objet
			 * @param Number angle : angle d'inclinaison (nullable)
			 * @param Boolean fixed : l'objet est-il statique ou dynamique
			 * @param * userData : propriétés spécifiques de l'objet
			 * @return l'objet dans le monde 2dbox
			 */
			createBody : function(type, world, x, y, dimensions, angle, fixed, userData) {
				// Par défaut, l'objet est statique
				if (typeof(fixed) == 'undefined') {
					fixed = true;
				}
				// Créer l'élément Fixture
				var fixDef = new b2FixtureDef();
				fixDef.userData = userData;		// attribuer les propriétés spécifiques de l'objet
				// Dessiner l'objet en fonction de son type : sa forme et ses dimensions
				switch (type) {
					case 'box':
						fixDef.shape = new b2PolygonShape();
						if (angle == null) {
							fixDef.shape.SetAsBox(dimensions.width / this.SCALE, dimensions.height / this.SCALE);
						} else {
							fixDef.shape.SetAsOrientedBox(dimensions.width / this.SCALE, dimensions.height / this.SCALE, 
									new b2Vec2(0, 0),			// position par rapport au centre du body
									angle * (Math.PI / 180)); 	// angle d'orientation (en radians)
						}
						break;
					case 'ball':
						fixDef.shape = new b2CircleShape(dimensions.radius / this.SCALE);
						break;
				}
				// Créer l'élément Body
				var bodyDef = new b2BodyDef();
				// Affecter la position à l'élément Body
				bodyDef.position.x = x / this.SCALE;
				bodyDef.position.y = y / this.SCALE;
				if (fixed) {
					// élément statique
					bodyDef.type = b2Body.b2_staticBody;
				} else {
					// élément dynamique
					bodyDef.type = b2Body.b2_dynamicBody;
					fixDef.density = 1.0;
					fixDef.restitution = 0.5;
				}
				// Assigner l'élément fixture à l'élément body et l'ajouter au monde 2dbox
				return world.CreateBody(bodyDef).CreateFixture(fixDef);
			},
	
			/**
			 * Créer un objet "box"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la box
			 * @param Number x : position x de la box
			 * @param Number y : position y de la box
			 * @param Number width : la largeur de la box
			 * @param Number height : la hauteur de la box
			 * @param Number angle : angle d'inclinaison (nullable)
			 * @param Boolean fixed : la box est-elle statique ou dynamique
			 * @param * userData : propriétés spécifiques de la box
			 * @return la box dans le monde 2dbox
			 */
			createBox : function(world, x, y, width, height, angle, fixed, userData) {
				// Définir les dimensions de la box
				var dimensions = {
						width: width,
						height: height
				};
				// Appel à createBody()
				return this.createBody('box', world, x, y, dimensions, angle, fixed, userData);
			},
	
			/**
			 * Créer un objet "ball"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la ball
			 * @param Number x : position x de la ball
			 * @param Number y : position y de la ball
			 * @param Number radius : le rayon de la ball
			 * @param Boolean fixed : la ball est-elle statique ou dynamique
			 * @param * userData : propriétés spécifiques de la ball
			 * @return la ball dans le monde 2dbox
			 */
			createBall : function(world, x, y, radius, fixed, userData) {
				// Définir les dimensions de la ball
				var dimensions = {
					radius: radius	
				};
				// Appel à createBody()
				return this.createBody('ball', world, x, y, dimensions, null, fixed, userData);
			},
			
			/**
			 * Créer un objet "player"
			 * @param b2World world : le monde 2dbox dans lequel ajouter le player
			 * @param Number x : position x du player
			 * @param Number y : position y du player
			 * @param Number radius : le rayon du player
			 * @param * userData : propriétés spécifiques du player
			 * @return le player dans le monde 2dbox
			 */
			createPlayer : function(world, x, y, radius, userData) {
				// Créer le body player
				var playerObject = this.createBall(world, x, y, radius, false, userData);
				playerObject.SetDensity(2);
				playerObject.SetRestitution(0.2);
				playerObject.SetFriction(0);
				playerObject.GetBody().SetSleepingAllowed(false);	// l'objet player n'est pas autorisé à passer au repos
				playerObject.GetBody().SetFixedRotation(true);		// empécher le player de "rouler"
				
				// Ajouter des "pieds"
				var footDef = new b2FixtureDef();
				footDef.friction = 2;
				footDef.userData = 'footPlayer';
				footDef.shape = new b2PolygonShape();
				footDef.shape.SetAsOrientedBox(10 / this.SCALE, 10 / this.SCALE, 
						new b2Vec2(0, radius / 1.8 / this.SCALE),	// position par rapport au centre du body
						0											// angle d'orientation
				);
				playerObject.GetBody().CreateFixture(footDef);
				
				return playerObject;
			},
			
			/**
			 * Créer une liaison de type "Souris"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body : l'objet sur lequel appliquer la liaison
			 * @param Number x : la position x du point cible
			 * @param Number y : la position y du point cible
			 * @param Object options : options
			 * - force : la force maximale exercée
			 * - damping : le taux d'amortissement
			 * @return b2MouseJoint la liaison
			 */
			createMouseJoint : function(world, body, x, y, options) {
				// Instancier la classe de définition de liaison de type "souris"
				var mouseJointDef = new b2MouseJointDef();
				// Lier les bodies impliqués
				mouseJointDef.bodyA = world.GetGroundBody();
				mouseJointDef.bodyB = body;

				// Définir la position cible
				mouseJointDef.target.Set(x, y);
				
				// Définir la force maximale exercée
				mouseJointDef.maxForce = ((options && options.force) ? options.force * body.GetMass() : 100 * body.GetMass());
				// Définir le taux d'amortissement
				mouseJointDef.dampingRatio = ((options && options.damping) ? options.damping : 0.9);

				// Créer et retourner la liaison
				return world.CreateJoint(mouseJointDef);
			},
			
			/**
			 * Créer une liaison de type "Distance"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequel appliquer la liaison
			 * @param Object options : options
			 * - length : distance entre les bodies
			 * @return DistanceJoint la liaison
			 */
			createDistanceJoint : function(world, body1, body2, options) {
				// Instancier la classe de définition de liaison de type "distance"
				var distanceJointDef = new b2DistanceJointDef();
				// Initialiser la liaison
				distanceJointDef.Initialize(body1.GetBody(), body2.GetBody(), body1.GetBody().GetWorldCenter(), body2.GetBody().GetWorldCenter());
				// Appliquer la distance spécifiée entre les bodies
 				if (options && options.length) {
					distanceJointDef.length = options.length / this.SCALE;
				}
				// Créer et retourner la liaison
				return world.CreateJoint(distanceJointDef);
			},
			
			/**
			 * Créer une liaison de type "Glissière"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequel appliquer la liaison (si null : groundBody)
			 * @param b2Vec2 axis : le vecteur définissant l'axe de liaison
			 * @param Object options : options
			 * - limits (array[lower, upper]) : limites basse et haute de la translation
			 * - motor (array[force, speed]) : force et vitesse du moteur
			 * @return PrismaticJoint la liaison
			 */
			createPrismaticJoint : function(world, body1, body2, axis, options) {
				// Instancier la classe de définition de liaison de type "glissière"
				var prismaticJointDef = new b2PrismaticJointDef();
				// Récupérer le bodyA
				if (body2 == null) {
					body2 = world.GetGroundBody();
				} else {
					body2 = body2.GetBody();
				}
				// Initialiser la liaison
				prismaticJointDef.Initialize(body2, body1.GetBody(), body1.GetBody().GetWorldCenter(), axis);
				
				// Fixer les limites de la translation
				if (options && options.limits) {
					prismaticJointDef.lowerTranslation = options.limits[0] / this.SCALE;
					prismaticJointDef.upperTranslation = options.limits[1] / this.SCALE;
					prismaticJointDef.enableLimit = true;
				} else {
					prismaticJointDef.enableLimit = false;
				}
				
				// Activer le moteur
				if (options && options.motor) {
					prismaticJointDef.maxMotorForce = options.motor[0];
					prismaticJointDef.motorSpeed = options.motor[1];
					prismaticJointDef.enableMotor = true;
				} else {
					prismaticJointDef.enableMotor = false;
				}
				return world.CreateJoint(prismaticJointDef);
			},
			
			/**
			 * Créer une liaison de type "Linéaire"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequel appliquer la liaison (si null : groundBody)
			 * @param b2Vec2 axis : le vecteur définissant l'axe de liaison
			 * @param Object options : options
			 * - limits (array[lower, upper]) : limites basse et haute de la translation
			 * - motor (array[force, speed]) : force et vitesse du moteur
			 * @return LineJoint la liaison
			 */
			createLineJoint : function(world, body1, body2, axis, options) {
				// Instancier la classe de définition de liaison de type "linéaire"
				var lineJointDef = new b2LineJointDef();
				// Préparer le bodyA
				if (body2 == null) {
					body2 = world.GetGroundBody();
				} else {
					body2 = body2.GetBody();
				}
				// Initialiser la liaison
				lineJointDef.Initialize(body2, body1.GetBody(), body1.GetBody().GetWorldCenter(), axis);
				
				// Fixer les limites de la translation
				if (options && options.limits) {
					lineJointDef.lowerTranslation = options.limits[0] / this.SCALE;
					lineJointDef.upperTranslation = options.limits[1] / this.SCALE;
					lineJointDef.enableLimit = true;
				} else {
					lineJointDef.enableLimit = false;
				}
				
				// Activer le moteur
				if (options && options.motor) {
					lineJointDef.maxMotorForce = options.motor[0];
					lineJointDef.motorSpeed = options.motor[1];
					lineJointDef.enableMotor = true;
				} else {
					lineJointDef.enableMotor = false;
				}
				// Créer et retourner la liaison
				return world.CreateJoint(lineJointDef);
			},
			
			/**
			 * Créer une liaison de type "Soudure"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequell appliquer la liaison
			 * @param Object options : options
			 * - anchor (b2Vec2 / Array) : point d'ancrage de la liaison
			 * @return WeldJoint la liaison
			 */
			createWeldJoint : function(world, body1, body2, options) {
				// Instancier la classe de définition de liaison de type "soudure"
				var weldJointDef = new b2WeldJointDef();
				// Préparer le bodyA
				if (body2 == null) {
					body2 = world.GetGroundBody();
				} else {
					body2 = body2.GetBody();
				}
				
				// Définir le point d'ancrage
				if (options && options.anchor) {
					if (options.anchor instanceof b2Vec2) {
						anchor = options.anchor;
					} else {
						anchor = new b2Vec2(options.anchor[0] / this.SCALE, options.anchor[1] / this.SCALE);
					}
				} else {
					anchor = body1.GetBody().GetWorldCenter();
				}

				// Initialiser la liaison
				weldJointDef.Initialize(body2, body1.GetBody(), anchor);
				
				// Créer et retourner la liaison
				return world.CreateJoint(weldJointDef);
			},
			
			/**
			 * Créer une liaison de type "Pivot"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequell appliquer la liaison
			 * @param Object options : options
			 * - anchor (b2Vec2 / Array) : point d'ancrage de la liaison
			 * - motor (array[force, speed]) : force et vitesse du moteur
			 * @return RevoluteJoin la liaison
			 */
			createRevoluteJoint : function(world, body1, body2, options) {
				// Instancier la classe de définition de type "pivot"
				var revoluteJointDef = new  b2RevoluteJointDef();
				// Préparer le bodyA
				if (body2 == null) {
					body2 = world.GetGroundBody();
				} else {
					body2 = body2.GetBody();
				}
				
				// Définir le point d'ancrage
				if (options && options.anchor) {
					if (options.anchor instanceof b2Vec2) {
						anchor = options.anchor;
					} else {
						anchor = new b2Vec2(options.anchor[0] / this.SCALE, options.anchor[1] / this.SCALE);
					}
				} else {
					anchor = body1.GetBody().GetWorldCenter();
				}
				
				// Initialiser la liaison
				revoluteJointDef.Initialize(body2, body1.GetBody(), anchor);
				
				// Activer le moteur
				if (options && options.motor) {
					revoluteJointDef.maxMotorTorque = options.motor[0];
					revoluteJointDef.motorSpeed = options.motor[1];
					revoluteJointDef.enableMotor = true;
				} else {
					revoluteJointDef.enableMotor = false;
				}
				
				// Créer et retourner la liaison
				return world.CreateJoint(revoluteJointDef);
			},
			
			/**
			 * Créer une liaison de type "Poulie"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequel appliquer la liaison
			 * @param Array anchor1 : les coordonnées x et y appliquée à la première ancre de la liaison
			 * @param Array anchor2 : les coordonnées x et y appliquée à la seconde ancre de la liaison
			 * @param Object options : options
			 * - maxLength1 : la longueur max du segment 1
			 * - maxLength2 : la longueur max du segment 2
			 * - ratio : le rapport de la poulie
			 * @return PulleyJoint la liaison
			 */
			createPulleyJoint : function(world, body1, body2, anchor1, anchor2, options) {
				// Instancier la classe de définition de type "poulie"
				var pulleyJointDef = new b2PulleyJointDef();
				// Récupérer les ancres des bodies
				var anchorBody1 = body1.GetBody().GetWorldCenter();
				var anchorBody2 = body2.GetBody().GetWorldCenter();
				// Calculer les ancres au groundBody
				var groundAnchor1 = new b2Vec2(anchor1[0] / this.SCALE, anchor1[1] / this.SCALE); 
				var groundAnchor2 = new b2Vec2(anchor2[0] / this.SCALE, anchor2[1] / this.SCALE);
				
				// Définir le ratio
				ratio = (options && options.ratio) ? options.ratio : 1;
				
				// Initialiser la liaison
				pulleyJointDef.Initialize(body1.GetBody(), body2.GetBody(), groundAnchor1, groundAnchor2, anchorBody1, anchorBody2, ratio);
				
				// Définir les longueurs de segments maximum
				if (options && options.maxLength1) {
					pulleyJointDef.maxLengthA = options.maxLength1 / this.SCALE;
				}
				if (options && options.maxLength2) {
					pulleyJointDef.maxLengthB = options.maxLength2 / this.SCALE;
				}
				
				// Créer et retourner la liaison
				return world.CreateJoint(pulleyJointDef);
			},
			
			/**
			 * Créer une liaison de type "Friction"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequell appliquer la liaison (si null : groundBody)
			 * @param Numeric maxForce : la force max de la friction
			 * @return FrictionJoint la liaison
			 */
			createFrictionJoint : function(world, body1, body2, maxForce) {
				// Instancier la classe de définition de type "poulie"
				var frictionJointDef = new b2FrictionJointDef();
				// Préparer le bodyB
				if (body2 == null) {
					body2 = world.GetGroundBody();
				} else {
					body2 = body2.GetBody();
				}
				// Initialiser la liaison
				frictionJointDef.Initialize(body1.GetBody(), body2, body1.GetBody().GetWorldCenter());
				
				// Définir la force maximum de la friction
				frictionJointDef.maxForce = maxForce;
				
				// Créer et retourner la liaison
				return world.CreateJoint(frictionJointDef);
			},
			
			/**
			 * Créer une liaison de type "Engrenage"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la liaison
			 * @param Joint joint1 : la première liaison sur laquelle appliquer la liaison
			 * @param Joint joint2 : la seconde liaison sur la quelle appliquer la liaison
			 * @param Object body1 : le premier objet sur lequel appliquer la liaison
			 * @param Object body2 : le second objet sur lequel appliquer la liaison
			 * @param Object options : options
			 * - ratio : le rapport de la liaison
			 * @return GearJoint la liaison
			 */
			createGearJoint : function(world, joint1, joint2, body1, body2, options) {
				// Instancier la classe de définition de type "engrenage"
				var gearJointDef = new b2GearJointDef();
				
				// Définir les liaisons liées
				gearJointDef.joint1 = joint1;
				gearJointDef.joint2 = joint2;
				// Définir les bodies liés
				gearJointDef.bodyA = body1.GetBody();
				gearJointDef.bodyB = body2.GetBody();
				
				// Définir le ratio
				ratio = (options && options.ratio) ? options.ratio : 1;
				gearJointDef.ratio = ratio;
				
				// Créer et retourner la liaison
				return world.CreateJoint(gearJointDef);
			},
			
			/**
			 * Créer un objet "Pig"
			 * @param b2World world : le monde 2dbox dans lequel ajouter le cochon
			 * @param Stage stage : le stage EaselJs dans lequel dessiner le cochon
			 * @param int x : la coordonnée X du cochon
			 * @param int y : la coordonnée Y du cochon
			 * @returns Pig le cochon
			 */
			createPig : function(world, stage, x, y) {
				var body = this.createBall(world, x, y, 30, false, 'pig');
				return new Pig(body, stage, this.SCALE);
			},
			
			/**
			 * Créer un objet "ShortTree"
			 * @param b2World world : le monde 2dbox dans lequel ajouter le short tree
			 * @param Stage stage : le stage EaselJs dans lequel dessiner le short tree
			 * @param int x : la coordonnée X du short tree
			 * @param int y : la coordonnée Y du short tree
			 * @returns Pig le cochon
			 */
			createShortTree : function(world, stage, x, y) {
				var body = this.createBall(world, x, y, 45, true, 'shortTree');
				return new ShortTree(body, stage, x, y, this.SCALE);
			},
			
			
			/**
			 * Créer un objet "player"
			 * @param b2World world : le monde 2dbox dans lequel ajouter le player
			 * @param Number x : position x du player
			 * @param Number y : position y du player
			 * @param Number radius : le rayon du player
			 * @param * userData : propriétés spécifiques du player
			 * @return le player dans le monde 2dbox
			 */
			createPlayer : function(world, x, y, radius, userData) {
				// Créer le body player
				var playerObject = this.createBall(world, x, y, radius, false, userData);
				playerObject.SetDensity(2);
				playerObject.SetRestitution(0.2);
				playerObject.SetFriction(0);
				playerObject.GetBody().SetSleepingAllowed(false);	// l'objet player n'est pas autorisé à passer au repos
				playerObject.GetBody().SetFixedRotation(true);		// empécher le player de "rouler"
				
				// Ajouter des "pieds"
				var footDef = new b2FixtureDef();
				footDef.friction = 2;
				footDef.userData = 'footPlayer';
				footDef.shape = new b2PolygonShape();
				footDef.shape.SetAsOrientedBox(10 / this.SCALE, 10 / this.SCALE, 
						new b2Vec2(0, radius / 1.8 / this.SCALE),	// position par rapport centre du body
						0											// angle d'orientation
				);
				playerObject.GetBody().CreateFixture(footDef);
				
				return playerObject;
			},

			addLineFixture: function(body, coords){
			    var fixDef = new b2FixtureDef;
			    fixDef.shape = new b2PolygonShape;
			    fixDef.density = 1.0;
			    fixDef.friction = 1.0;
			    fixDef.restitution = .5;
			    fixDef.userData = "line";
			    fixDef.shape.SetAsArray(coords,2
			                );
			    body.CreateFixture(fixDef);
			    return fixDef;
			},

			addPhysicLine : function(world, coords) {
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