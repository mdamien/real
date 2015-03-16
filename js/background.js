(function(){
    Background = function(stage, scale, options) {
        this.skin = null;
        this.stage = stage;
        this.scale = scale;
        this.options = options;
        this.container = new createjs.Container();
        this.stage.addChild(this.container);
        this.init();
    };
    
    Background.prototype = {
        
        init: function() {
            this.setImage(this.options.img)
        },

        setImage: function(img){
            if(this.skin == null){
                this.container.removeChild(this.skin);
            }
            this.options.img = img;
            var bitmap = new createjs.Bitmap(this.options.img);

            bitmap.x = 0;
            bitmap.y = 0;

            bitmap.scaleX = this.options.scale;
            bitmap.scaleY = this.options.scale;

            this.width = bitmap.width*bitmap.scaleX;
            this.height = bitmap.height*bitmap.scaleY;

            this.container.addChild(bitmap);

            this.skin = bitmap;
        },
    };
    
}());