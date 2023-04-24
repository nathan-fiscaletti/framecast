import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faSquare, faGear, faExpand } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

const { ipcRenderer } = window.require('electron');

export default function Control() {
    const [streamButtonHover, setStreamButtonHover] = React.useState(false);
    const [settingsButtonHover, setSettingsButtonHover] = React.useState(false);
    const [selectRegionButtonHover, setSelectRegionButtonHover] = React.useState(false);

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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', color: 'white', width: '100%', height: '100vh' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <div
                    style={{
                        cursor: 'pointer',
                        padding: '8px',
                        border: `1px solid ${streaming ? 'red' : 'green'}`,
                        backgroundColor: streamButtonHover ? (streaming ? 'red' : 'green') : 'black',
                        color: streamButtonHover ? 'white' : (streaming ? 'red' : 'green'),
                        marginRight: '16px'
                    }}
                    onMouseEnter={() => setStreamButtonHover(true)}
                    onMouseLeave={() => setStreamButtonHover(false)}
                    onClick={() => {
                        if (streaming) {
                            stopStream();
                        } else {
                            startStream();
                        }
                    }}
                >
                    {streaming && (<>
                        <FontAwesomeIcon icon={faSquare} /> Stop Stream
                    </>)}
                    {!streaming && (<>
                        <FontAwesomeIcon icon={faCircle} /> Start Stream
                    </>)}
                </div>
                <div 
                    style={{ 
                        cursor: 'pointer',
                        padding: '8px',
                        border: '1px solid #948026',
                        backgroundColor: settingsButtonHover ? '#948026' : 'black',
                        color: settingsButtonHover ? 'white' : '#948026',
                        marginRight: '16px'
                    }}
                    onMouseEnter={() => setSettingsButtonHover(true)}
                    onMouseLeave={() => setSettingsButtonHover(false)}
                    onClick={() => ipcRenderer.send("showSettings")}
                >
                    <FontAwesomeIcon icon={faGear} /> Settings
                </div>
                <div 
                    style={{ 
                        cursor: 'pointer',
                        padding: '8px',
                        border: `1px solid #948026`,
                        backgroundColor: selectRegionButtonHover ? '#948026' : 'black',
                        color: selectRegionButtonHover ? 'white' : '#948026'
                    }}
                    onMouseEnter={() => { if(!streaming) { setSelectRegionButtonHover(true) } }}
                    onMouseLeave={() => setSelectRegionButtonHover(false)}
                    onClick={() => {
                        ipcRenderer.send('selectRegion');
                    }}
                >
                    <FontAwesomeIcon icon={faExpand} /> Select Region
                </div>
            </div>
        </div>
    );
}