import React from 'react';

import { Box } from '@mui/material';
const { ipcRenderer } = window.require('electron');

export default function CaptureBoarder() {
    return (
        <Box
            sx={{
                position: 'fixed', // Ensure it covers the whole screen
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                bgcolor: 'transparent', // Transparent background
                border: '5px solid red', // Red border around the viewport
                boxSizing: 'border-box', // Includes padding and border in the element's total width and height
                zIndex: 9999, // Make sure it is on top of other content
                pointerEvents: 'none' // Allows clicks to pass through to elements underneath
            }}
        ></Box>
    );
}