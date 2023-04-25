import React from 'react';

import { Box, Button, Typography, Tooltip, Paper, Link } from '@mui/material';

import CopyrightIcon from '@mui/icons-material/Copyright';
import StopIcon from '@mui/icons-material/Stop';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SettingsIcon from '@mui/icons-material/Settings';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';

const { ipcRenderer } = window.require('electron');

export default function Control() {
    const [streaming, setStreaming] = React.useState(false);

    const startStream = () => {
        setStreaming(true);
        ipcRenderer.send("startStream");
    };

    const stopStream = () => {
        setStreaming(false);
        ipcRenderer.send("stopStream");
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }} padding={1}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: "space-evenly" }}>
                    {!streaming && (
                        <Tooltip title="Start Stream" placement="bottom" arrow>
                            <Button 
                                fullWidth
                                size="large"
                                variant="contained"
                                color="success"
                                onClick={() => startStream()}
                                sx={{ mr: 1 }}
                                endIcon={<FiberManualRecordIcon sx={{ ml: -1.5 }} />}
                            />
                        </Tooltip>
                    )}
                    {streaming && (
                        <Tooltip title="Stop Stream" placement="bottom" arrow>
                            <Button 
                                fullWidth
                                size="large"
                                variant="contained"
                                color="error"
                                onClick={() => stopStream()}
                                sx={{ mr: 1 }}
                                endIcon={<StopIcon sx={{ ml: -1.5 }} />}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Settings" placement="bottom" arrow>
                        <Button fullWidth size="large" variant="outlined" color="primary" onClick={() => ipcRenderer.send('showSettings')} sx={{ mr: 1 }} endIcon={<SettingsIcon sx={{ ml: -1.5 }} />} />
                    </Tooltip>
                    <Tooltip title="Select Region" placement="bottom" arrow>
                        <Button fullWidth size="large" variant="outlined" color="primary" onClick={() => ipcRenderer.send('selectRegion')} endIcon={<PhotoSizeSelectSmallIcon sx={{ ml: -1.5 }} />} />
                    </Tooltip>
                </Box>
            </Paper>

            
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between" }}>
                    <Typography variant="caption" color="gray" sx={{ mt: 1 }}>
                        Copyright <CopyrightIcon fontSize="inherit" /> {new Date().getFullYear()},
                        Licensed under the MIT License
                    </Typography>

                    <Typography variant="caption" sx={{ mt: 1 }}>
                        <Link sx={{ cursor: "pointer" }} onClick={() => ipcRenderer.send("showSettings", { tab: 1 })}>About</Link>
                    </Typography>
                </Box>
                
        </Box>
    );
}