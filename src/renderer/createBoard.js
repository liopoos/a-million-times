import { h } from '../util/dom';
import createCanvas from '../util/createCanvas';

const TWO_PI = Math.PI * 2;

const renderBackground = (ctx, options = {}) => {
    const {
        columns,
        rows,
        clockSize,
        pointerSize,
        clockColorStopTop,
        clockColorStopBottom,
        pointerColor
    } = options;

    const radius = clockSize / 2;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {

            const cx = radius + x * (clockSize + pointerSize);
            const cy = radius + y * (clockSize + pointerSize);

            const gx = x * (clockSize + pointerSize);
            const gy = y * (clockSize + pointerSize);
            const gradient = ctx.createLinearGradient(
                gx + radius,
                gy,
                gx + radius,
                gy + clockSize
            );

            gradient.addColorStop(0, clockColorStopTop);
            gradient.addColorStop(1, clockColorStopBottom);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, TWO_PI, true);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = pointerColor;
            ctx.beginPath();
            ctx.arc(cx, cy, pointerSize / 2, 0, TWO_PI, true);
            ctx.closePath();
            ctx.fill();
        }
    }
};

const renderPointer = (ctx, x1, y1, x2, y2, size, color) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

const renderForeground = (ctx, values, options = {}) => {
    const {
        columns,
        rows,
        clockSize,
        pointerSize,
        pointerColor,
        debugColor,
        debugColor2,
        debug
    } = options;

    let valuesIndex = 0;
    const radius = clockSize / 2;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const x1 = x * (clockSize + pointerSize) + radius;
            const y1 = y * (clockSize + pointerSize) + radius;

            const v1 = values[valuesIndex++];
            const theta1 = v1 * TWO_PI;
            const x2 = x1 + radius * Math.cos(theta1);
            const y2 = y1 + radius * Math.sin(theta1);

            const v2 = values[valuesIndex++];
            const theta2 = v2 * TWO_PI;
            const x3 = x1 + radius * Math.cos(theta2);
            const y3 = y1 + radius * Math.sin(theta2);

            const pointerColor1 = debug ? debugColor : pointerColor;
            const pointerColor2 = debug ? debugColor2 : pointerColor;

            renderPointer(ctx, x1, y1, x2, y2, pointerSize, pointerColor1);
            renderPointer(ctx, x1, y1, x3, y3, pointerSize, pointerColor2);
        }
    }
};

const createBoard = (columns, rows, options = {}) => {
    let currentOptions = Object.assign({}, options);
    const width = columns * options.clockSize + (columns - 1) * options.pointerSize;
    const height = rows * options.clockSize + (rows - 1) * options.pointerSize;

    const background = createCanvas(width, height);
    const backgroundCtx = background.getContext('2d');

    const foreground = createCanvas(width, height);
    const foregroundCtx = foreground.getContext('2d');

    const style = {
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        margin: '0 auto'
    };

    const el = h('div', { style }, background, foreground);

    // Initial background rendering
    const redrawBackground = () => {
        backgroundCtx.clearRect(0, 0, width, height);
        renderBackground(backgroundCtx, {
            columns,
            rows,
            clockSize: currentOptions.clockSize,
            pointerSize: currentOptions.pointerSize,
            clockColorStopTop: currentOptions.clockColorStopTop,
            clockColorStopBottom: currentOptions.clockColorStopBottom,
            pointerColor: currentOptions.pointerColor
        });
    };

    redrawBackground();

    return {
        el: () => el,
        set: values => {
            foregroundCtx.clearRect(0, 0, width, height);
            renderForeground(foregroundCtx, values, {
                columns,
                rows,
                clockSize: currentOptions.clockSize,
                pointerSize: currentOptions.pointerSize,
                pointerColor: currentOptions.pointerColor,
                debugColor: currentOptions.debugColor,
                debugColor2: currentOptions.debugColor2,
                debug: currentOptions.debug
            });
        },
        updateTheme: (newOptions) => {
            currentOptions = Object.assign({}, currentOptions, newOptions);
            redrawBackground();
            // Force redraw foreground (pointers)
            foregroundCtx.clearRect(0, 0, width, height);
        }
    };
};

export default createBoard;
