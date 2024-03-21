function process(ctx, threshold=40){
    // ctx.fillStyle = "red";
    // ctx.fillRect(0,0,100,100);
    const imgData = ctx.getImageData(0,0,ctx.canvas.width, ctx.canvas.height);
    const data = imgData.data;
    const ballCenter = {x:0, y:0};
    const bluePixels = [];
    let count=0;
    const ballMin = {x: ctx.canvas.width, y: ctx.canvas.height };
    const ballMax = {x: 0, y: 0 };
    for (let i = 0; i< data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const blueness = Math.min(b-r, b-g);

        if(blueness > threshold){
            //Shifted technique
            const [h, s, l] = rgbToHsl(r, g, b);
            const shiftedHue = h + 0.5;
            const [r2, g2, b2] = hslToRgb(shiftedHue, s, l);
            data[i] = r2;
            data[i+1] = g2;
            data[i+2] = b2;
            data[i+3] = 90;  // alpha value to put object behind the orange (inside)

            const x = (i / 4) % ctx.canvas.width;
            const y = Math.floor(i / 4 / ctx.canvas.width);
            bluePixels.push({x,y});
            ballCenter.x += x;
            ballCenter.y += y;
            count++;
        }
    }

    // if no blue pixels exit
    if(count==0) 
        return;

    ballCenter.x /= count;
    ballCenter.y /= count;

    // if no blue pixels exit
    const ballRadius = Math.sqrt(count / Math.PI);

    // create a temporary canvas to store the marker
    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCanvas.width = ctx.canvas.width;
    tmpCanvas.height = ctx.canvas.height;
    tmpCtx.putImageData(imgData, 0, 0);

    for (let i = 0; i< data.length; i += 4) {
        data[i+3] = 255;  // make it non-transparent again
    }
    ctx.putImageData(imgData, 0, 0);  // put it back on the main image

    // ctx.drawImage(dragonballImage, ballLeft, ballTop, ballRadius * 2, ballRadius * 2);

    const {center, radius} = getBetterCircleProperties(ctx, ballCenter, ballRadius, bluePixels);

    drawStars(ctx, center, radius * starScalingFactor, starCount);

    ctx.drawImage(tmpCanvas, 0, 0);

    // the halo
    ctx.beginPath();
    const deltaRadius = radius * 0.4;
    const grd=ctx.createRadialGradient(
        center.x, center.y, radius-deltaRadius / 2,
        center.x, center.y, radius+deltaRadius / 2
    );
    grd.addColorStop(0,"rgba(255, 255, 0, 0)");
    grd.addColorStop(0.5,"rgba(255, 255, 0, 0.5)");
    grd.addColorStop(1,"rgba(255, 255, 0, 0)");

    ctx.fillStyle = grd;
    ctx.arc(center.x, center.y, radius + deltaRadius / 2, 0, 2 * Math.PI);
    ctx.fill();

}

function getBetterCircleProperties(ctx, center, radius, bluePixels){
    let newCenter = center;
    let newRadius = radius;

    /*
    //TODO:  Figure out a better way to move the center of the circle
    //using morphological dilation for the bluePixels.

    const err=computeError(center, radius, bluePixels);
    let prevErr=1;
    while(prevErr > err){
        newRadius += 1;
        prevErr=err;
        err = computeError(newCenter,newRadius, bluePixels);
    }

    for(let i = 1; i <=100; i++){
        const deltaX = Math.random()*newRadus*2-newRadius;
        const deltaY = Math.random()*newRadus*2-newRadius;

        const candCenter =  {x:newCenter.x + deltaX, y: newCenter.y + deltaY};
        computeError(candError)
    }

    console.log(err);
    */

    return { center: newCenter, radius: newRadius };
}

function computeError(center, radius, bluePixels){
    let error = 0;
    for (let i=0; i < bluePixels.length; i++){
        const {x,y} = bluePixels[i];
        const dx = x - center.x;
        const dy = y - center.y;
        const distance = dx * dx + dy * dy;
        if(distance > radius ** 2){
            error += 1;
        }
    }
    return error / bluePixels.length;
}

function drawStars(ctx, center, radius, count){
    switch(count) {
        case 1: 
            drawStar(ctx, center, radius * starScalingFactor);
            break;
        case 2:
        case 3:
        case 4:
        case 5:
            drawStarsInCircle(ctx, center, radius, count);
            break;
        case 6:
            drawStarsInCircle(ctx, center, radius, count-1);
            drawStar(ctx, center, radius * starScalingFactor);
            break;
        case 7:
            drawStarsInCircle(ctx, center, radius, count-1);
            drawStar(ctx, center, radius * starScalingFactor);
            break;

    }
}

function drawStarsInCircle(ctx, center, radius, count){
    for (let i=0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        drawStar(ctx, {x,y}, radius * starScalingFactor);
    }
}

function drawStar(ctx, center, radius) {
    ctx.beginPath();
    const minRadius = radius * 0.4;
    for (let i = 0; i < 10; i++){
        const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
        const rad=(i % 2 === 0) ? radius : minRadius;
        const x = center.x + rad * Math.cos(angle);
        const y = center.y + rad * Math.sin(angle);
        if (i===0) {
            ctx.moveTo(x,y);
        } else {
            ctx.lineTo(x,y);
        }
    }
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
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