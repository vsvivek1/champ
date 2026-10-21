// EDIT ME: enable/disable target locking, and the profit % that triggers it.
// When target is true and a position's profit reaches targetPct, the
// trailing check fires an immediate exit to lock in the gain, the same way
// it does for a give-back or 3-candle-low breach.
const target = true;
const targetPct = 10;

module.exports = { target, targetPct };
