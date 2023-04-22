const React = require('react');

const { ipcRenderer } = window.require('electron');

ipcRenderer.on("settings", (event, settings) => {
    document.getElementById("webSocketPort").value = settings.webSocketPort;
    document.getElementById("streamPort").value = settings.streamPort;
    document.getElementById("frameRate").value = settings.frameRate;
    document.getElementById("bitRate").value = settings.bitRate;
    document.getElementById("showRegion").checked = settings.showRegion;
});

function saveSettings() {
    const settings = {
        webSocketPort: document.getElementById("webSocketPort").value,
        streamPort: document.getElementById("streamPort").value,
        frameRate: document.getElementById("frameRate").value,
        bitRate: document.getElementById("bitRate").value,
        showRegion: document.getElementById("showRegion").checked,
    };
    ipcRenderer.send("updateSettings", settings);
}

export default function Settings() {
    const [saveHover, setSaveHover] = React.useState(false);

    React.useEffect(() => {
        ipcRenderer.send("getSettings");
    }, []);

    return (
        <div style={{ backgroundColor: 'black', color: 'white', width: '100%', height: '100vh', padding: '16px' }}>
            <h1>Settings</h1>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: '16px', width: '200px' }}>Web Socket Port:</div>
                    <div style={{ width: '200px' }}>
                        <input type="number" id="webSocketPort" style={{ width: '100%' }} min="255" max="65535" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: '16px', width: '200px' }}>Stream Port:</div>
                    <div style={{ width: '200px' }}>
                        <input type="number" id="streamPort" style={{ width: '100%' }} min="255" max="65535" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: '16px', width: '200px' }}>Frame Rate (fps):</div>
                    <div style={{ width: '200px' }}>
                        <input type="number" id="frameRate" style={{ width: '100%' }} min="1" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: '16px', width: '200px' }}>Bit Rate (kbps):</div>
                    <div style={{ width: '200px' }}>
                        <input type="number" id="bitRate" style={{ width: '100%' }} min="1" max="100000" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ marginRight: '16px', width: '200px' }}>Show Recording Region:</div>
                    <div style={{ width: '200px' }}>
                        <input type="checkbox" id="showRegion" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '16px' }}>
                    <div style={{ marginRight: '16px', width: '200px' }}></div>
                    <div style={{ width: '200px', textAlign: 'right' }}>
                    <div
                        style={{
                            padding: '8px',
                            border: '1px solid green',
                            backgroundColor: saveHover ? 'green' : 'black',
                            color: 'white',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={() => setSaveHover(true)}
                        onMouseLeave={() => setSaveHover(false)}
                        onClick={() => saveSettings()}
                    >
                        Save
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}