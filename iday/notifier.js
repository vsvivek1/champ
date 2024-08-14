import notifier from 'node-notifier';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility to get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to notify with sound
export default function notifyWithSound(condition,cis) {
    if (condition) {
        // Path to the sound file
        // Downloaded from:
        // Coin Drop Sound Effect: https://www.freesoundslibrary.com/wp-content/uploads/2018/05/coin-drop-sound-effect.mp3
        // or
        // Coins Clinking Sound Effect: https://www.freesoundslibrary.com/wp-content/uploads/2018/05/coins-clinking.mp3
        const soundFile = path.join(__dirname, 'coin_sound.mp3'); // Ensure the sound file is named appropriately

        // Notify with sound
        notifier.notify(
            {
                title: 'check',
                message: cis.tradingsymbol,
                wait: true,
                timeout: 30, // Duration in seconds
               // open: url // URL to open on click
            },
            function (err, response, metadata) {
                if (err) {
                    console.error(err);
                } else {
                    // Play the sound
                    exec(`afplay ${soundFile}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error playing sound: ${error}`);
                            return;
                        }
                    });
                }
            }
        );
    }
}
