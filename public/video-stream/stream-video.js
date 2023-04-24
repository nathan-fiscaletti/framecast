const ffmpeg = require('ffmpeg-static').replace(
    'app.asar',
    'app.asar.unpacked'
);
const { spawn } = require('child_process');
const chalk = require('chalk');

module.exports = {
    startVideoStreamProcess: ({
        offsetX = 0,
        offsetY = 0,
        width = 500,
        height = 500,
        frameRate = 60,
        bitRate = "10M",
        streamPort = 8081,
        showRegion = false,
        streamSecret = "password"
    }) => {
        let args;
        switch (process.platform) {
            case 'win32': {
                args = [
                    "-probesize", "10M",
                    "-f", "gdigrab", "-framerate", `${frameRate}`, "-offset_x", `${offsetX}`, "-offset_y", `${offsetY}`, "-video_size", `${width}x${height}`, ...(showRegion ? ["-show_region", "1"] : []), "-i", "desktop",
                    "-f", "mpegts", "-codec:v", "mpeg1video", "-s", `${width}x${height}`, "-b:v", bitRate, "-bf", "0", `http://localhost:${streamPort}/${streamSecret}`
                ];
                break;
            }

            case 'darwin': {
                // To list screens: `./node_modules/ffmpeg-static/ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep indev | grep screen`
                // We will need to add a dialog on darwin to prompt the user to select a screen when selecting region, or detect which screen
                // the region selection window is on when the user confirms their selection.
                // On macos, if resolution scaling is in place we need to take that into account when starting the recording.
                // We should also separate the ffmpeg options out per-platform in the settings window.
                // Need to figure out how to pass bitrate to avfoundation
                // Also why are the screen changes so slow on mac?
                args = [
                    "-probesize", "10M",
                    "-f", "avfoundation", "-framerate", `${frameRate}`, "-video_device_index", "1", "-i", "\":none\"", "-vf", `crop=${width}:${height}:${offsetX}:${offsetY}`,
                    "-f", "mpegts", "-codec:v", "mpeg1video", "-s", `${width}x${height}`, "-b:v", bitRate, "-bf", "0", `http://localhost:${streamPort}/${streamSecret}`
                ];
                break;
            }

            default: {
                throw new Error(`Unsupported platform: ${process.platform}`);
            }
        }


        console.log(`$ ${chalk.gray(`${ffmpeg} ${args.join(" ")}`)}`);
        return spawn(
            ffmpeg, args, { stdio: 'inherit', windowsHide: true }
        );
    }
}

// Spawn notepad process and wait for it to close




