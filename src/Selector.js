const React = require('react');

const { ipcRenderer } = window.require('electron');

export default function Selector() {
    const [saveHover, setSaveHover] = React.useState(false);
    const [cancelHover, setCancelHover] = React.useState(false);

    return (
        <div style={{ 
            cursor: 'pointer',
            WebkitUserSelect: "none",
            WebkitAppRegion: "drag",
            width: "100%",
            height: "100vh",
            backgroundColor: "black",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '16px' }}>Resize / Position Window to Select Region</h3>
            <div 
                style={{ 
                    WebkitAppRegion: 'no-drag',
                    padding: '8px',
                    border: '1px solid green',
                    backgroundColor: saveHover ? 'green' : 'black',
                    color: 'white',
                    marginBottom: '16px'
                }}
                onMouseEnter={() => setSaveHover(true)}
                onMouseLeave={() => setSaveHover(false)}
                onClick={() => ipcRenderer.send('saveRegion')}
            >
                Save Selection
            </div>
            <div
                style={{
                    WebkitAppRegion: 'no-drag',
                    padding: '8px',
                    border: '1px solid red',
                    backgroundColor: cancelHover ? 'red' : 'black',
                    color: 'white'
                }}
                onMouseEnter={() => setCancelHover(true)}
                onMouseLeave={() => setCancelHover(false)}
                onClick={() => ipcRenderer.send('closeRegionSelector')}
            >
                Cancel
            </div>
        </div>
    );
}