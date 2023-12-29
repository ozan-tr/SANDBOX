
class Tile {
    constructor() {
        this.colors = ['transparent'];
        this.temperature = 25;
        this.mass = 1;
        this.density = 1;
        this.fluidity = 1;
        this.spawned = Date.now();
        this.lastFall = Date.now();
        this.replacable = false;
        this.thermalConductivity = 0.005;

        this.meltingPoint = undefined;
        this.freezingPoint = undefined;


    }
    finalizeProperties() {
        this.weight = this.mass * gravity;
        this.getColor();
    }
    getColor() {
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    update() {
        const pos = game.getPos(this);


    
        const neighbors = []
        if (pos.x != 0) neighbors.push(game.getTile(pos.x - 1, pos.y));
        if (pos.x != game.width - 1) neighbors.push(game.getTile(pos.x + 1, pos.y));
        if (pos.y != 0) neighbors.push(game.getTile(pos.x, pos.y - 1));
        if (pos.y != game.height - 1) neighbors.push(game.getTile(pos.x, pos.y + 1));

        const averageTemperature = neighbors.reduce((acc, cur) => acc + cur.temperature, 0) / neighbors.length;

        this.temperature = lerp(this.temperature, averageTemperature, this.thermalConductivity);

        this.checkThermal();

        if(this.constructor.name == 'Air') return this.draw(pos);

   


        if (this.fluidity <= 0) return this.draw(pos);
        if(pos.y == game.height - 1) return this.draw(pos);

 

        const tileBelow = game.getTile(pos.x, pos.y + 1);



        const fallSpeed = (this.weight + tileBelow.density) / (this.fluidity * 10)
        const timeSinceLastFall = Date.now() - this.lastFall;
        if(timeSinceLastFall < fallSpeed) return this.draw(pos);
        this.lastFall = Date.now();

        if (this.density > tileBelow.density && tileBelow.fluidity > 0) {
            game.swapTiles(pos.x, pos.y, pos.x, pos.y + 1);

        }

        if(pos.y != 0){
            //const tileAbove = game.getTile(pos.x + (Math.random()>0.5?1:-1)*(Math.floor(Math.random()*this.fluidity)), pos.y - 1);

            const tileAbove = game.getTile(pos.x, pos.y - 1);

            if(this.density < tileAbove.density && tileAbove.fluidity > 0){
                game.swapTiles(pos.x, pos.y, pos.x, pos.y - 1);
            }
        }   
        
        if(pos.x != 0){
            const tileLeft = game.getTile(pos.x - 1, pos.y);

            if(this.density > tileLeft.density && tileLeft.fluidity > this.fluidity){
                game.swapTiles(pos.x, pos.y, pos.x - 1, pos.y);
            }
        }

        if(pos.x != game.width - 1){
            const tileRight = game.getTile(pos.x + 1, pos.y);

            if(this.density > tileRight.density && tileRight.fluidity > this.fluidity){
                game.swapTiles(pos.x, pos.y, pos.x + 1, pos.y);
            }
        }





        this.draw(pos);
    }
    draw(pos) {


        if(tempView){
            const temp = mapNum(this.temperature, -50, 100, 240, 0);
            const color = hsvToRgb(temp/360, 1, 1);
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;

        }else{
            ctx.fillStyle = this.color;
        }


        ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);

        
    }
    checkThermal(){
        if(this.meltingPoint){
            if(this.temperature >= this.meltingPoint){
                const pos = game.getPos(this);
                console.log(this.meltElement)
                game.setTile(pos.x, pos.y, this.meltElement);
            }
        }
        if(this.freezingPoint){
            if(this.temperature <= this.freezingPoint){

                const pos = game.getPos(this);
                game.setTile(pos.x, pos.y, this.freezeElement);
            }
        }
    }
}



