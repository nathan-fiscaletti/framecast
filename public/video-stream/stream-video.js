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
                args = [
                    "-probesize", "10M",
                    "-f", "avfoundation", "-framerate", `${frameRate}`, "-video_device_index", "2", "-i", "\":none\"", "-vf", `crop=${width}:${height}:${offsetX}:${offsetY}`,
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




