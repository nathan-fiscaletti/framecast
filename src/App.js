import './App.css';

import React from 'react';
import Viewer from './Viewer';
import Selector from './Selector';
import Settings from './Settings';
import Control from './Control';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import green from '@mui/material/colors/green';

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
      </ThemeProvider>
  );
}

export default App;
