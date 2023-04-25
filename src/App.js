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

import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import deepOrange from '@mui/material/colors/green';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: deepOrange,
  },
});

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const content = urlParams.get('content');

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        {(content === "viewer") && (<Viewer />)}
        {(content === "selector") && (<Selector />)}
        {(content === "settings") && (<Settings />)}
        {(content === "control") && (<Control />)}
          {/* return (<Viewer />);
        } else if (content === "selector") {
          return (<Selector />);
        } else if (content === "settings") {
          return (<Settings />);
        } else if (content === "control") {
          return (<Control />);
        } */}
      </ThemeProvider>
  );
}

export default App;
