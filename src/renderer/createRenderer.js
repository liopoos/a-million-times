import createBoard from './createBoard';
import createDebugger from './createDebugger';

const createRenderer = (root, options = {}) => {
    const {
        columns,
        rows,
        clockSize,
        pointerSize,
        debug,
        debugTarget,
        backgroundColor,
        clockColorStopTop,
        clockColorStopBottom,
        pointerColor,
        debugColor,
        debugColor2,
        debugColorText
    } = options;

    root.style.backgroundColor = backgroundColor;

    const board = createBoard(columns, rows, {
        clockSize,
        pointerSize,
        clockColorStopTop,
        clockColorStopBottom,
        pointerColor,
        debug,
        debugColor,
        debugColor2
    });

    root.appendChild(board.el());

    let debugBoard;
    if (debug) {
        debugBoard = createDebugger(columns, rows, {
            clockSize,
            pointerSize,
            debugColor,
            debugColor2,
            debugColorText
        });
        root.appendChild(debugBoard.el());
    }

    const updateTheme = (themeOptions) => {
        // Update root background color
        root.style.backgroundColor = themeOptions.backgroundColor;
        
        // Update clock canvas
        board.updateTheme({
            clockColorStopTop: themeOptions.clockColorStopTop,
            clockColorStopBottom: themeOptions.clockColorStopBottom,
            pointerColor: themeOptions.pointerColor
        });

        // Update debug view styles
        if (debug && debugBoard) {
            const debugElement = debugBoard.el();
            debugElement.style.color = themeOptions.debugColorText;
            const debugItems = debugElement.querySelectorAll('.debug-item');
            debugItems.forEach(item => {
                item.style.color = themeOptions.debugColor;
            });
        }

        // Update options
        Object.assign(options, themeOptions);
    };

    const render = function render(values, velocities) {
        board.set(values);
        if (debug) {
            const target = debugTarget === 'values' ? values : velocities;
            debugBoard.set(target);
        }
    };

    return Object.assign(render, {
        updateTheme
    });
};

export default createRenderer;
