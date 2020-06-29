//Color palette
export const palette = {
    //Categorical palettes
    "default": ["#F8766E","#E78601","#C99800","#A3A602","#6BB102","#01BB37","#00BF7C","#02BFAF","#00BCD9","#01B0F7","#619DFF","#B883FF","#E86CF3","#FD60D1","#FE67A4"],
    //Sequential single-hue
    "blues": ["#f7fbff","#c6dbef","#6baed6","#2171b5","#08306b"],
    "greens": ["#f7fcf5","#c7e9c0","#74c476","#238b45","#00441b"],
    "oranges": ["#fff5eb","#fdd0a2","#fd8d3c","#d94801","#7f2704"],
    "reds": ["#fff5f0","#fcbba1","#fb6a4a","#cb181d","#67000d"],
    "purples": ["#fcfbfd","#dadaeb","#9e9ac8","#6a51a3","#3f007d"],
    "grays": ["#ffffff","#d9d9d9","#969696","#525252","#000000"],
    //Secuential multi-hue
    "yellow-red": ["#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],
    //Diverging palette
    "spectral": ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]
};

//Get a color palette
export function getPalette (name) {
    return (typeof palette[name] !== "undefined") ? palette[name] : palette["default"];
}


