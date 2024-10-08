// notifier.js

import { exec } from 'child_process';
import path from 'path';

/**
 * Plays a sound or sends a notification based on the input.
 * 
 * @param {boolean} isSuccess - A boolean flag indicating whether the notification is for success or failure.
 * @param {Object} cis - The current instrument state object (optional, can be used for logging or more detailed notifications).
 */
export default function notifyWithSound(isSuccess, cis = {}) {
    try {
        let soundFile;

        if (isSuccess) {
            soundFile = path.join(__dirname, 'sounds', 'success.wav');
        } else {
            soundFile = path.join(__dirname, 'sounds', 'failure.wav');
        }

        // Play sound using the appropriate command based on OS
        const playSoundCommand = process.platform === 'win32' ? 
            `powershell -c (New-Object Media.SoundPlayer "${soundFile}").PlaySync();` :
            `afplay "${soundFile}"`; // For macOS, use `aplay` for Linux

        exec(playSoundCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error playing sound: ${stderr}`);
                return;
            }
            console.log(`Sound played successfully: ${stdout}`);
        });

        // Optional: Add more sophisticated notifications (e.g., desktop notifications) here if needed
        // Example: Using node-notifier for cross-platform desktop notifications
        // const notifier = require('node-notifier');
        // notifier.notify({
        //     title: 'Trade Notification',
        //     message: isSuccess ? 'Trade successful!' : 'Trade failed!',
        // });

    } catch (error) {
        console.error('Error in notifyWithSound:', error);
    }
}
