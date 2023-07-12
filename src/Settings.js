import React from 'react';

import { styled } from '@mui/material/styles';
import {
    AppBar, Checkbox, Box, Button, Divider, TextField,
    Typography, Tabs, Tab, Tooltip, Snackbar, Alert,
    AlertTitle, Paper, Collapse, Slider, InputAdornment,
    Link, Select, MenuItem, FormControl, InputLabel,
    Slide, Dialog, DialogTitle, DialogContent,
    DialogActions, DialogContentText
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

const { ipcRenderer, shell } = window.require('electron');

const PrettoSlider = styled(Slider)({
    color: '#52af77',
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'unset',
        padding: 0,
        width: 32,
        height: 32,
        borderRadius: '50% 50% 50% 0',
        backgroundColor: '#52af77',
        transformOrigin: 'bottom left',
        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
        '&:before': { display: 'none' },
        '&.MuiSlider-valueLabelOpen': {
            transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
        },
        '& > *': {
            transform: 'rotate(45deg)',
        },
    },
});

const SlideUpDialogTransition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Settings() {
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform');
    const version = urlParams.get('version');

    const [streamPort, setStreamPort] = React.useState(0);
    const [webSocketPort, setWebSocketPort] = React.useState(0);
    const [previewVisible, setPreviewVisible] = React.useState(false);
    const [enableAnalytics, setEnableAnalytics] = React.useState(false);
    const [showRegion, setShowRegion] = React.useState(false);
    const [frameRate, setFrameRate] = React.useState(0);
    const [bitRate, setBitRate] = React.useState(0);
    const [regionBorderSize, setRegionBorderSize] = React.useState(1);

    React.useEffect(() => {
        document.querySelector("body").style = "overflow-y: scroll;";

        ipcRenderer.on("settings", (event, settings) => {
            const urlParams = new URLSearchParams(window.location.search);
            const platform = urlParams.get('platform');

            switch (platform) {
                case 'linux': {
                    setRegionBorderSize(settings.regionBorderSize);
                    setShowRegion(settings.showRegion);
                    break;
                }

                case 'win32': {
                    setShowRegion(settings.showRegion);
                    break;
                }

                default: { }
            }

            setFrameRate(settings.frameRate);
            setBitRate(settings.bitRate);
            setStreamPort(settings.streamPort);
            setWebSocketPort(settings.webSocketPort);
            setPreviewVisible(settings.previewVisible);
            setEnableAnalytics(settings.enableAnalytics);
        });

        ipcRenderer.send("getSettings");
    }, []);

    const [saveFinished, setSaveFinished] = React.useState(false);
    const [error, setError] = React.useState(null);

    const [selectedTab, setSelectedTab] = React.useState(parseInt(urlParams.get('tab')));

    const [update, setUpdate] = React.useState(null);
    const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);
    const [showUpToDate, setShowUpToDate] = React.useState(false);
    const [updateError, setUpdateError] = React.useState(null);

    const save = () => {
        try {
            let settings;

            switch (platform) {
                case 'linux': {
                    settings = {
                        regionBorderSize,
                        showRegion,
                    };
                    break;
                }

                case 'win32': {
                    settings = {
                        showRegion,
                    };
                    break;
                }

                case 'darwin': {
                    settings = {
                        showRegion: true,
                    };
                    break;
                }

                default: { }
            }

            settings = {
                ...settings,
                webSocketPort,
                streamPort,
                frameRate,
                bitRate,
                previewVisible,
                enableAnalytics,
            }

            ipcRenderer.send("updateSettings", settings);
            setError(null);
            setSaveFinished(true);
        } catch (err) {
            setError(err);
            setSaveFinished(true);
        }
    };

    const checkForUpdate = () => {
        setCheckingForUpdate(true);
        fetch("https://api.github.com/repos/nathan-fiscaletti/framecast/releases/latest")
            .then(res => res.json())
            .then(release => {
                if (release.tag_name !== `v${version}`) {
                    setUpdate(release);
                } else {
                    setShowUpToDate(true);
                }
            })
            .catch(err => { })
            .finally(() => setCheckingForUpdate(false));
    };

    return (<>
        <AppBar position="sticky" sx={{ bgcolor: 'background.paper', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', px: 3 }}>
            <Tabs variant='fullWidth' sx={{ flexGrow: 1 }} value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab label="Settings" />
                <Tab label="About" />
            </Tabs>
            <Tooltip title="Save Settings" placement="bottom" arrow>
                <Button
                    variant="contained"
                    size="medium"
                    endIcon={
                        <SaveOutlinedIcon sx={{ ml: -1.5 }} />
                    }
                    onClick={() => save()}
                    sx={{ my: 1, ml: 1 }}
                />
            </Tooltip>
        </AppBar>

        <Dialog
            open={update !== null}
            TransitionComponent={SlideUpDialogTransition}
            keepMounted
            onClose={() => setUpdate(null)}
        >
            <DialogTitle>Update Available</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Version {update && update.tag_name.replace("v", "")} of FrameCast is now available for
                    download. It is recommended that you download and install this newer version of the
                    application in order to ensure that you have the latest features and bug fixes.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => shell.openExternal(update.html_url)}>Download Update</Button>
            </DialogActions>
        </Dialog>

        {selectedTab === 0 && (
            <Box
                display="flex"
                flexDirection="column"
                width="100%"
                padding={3}>
                <Snackbar open={saveFinished} anchorOrigin={{ vertical: "bottom", horizontal: 'center' }} autoHideDuration={4000} onClose={() => setSaveFinished(false)}>
                    <Alert
                        severity={error ? 'warning' : 'success'}
                        onClose={() => setSaveFinished(false)}
                        variant="filled"
                        sx={{ width: '100%', mb: 4, ml: 3, mr: 3 }}
                    >
                        <AlertTitle>{error ? "Error" : 'Settings Saved!'}</AlertTitle>
                        {error ? error.message : "The settings have been saved successfully."}
                    </Alert>
                </Snackbar>

                <Paper elevation={3} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Application Settings</Typography>
                        <SettingsIcon />
                    </Box>
                    <Typography variant="body2" color="gray" sx={{ marginTop: 1 }}>
                        These settings are used to adjust how the screen capture software communicates with the application. The default values should work for most users.
                    </Typography>
                    <Box display="flex" flexDirection="column" justifyContent="center" gap={2} marginTop={2}>
                        <TextField required size="small" label="Web Socket Port" type="number" variant="outlined" value={webSocketPort} onChange={e => setWebSocketPort(e.target.value)} InputProps={{ min: 255, max: 65535 }} />
                        <TextField required size="small" label="Stream Port" type="number" variant="outlined" value={streamPort} onChange={e => setStreamPort(e.target.value)} InputProps={{ min: 255, max: 65535 }} />
                    </Box>
                </Paper>
                <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Stream Settings</Typography>
                        <SettingsIcon />
                    </Box>
                    <Typography variant="body2" color="gray" sx={{ marginTop: 1 }}>
                        These settings are used to adjust the invocation of the screen capture process. The default values should work for most users.
                    </Typography>
                    <Box display="flex" flexDirection="column" justifyContent="center" marginTop={2}>
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="screen-capture-backend-label">Screen Capture Backend</InputLabel>
                            <Select
                                size="small"
                                labelId="screen-capture-backend-label"
                                label="Screen Capture Backend"
                                value={0}
                                disabled
                            >
                                <MenuItem value={0}>FFmpeg (<i>-f {platform === 'win32' ? 'gdigrab' : (platform === 'darwin' ? 'avfoundation' : 'x11grab')}</i>)</MenuItem>
                            </Select>
                        </FormControl>
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="body2" color="gray" >
                                Show a preview of the selected region while streaming.
                            </Typography>
                            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                                <Divider variant='middle' orientation='vertical' flexItem />
                                <Checkbox checked={previewVisible} onChange={(_, checked) => setPreviewVisible(checked)} />
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" sx={{ mt: 1 }}>
                            <Typography>
                                Frame Rate
                            </Typography>
                            <Box display="flex" flexDirection="row" alignItems="center" gap={3}>
                                <PrettoSlider
                                    value={frameRate}
                                    size="small"
                                    min={15}
                                    max={240}
                                    step={15}
                                    onChange={(e, newValue) => setFrameRate(newValue)}
                                />
                                <TextField
                                    required
                                    size="small"
                                    id="frameRate"
                                    type="number"
                                    variant="outlined"
                                    value={frameRate}
                                    onChange={(e) => setFrameRate(e.target.value)}
                                    sx={{ minWidth: "155px" }}
                                    onBlur={() => { if (frameRate < 15) setFrameRate(15); else if (frameRate > 240) setFrameRate(240); }}
                                    InputProps={{
                                        min: 15,
                                        max: 240,
                                        endAdornment: <InputAdornment position="end">fps</InputAdornment>
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" sx={{ mt: 1 }}>
                            <Typography>
                                Bit Rate
                            </Typography>
                            <Box display="flex" flexDirection="row" alignItems="center" gap={3}>
                                <PrettoSlider
                                    value={bitRate}
                                    size="small"
                                    min={1000}
                                    max={1000000}
                                    step={10000}
                                    onChange={(e, newValue) => setBitRate(newValue)}
                                />
                                <TextField
                                    required
                                    size="small"
                                    id="bitRate"
                                    type="number"
                                    variant="outlined"
                                    value={bitRate}
                                    onChange={(e) => setBitRate(e.target.value)}
                                    sx={{ minWidth: "155px" }}
                                    onBlur={() => { if (bitRate < 1000) setFrameRate(1000); else if (bitRate > 1000000) setFrameRate(1000000); }}
                                    InputProps={{
                                        min: 1000,
                                        max: 1000000,
                                        endAdornment: <InputAdornment position="end">kbps</InputAdornment>
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    {(platform === 'win32' || platform === 'linux') && (<>
                        <Typography sx={{ mt: 2 }}>Region Visibility</Typography>
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mt: 1 }}>
                            <Typography variant="body2" color="gray" >
                                Show a border around the selected region while streaming.{platform === 'linux' && (<><br />(This feature is only supported on XCB-based x11grab)</>)}
                            </Typography>
                            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                                <Divider variant='middle' orientation='vertical' flexItem />
                                <Checkbox checked={showRegion} onChange={(_, checked) => setShowRegion(checked)} />
                            </Box>
                        </Box>
                    </>)}

                    {platform === 'linux' && (
                        <Collapse in={showRegion}>
                            <Box display="flex" flexDirection="column" justifyContent="center" gap={2} marginTop={1}>
                                <Box display="flex" flexDirection="column" sx={{ mt: 1 }}>
                                    <Box display="flex" flexDirection="row" alignItems="center" gap={3}>
                                        <PrettoSlider
                                            value={regionBorderSize}
                                            size="small"
                                            disabled={!showRegion}
                                            min={1}
                                            max={32}
                                            onChange={(e, newValue) => setRegionBorderSize(newValue)}
                                        />
                                        <TextField
                                            required
                                            size="small"
                                            id="regionBorderSize"
                                            type="number"
                                            variant="outlined"
                                            value={regionBorderSize}
                                            disabled={!showRegion}
                                            onChange={(e) => setRegionBorderSize(e.target.value)}
                                            sx={{ minWidth: "155px" }}
                                            onBlur={() => { if (regionBorderSize < 1) setRegionBorderSize(1); else if (regionBorderSize > 32) setFrameRate(32); }}
                                            InputProps={{
                                                min: 15,
                                                max: 240,
                                                endAdornment: <InputAdornment position="end">px</InputAdornment>
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Collapse>
                    )}
                </Paper>
            </Box>
        )}

        {selectedTab === 1 && (
            <Box
                display="flex"
                flexDirection="column"
                width="100%"
                padding={3}>
                <img src="./icon.png" alt="logo" width="200" height="200" style={{ alignSelf: 'center', marginBottom: '32px', marginTop: '8px' }} />
                <Collapse in={showUpToDate}>
                    <Alert
                        severity='success'
                        onClose={() => setShowUpToDate(false)}
                        variant="filled"
                        sx={{ width: '100%', mb: 2 }}
                    >
                        <AlertTitle>{error ? "Error" : 'Up to date!'}</AlertTitle>
                        {error ? error.message : "You are running the latest version of FrameCast."}
                    </Alert>
                </Collapse>

                <Collapse in={!!updateError}>
                    <Alert
                        severity='warning'
                        onClose={() => setUpdateError(null)}
                        variant="filled"
                        sx={{ width: '100%', mb: 2 }}
                    >
                        <AlertTitle>Error</AlertTitle>
                        {updateError && updateError.message}
                    </Alert>
                </Collapse>

                <Paper elevation={3} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">FrameCast</Typography>
                        <InfoOutlinedIcon />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }} gap={1}>
                        <CheckCircleOutlineIcon fontSize="inherit" color="disabled" />
                        <Typography variant="body2" color="gray" sx={{ mt: 0.40 }}>
                            Version {version}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }} gap={1}>
                        <PersonOutlinedIcon fontSize="inherit" color="disabled" />
                        <Typography variant="body2" color="gray" sx={{ mt: 0.40 }}>
                            Created by <Link sx={{ cursor: 'pointer' }} onClick={() => shell.openExternal("https://github.com/nathan-fiscaletti")}>Nathan Fiscaletti</Link>
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }} gap={1}>
                        <GavelOutlinedIcon fontSize="inherit" color="disabled" />
                        <Typography variant="body2" color="gray" sx={{ mt: 0.40 }}>
                            Licensed under the <Link sx={{ cursor: 'pointer' }} onClick={() => shell.openExternal("https://en.wikipedia.org/wiki/MIT_License")}>MIT License</Link>
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }} gap={1}>
                        <GitHubIcon fontSize="inherit" color="disabled" />
                        <Typography variant="body2" color="gray" sx={{ mt: 0.40 }}>
                            nathan-fiscaletti/framecast (<Link sx={{ cursor: 'pointer' }} onClick={() => shell.openExternal("https://github.com/nathan-fiscaletti/framecast")}>View on Github</Link>)
                        </Typography>
                    </Box>
                    <LoadingButton
                        variant="outlined"
                        size="medium"
                        loading={checkingForUpdate}
                        onClick={() => checkForUpdate()}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        Check for Update
                    </LoadingButton>
                </Paper>

                <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Analytics</Typography>
                        {/* <InfoOutlinedIcon /> */}
                    </Box>
                    <Box display="flex" flexDirection="column" justifyContent="center">
                        <Typography variant="body2" color="gray" sx={{ marginTop: 1 }}>
                            FrameCast periodically collects information about your system such as display resolution, operating system and operating system version in order to improve the application.
                        </Typography>
                        <Typography variant="body2" color="gray" sx={{ marginTop: 1 }} fontWeight="bold">
                            FrameCast does not collect any personally identifiable information.
                        </Typography>
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="body2" color="white" >
                                Share system information with FrameCast.
                            </Typography>
                            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                                <Divider variant='middle' orientation='vertical' flexItem />
                                <Checkbox checked={enableAnalytics} onChange={(_, checked) => setEnableAnalytics(checked)} />
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Attribution</Typography>
                        {/* <InfoOutlinedIcon /> */}
                    </Box>
                    <Typography variant="body2" color="gray" sx={{ marginTop: 1 }}>
                        @cycjimmy/jsmpeg-player (<Link sx={{ cursor: 'pointer' }} onClick={() => shell.openExternal("https://github.com/cycjimmy/jsmpeg-player")}>View on Github</Link>)
                    </Typography>
                    <Typography variant="body2" color="gray" sx={{ marginTop: 1 }}>
                        MaterialUI (<Link sx={{ cursor: 'pointer' }} onClick={() => shell.openExternal("https://mui.com/")}>Open Website</Link>)
                    </Typography>
                </Paper>
            </Box>
        )}
    </>);
}