//Step curve generator
class Step {
    constructor(ctx, position) {
        this.ctx = ctx;
        this.position = position;
        this.state = 0;
        //Previous points
        this.x = null, this.y = null;
    }
    //End the interpolation
    end() {
        //Draw a line to the last specified points
        this.ctx.line(this.x, this.y);
        this.state = 2;
    }
    //Add a new point
    point(x, y) {
        //Step 0: move to the specified point
        if (this.state === 0) {
            this.ctx.move(x, y);
            this.state = 1;
        }
        //State 1: build the step interpolation
        else if (this.state === 1) {
            let xc = this.x + this.position * (x - this.x);
            this.ctx.line(xc, this.y);
            this.ctx.line(xc, y);
        }
        //State 2: draw a line to the specified point
        else if (this.state === 2) {
            this.ctx.line(x, y);
            this.state = 1;
        }
        //Save this point
        this.x = x;
        this.y = y;
    }
}


//Default step interpolation generator
export function stepCurve (ctx) {
    return new Step(ctx, 0.5);
}

//Step after
export function stepAfterCurve (ctx) {
    return new Step(ctx, 1);
}

//Step before
export function stepBeforeCurve (ctx) {
    return new Step(ctx, 0);
}

