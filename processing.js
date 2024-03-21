function process(ctx, threshold=60){
    // ctx.fillStyle = "red";
    // ctx.fillRect(0,0,100,100);
    const imgData = ctx.getImageData(0,0,ctx.canvas.width, ctx.canvas.height);
    const data = imgData.data;
    const ballMin = {x: ctx.canvas.width, y: ctx.canvas.height };
    const ballMax = {x: 0, y: 0 };
    // let count=0;   
    let ok=false; 
    for (let i = 0; i< data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const blueness = Math.min(b-r, b-g);

        if(blueness > threshold){
            ok=true;
        // Creates a negative of the image
        // data[i] = 255 - data[i];
        // data[i+1] = 255 - data[i+1];
        // data[i+2] = 255 - data[i+2];

        // Shifted technique
        // const [h, s, l] = rgbToHsl(r, g, b);
        // const shiftedHue = h + 0.5;
        // const [r2, g2, b2] = hslToRgb(shiftedHue, s, l);
        // data[i] = r2;
        // data[i+1] = g2;
        // data[i+2] = b2;
            data[i+3] = 0;
            const x = (i / 4) % ctx.canvas.width;
            const y = Math.floor(i / 4 / ctx.canvas.width);
            if (x < ballMin.x) ballMin.x = x;
            if (x > ballMax.x) ballMax.x = x;
            if (y < ballMin.y) ballMin.y = y;
            if (y > ballMax.y) ballMax.y = y;

            // ballCenter.x += x;
            // ballCenter.y += y;
            // count++;
        }
    }

    // if no blue pixels exit
    if(ok==false)
        return;

    // ballCenter.x /= count;
    // ballCenter.y /= count;
    const ballCenter = {
        x: (ballMin.x + ballMax.x) / 2,
        y: (ballMin.y + ballMax.y) / 2
    };
    const ballRadius = Math.max(
        (ballMax.x - ballMin.x) / 2,
        (ballMax.y - ballMin.y) / 2
    );

    // create a temporary canvas to store the marker
    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCanvas.width = ctx.canvas.width;
    tmpCanvas.height = ctx.canvas.height;
    tmpCtx.putImageData(imgData, 0, 0);

    //ctx.putImageData(imgData, 0, 0);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const ballLeft = ballCenter.x - ballRadius;
    const ballTop = ballCenter.y - ballRadius;

    ctx.drawImage(dragonballImage, ballLeft, ballTop, ballRadius * 2, ballRadius * 2);

    // ctx.beginPath();
    // ctx.arc(ballCenter.x, ballCenter.y, ballRadius * 0.5, 0, 2 * Math.PI);
    // ctx.fillStyle = "red";
    // ctx.fill();

    // and put this back
    ctx.drawImage(tmpCanvas, 0, 0);
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb(h, s, l){
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1/ 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return  p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s -l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [r * 255, g * 255, b * 255];
}