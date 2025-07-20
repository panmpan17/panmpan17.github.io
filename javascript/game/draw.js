function drawCircle(context, x, y, radius, color) {
    let originalFillStyle = context.fillStyle;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, TWO_PI);
    context.fill();
    context.fillStyle = originalFillStyle;
}

function drawText(context, text, x, y, color = 'black') {
    let originalFillStyle = context.fillStyle;
    context.font = "15px serif";
    context.fillStyle = color;
    context.fillText(text, x, y);
    context.fillStyle = originalFillStyle;
}