class Air extends Tile {
    constructor() {
        super();
        this.temperature = 25;
        this.mass = 1;
        this.fluidity = 2;
        this.colors = ["rgba(20,20,20,.1)", "rgba(20,20,20,.2)", "rgba(20,20,20,.3)", "rgba(20,20,20,.4)", "rgba(20,20,20,.5)", "rgba(20,20,20,.6)", "rgba(20,20,20,.7)", "rgba(20,20,20,.8)", "rgba(20,20,20,.9)", "rgba(20,20,20,1)"];
        this.density = airDensity;
        this.replacable=true;
        this.finalizeProperties();
    }
}

class Steam extends Tile {
    constructor() {
        super();
        this.colors = ['rgba(255,255,255,.1)', 'rgba(255,255,255,.2)', 'rgba(255,255,255,.3)', 'rgba(255,255,255,.4)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.6)', 'rgba(255,255,255,.7)', 'rgba(255,255,255,.8)', 'rgba(255,255,255,.9)', 'rgba(255,255,255,1)'];
        this.fluidity = 1;
        this.mass = 1;
        this.density = 0.804;
        this.temperature = 100;
        this.freezingPoint = 95;
        this.freezeElement = 'Water';
        this.finalizeProperties();

    }
}

class Ice extends Tile {
    constructor() {
        super();
        this.colors = ["rgba(100,100,255)", "rgba(100,100,220)", "rgba(100,100,240)"]
        this.fluidity = 0;
        this.mass = 1;
        this.density = 916.7;
        this.temperature = 0;
        this.meltingPoint = 5;
        this.meltElement = 'Water';
        this.finalizeProperties();
    }
}

class Sand extends Tile {
    constructor() {
        super();
        this.colors = ['rgba(255,255,0,.4)', 'rgba(255,255,0,.6)', 'rgba(255,255,0,.7)', 'rgba(255,255,0,1)'];
        this.fluidity = 0.5;
        this.mass = 1;
        this.density = 1602;
        this.finalizeProperties();
    }
}

class Dirt extends Tile {
    constructor() {
        super();
        this.colors = ['rgba(139,69,19,.4)', 'rgba(139,69,19,.6)', 'rgba(139,69,19,.7)', 'rgba(139,69,19,1)'];
        this.fluidity = 0;
        this.mass = 1;
        this.density = 1602;
        this.finalizeProperties();
    }
}

class Stone extends Tile {
    constructor() {
        super();
        this.colors = ['rgba(128,128,128,.4)', 'rgba(128,128,128,.6)', 'rgba(128,128,128,.7)', 'rgba(128,128,128,1)'];
        this.fluidity = 0;
        this.mass = 0;
        this.density = 1602;
        this.finalizeProperties();
    }
}

class Wood extends Tile {
    constructor() {
        super();
        this.colors = ['rgba(139,69,19,.4)', 'rgba(139,69,19,.6)', 'rgba(139,69,19,.7)', 'rgba(139,69,19,1)'];
        this.fluidity = 0;
        this.mass = 0;
        this.density = 1602;
        this.finalizeProperties();
    }
}

class Water extends Tile {
    constructor() {
        super();
        this.colors =  ['rgba(0,0,255,.1)', 'rgba(0,0,255,.2)', 'rgba(0,0,255,.3)', 'rgba(0,0,255,.4)', 'rgba(0,0,255,.5)', 'rgba(0,0,255,.6)', 'rgba(0,0,255,.7)', 'rgba(0,0,255,.8)', 'rgba(0,0,255,.9)', 'rgba(0,0,255,1)'];
        this.fluidity = 1;
        this.mass = 1;
        this.density = 998;
        this.meltingPoint = 99;
        this.freezingPoint = 1;
        this.meltElement = 'Steam';
        this.freezeElement = 'Ice';
        this.finalizeProperties();
    }
}

class Mercury extends Tile {
    constructor() {
        super();
        this.colors = ['rgba(255,255,255,.1)', 'rgba(255,255,255,.2)', 'rgba(255,255,255,.3)', 'rgba(255,255,255,.4)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,.6)', 'rgba(255,255,255,.7)', 'rgba(255,255,255,.8)', 'rgba(255,255,255,.9)', 'rgba(255,255,255,1)'];
        this.fluidity = 1;
        this.mass = 1;
        this.density = 13546;
        this.finalizeProperties();
    }
}
