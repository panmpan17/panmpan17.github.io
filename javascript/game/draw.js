function drawWiredCircle(context, x, y, radius, color) {
    let originalStrokeStyle = context.strokeStyle;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, TWO_PI);
    context.stroke();
    context.strokeStyle = originalStrokeStyle;
}

function drawCircle(context, x, y, radius, color) {
    let originalFillStyle = context.fillStyle;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, TWO_PI);
    context.fill();
    context.fillStyle = originalFillStyle;
}

function drawRect(context, x, y, width, height, color, rotation) {
    let originalFillStyle = context.fillStyle;
    context.fillStyle = color;
    context.save();
    context.translate(x + width / 2, y + height / 2);
    context.rotate(rotation);
    context.beginPath();
    context.rect(-width / 2, -height / 2, width, height);
    context.fill();
    context.restore();
    context.fillStyle = originalFillStyle;
}

function drawText(context, text, x, y, color = 'black') {
    let originalFillStyle = context.fillStyle;
    context.font = "15px serif";
    context.fillStyle = color;
    context.fillText(text, x, y);
    context.fillStyle = originalFillStyle;
}