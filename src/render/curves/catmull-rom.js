//Export Catmull-Roll curve generator
export function catmullRomCurve (ctx, tension) {
    return new CatmullRom(ctx, tension);
}

//Parse a tension value
let parseTension = function (value) {
    if (typeof value === "number") {
        if (0 < value && value <= 1) {
            return value;
        }
    }
    //Return the default value
    return 0.5;
};

//Catmull Rom curve generator
class CatmullRom {
    constructor(ctx, tension) {
        this.ctx = ctx;
        this.state = 0;
        //Parse and save the tension
        this.tension = parseTension(tension) * 12;
        //Stored points
        this.x0 = null, this.y0 = null;
        this.x1 = null, this.y1 = null;
        this.x2 = null, this.y2 = null;
    }
    //Finish the interpolation
    end() {
        //Check the current state
        if (this.state === 2) {
            this.point(this.x2, this.y2);
        }
        //Clear the state
        this.state = 3;
    }
    //Add a new point
    point(x, y) {
        //State 0 or 3: first point added or resume the interpolation
        if (this.state === 0 || this.state === 3) {
            //Move to the specified point only if is the first point
            if (this.state === 0) {
                this.ctx.move(x, y);
            }
            //Draw a line to the specified point
            else {
                this.ctx.line(x, y);
            }
            //Duplicate this point
            this.x2 = x, this.y2 = y;
            this.state = 1;
        }
        //State 1: second point added --> update the state and continue
        else if (this.state === 1) {
            this.state = 2;
        }
        //State 2: new point: draw the curve
        else if (this.state === 2) {
            //First control point
            let c1x = (-this.x0 + this.tension * this.x1 + this.x2) / this.tension;
            let c1y = (-this.y0 + this.tension * this.y1 + this.y2) / this.tension;
            //Second control point
            let c2x = (this.x1 + this.tension * this.x2 - x) / this.tension;
            let c2y = (this.y1 + this.tension * this.y2 - y) / this.tension;
            //Build the bezier curve
            this.ctx.bezierCurve(c1x, c1y, c2x, c2y, this.x2, this.y2);
        }
        //Update the points
        this.x0 = this.x1, this.y0 = this.y1;
        this.x1 = this.x2, this.y1 = this.y2;
        this.x2 = x, this.y2 = y;
    }
}

