import React from 'react';

import { Box, Button, Typography } from '@mui/material';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

const { ipcRenderer } = window.require('electron');

export default function Selector() {
    return (
        <Box 
            sx={{ 
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            style={{
                WebkitUserSelect: "none",
                WebkitAppRegion: "drag",
                cursor: 'pointer',
            }}
        >
            <Typography variant="h6">
                Resize / Position Window to Select Region
            </Typography>
            <Box 
                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', mt: 1 }}
            >
                <Button 
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="warning"
                    onClick={() => ipcRenderer.send('closeRegionSelector')}
                    sx={{ mr: 1 }}
                    style={{ WebkitAppRegion: 'no-drag', }}
                    startIcon={<CancelOutlinedIcon />}
                >
                    Cancel
                </Button>
                <Button 
                    fullWidth
                    size="large"
                    variant="contained"
                    color="success"
                    onClick={() => ipcRenderer.send('saveRegion')}
                    sx={{ mr: 1 }}
                    style={{ WebkitAppRegion: 'no-drag', }}
                    startIcon={<SaveOutlinedIcon />}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
}