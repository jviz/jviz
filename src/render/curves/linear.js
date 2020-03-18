//Export linear curve generator
export function linearCurve (ctx) {
    return new Linear(ctx);
}

//Linear curve generator
class Linear {
    constructor (ctx) {
        this.ctx = ctx;
        this.state = 0;
    }
    //End the line
    end () {
        //Nothing to do
    }
    //Add a new point to the interpolation
    point (x, y) {
        //State 0: move to the specified point
        if (this.state === 0) {
            this.ctx.move(x, y);
            this.state = 1;
        }
        //State 1: draw a line to this point
        else {
            this.ctx.line(x, y);
        }
    }   
}

