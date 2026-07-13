import type { RequestHandler } from './$types';

// This script will get a screenshot from the nasa eyes planet and return it for our use

export const GET: RequestHandler = async () => {
	// Function to run on the page
	/*
	(function() {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        console.error("Canvas not found! Make sure you changed the console dropdown from 'top' to the iframe context.");
        return;
    }

    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
        return originalRAF(function(timestamp) {
            callback(timestamp);
            
            // Capture frame buffer
            const dataURL = canvas.toDataURL('image/png');
            
            // Spawn raw image window
            const newTab = window.open();
            if (newTab) {
                newTab.document.write(`<img src="${dataURL}" style="max-width:100%; background:#000; display:block; margin:auto;"/>`);
            } else {
                console.log("Popup blocked! Copy and paste this data string into a browser URL bar instead:\n\n", dataURL);
            }
            
            window.requestAnimationFrame = originalRAF;
        });
    };
    console.log("Capture armed. Click and drag the planet slightly to force a frame draw.");
})();
*/
	return new Response();
};
