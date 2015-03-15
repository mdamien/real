var   b2Vec2 = Box2D.Common.Math.b2Vec2
,    b2AABB = Box2D.Collision.b2AABB
,    b2BodyDef = Box2D.Dynamics.b2BodyDef
,    b2Body = Box2D.Dynamics.b2Body
,    b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,    b2Fixture = Box2D.Dynamics.b2Fixture
,    b2World = Box2D.Dynamics.b2World
,    b2MassData = Box2D.Collision.Shapes.b2MassData
,    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,    b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,    b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

function addPhysicLine(start,end) {
    var fixDef = new b2FixtureDef;
    fixDef.shape = new b2PolygonShape;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = .5;
    fixDef.shape.SetAsArray([
                start,
                end],2
                );
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.Set(0,0);
    rbData = new Object();
    rbData.name = "Line";
    rbData.start = start;
    rbData.end = end;
    bodyDef.userData = rbData;
    var line = world.CreateBody(bodyDef).CreateFixture(fixDef);
    return line;
}

function addDynCircle(x,y){
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    if(Math.random() > 0.5) {
       fixDef.shape = new b2PolygonShape;
       fixDef.shape.SetAsBox(
             Math.random() + 0.1 //half width
          ,  Math.random() + 0.1 //half height
       );
    } else {
       fixDef.shape = new b2CircleShape(
          Math.random() + 0.1 //radius
       );
    }
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    world.CreateBody(bodyDef).CreateFixture(fixDef);
}

function createPlayer(x, y){
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.fixedRotation = true;

    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(0.2,0.5);
    bodyDef.position.x = x;
    bodyDef.position.y = y;
    var body = world.CreateBody(bodyDef).CreateFixture(fixDef);
    return body;
}


function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;