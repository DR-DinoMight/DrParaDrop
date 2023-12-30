import { gridWidth,
    gridHeight,
    parachuteSymbol,
    targetSymbol,
    crashSymbol,
    successSymbol } from './config.js';

/**
 * Generates an ASCII art animation grid showing a parachute drop.
 * Calculates the parachute position and renders it in the grid for each
 * iteration of the drop animation. Handles the final landing position
 * and rendering the target landing pad.
 */
export const getParachuteAnimation = (iteration, success, landingPad, landingPoint, lastPosition) => {

    const translatedLandingPad = Math.floor((landingPad / 100) * gridWidth);
    const translatedLandingPoint = Math.floor((landingPoint / 100) * gridWidth);

    let grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(' '));
    // Calculate the parachute position based on the iteration
    let parachutePosition;
    if (iteration === gridHeight - 1) {
        // Final iteration, ensure the parachute lands on the exact landing point
        parachutePosition = translatedLandingPoint;
    } else {
        // Smooth falling animation, limit movement to a maximum of 1 cell in any direction
        const previousPosition = lastPosition || translatedLandingPoint; // Use the previous position or the landing point
        const newPosition = Math.max(0, Math.min(gridWidth - 1, previousPosition + getRandomMovement()));
        parachutePosition = newPosition;
    }

    // Place the parachute symbol in the calculated position
    grid[iteration][parachutePosition] = parachuteSymbol;

    // Place the target symbol in the last row
    grid[gridHeight - 1][translatedLandingPad] = targetSymbol;

    // If it's the last iteration, ensure the landing point is visible
    if (iteration === gridHeight - 1) {
        grid[iteration][translatedLandingPoint] = success ? successSymbol : crashSymbol;
    }

    return [grid.map((row) => row.join('')).join('\n'), parachutePosition];
}



/**
 * Helper function to get a random movement value (-1, 0, or 1).
 * Used to calculate the parachute's position in each animation frame.
 */
const getRandomMovement = () => {
    return Math.floor(Math.random() * 3) - 1;
}
