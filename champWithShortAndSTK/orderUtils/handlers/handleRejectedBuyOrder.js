export function handleRejectedBuyOrder(cis) {
    
    setTimeout(() => {
        cis.ordered = false;
    }, 30 * 1000);
}
