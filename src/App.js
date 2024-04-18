import './App.css';

import React from 'react';
import CaptureBoarder from './CaptureBoarder';
import Control from './Control';
import Selector from './Selector';
import Settings from './Settings';
import Viewer from './Viewer';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import CssBaseline from '@mui/material/CssBaseline';
import green from '@mui/material/colors/green';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create the initial theme for the application.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: green,
  },
});

function App() {
  // Get the content parameter from the URL.
  const urlParams = new URLSearchParams(window.location.search);
  const content = urlParams.get('content');
  
  // Load the appropriate page based on the content parameter.
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        {(content === "viewer") && (<Viewer />)}
        {(content === "selector") && (<Selector />)}
        {(content === "settings") && (<Settings />)}
        {(content === "control") && (<Control />)}
        {(content === "capture_boarder") && (<CaptureBoarder />)}
      </ThemeProvider>
  );
}

export default App;
