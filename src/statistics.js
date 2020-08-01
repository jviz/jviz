import {quantile} from "./math.js";
import {range} from "./util.js";

//Welford's algorithm for calculating the mean of a sample.
export function mean (x) {
    let n = x.length; //Get the number of points
    if (n === 0) {
        return NaN; //No points to calculate the mean
    }
    let m = 0; //TO store the mean
    for (let i = 0; i < n; i++) {
        m = m + (x[i] - m) / (i + 1);
    }
    //Return the mean
    return m;
}

//Calculate the median of a sample
export function median (x) {
    return quantile(0.5, x);
}

//Welford's algorithm for calculating the variance of a sample
export function variance (x) {
    let n = x.length; //Get the number of points
    //console.log(`n --> ${n}`);
    if (n === 0) {
        return NaN; //No points to calculate the variance
    }
    else if (n === 1) {
        return 0; //Only one point --> no variance
    }
    let delta = 0; 
    let m = 0; //To accumulate the mean
    let sum = 0;
    for (let i = 0; i < n; i++) {
        delta = x[i] - m;
        m = m + (delta / (i + 1));
        sum = sum + delta * (x[i] - m);
    }
    //Return the variance
    return sum / (n - 1);
}

//Deviation
export function deviation() {
    return Math.sqrt(variance(x));
}

//Calculate the IQR (interquartile range) of a sample
export function iqr (x) {
    return quantile(0.75, x) - quantile(0.25, x);
}

//Kernels (https://en.wikipedia.org/wiki/Kernel_(statistics))
export function uniformKernel (x) {
    return (-1 <= x && x <= 1) ? 0.5 : 0;
}
//The gaussian kernel is also known as the normal kernel
export function gaussianKernel (x) {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}
export function cosineKernel (x) {
    return (-1 <= x && x <= 1) ? (Math.PI / 4) * Math.cos(Math.PI / 2 * x) : 0;
}
export function epanechnikovKernel (x) {
    return (-1 <= x && x <= 1) ? 0.75 * (1 - x * x) : 0;
}
export function quarticKernel (x) {
    return (-1 <= x && x <= 1) ? (15 / 16) * (1 - x * x) * (1 - x * x) : 0;
}

//Bandwidth estimator
//Scott, D. W. (1992) Multivariate Density Estimation: Theory, Practice, and Visualization
export function bandwidth (x) {
    //let n = x.length;
    let sd = iqr(x) / 1.34; //See https://bmcmedresmethodol.biomedcentral.com/articles/10.1186/1471-2288-14-135
    return 1.06 * Math.min(Math.sqrt(variance(x)), sd) * Math.pow(x.length, -1/5);
}

//Kernel density estimation
//https://en.wikipedia.org/wiki/Kernel_density_estimation 
export function kde (x, samples, kernel, h) {
    let y = 0;
    //let n = samples.length;
    for (let i = 0; i < samples.length; i++) {
        y = y + kernel((x - samples[i]) / h);
    }
    //Return the density estimation
    return y / (h * samples.length);
}

//KDE but for an array of points
export function kdeMap (points, samples, kernel, h) {
    return points.map(function (x) {
        return [x, kde(x, samples, kernel, h)];
    });
}

//Esmitate a partition of the dataset provided using bins
//Uses the Freedman–Diaconis rule to determine the bin width
//https://en.wikipedia.org/wiki/Freedman%E2%80%93Diaconis_rule
export function bins (x, minbins) {
    minbins = (typeof minbins === "number" && minbins > 0) ? minbins : 10; //Parse min bins value
    let step = 2 * iqr(x) * Math.pow(x.length, -1/3);
    let domain = range(x); //Get the domain from the data
    let domainSize = domain[1] - domain[0];
    //var h = binWidth(metric), ulim = Math.max.apply(Math, metric), llim = Math.min.apply(Math, metric);
    let output = {"min": domain[0], "max": domain[1]}; //Initialize output object
    if (step <= (domainSize / x.length)) {
        //The bin step is too small --> use the minbins parameter
        return Object.assign(output, {
            "step": domainSize / minbins,
            "bins": minbins
        });
    }
    //Adjust the step for an integer bin size
    let numbins = Math.ceil(domainSize / step);
    return Object.assign(output, {
        "step": domainSize / numbins,
        "bins": numbins
    });
}


//Implementation of the Dot bin algorithm by Leland Wilkinson
// https://www.cs.uic.edu/~wilkinson/Publications/dotplots.pdf
export function dotbin (x, step, smooth) {
    let n = x.length;
    let h = 0; //Threshold
    let computedBins = []; //Computed bins
    let index = -1;
    for (let i = 0; i < n; i++) {
        //let x = x[i]; //Get value at position i
        if (i === 0 || x[i] >= h) {
            index = index + 1;
            computedBins[index] = {"startIndex": i, "endIndex": i};
            h = x[i] + step; //Update the threshold
        }
        computedBins[index].endIndex = i; //Update the last index of the current bin
    }
    //Build the position of each bin
    computedBins = computedBins.map(function (bin) {
        return Object.assign(bin, {"position": (x[bin.startIndex] + x[bin.endIndex]) / 2});
    });
    //TODO: check the smooth option
    return computedBins;
}

