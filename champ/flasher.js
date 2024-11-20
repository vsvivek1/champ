import blessed from 'blessed';

// Create a screen object
const screen = blessed.screen({
    smartCSR: true,
    title: 'Trading Reminder'
});

// Create a box to display the message
const messageBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '80%',
    height: '30%',
    content: '',
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        border: { fg: 'red' },
        fg: 'yellow',
        bg: 'black'
    }
});

// Append the message box to the screen
screen.append(messageBox);

// Exported function to display the message and clear it after 2 seconds
/* export const flashMessage = (message) => {
    messageBox.setContent(`{center}${message}{/center}`);
    screen.render();

    // Clear the message after 2 seconds
    setTimeout(() => {
        messageBox.setContent('');
        screen.render();
    }, 2000); // 2 seconds to hide the message
}; */

// Exit the program with 'q' or 'ESC'
//screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
