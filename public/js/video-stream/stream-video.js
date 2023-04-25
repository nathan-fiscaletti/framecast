const { spawn } = require('child_process');
const chalk = require('chalk');

const ffmpeg = require('ffmpeg-static').replace(
    'app.asar',
    'app.asar.unpacked'
);

module.exports = {
    startVideoStreamProcess: async ({
        offsetX = 0,
        offsetY = 0,
        width = 500,
        height = 500,
        frameRate = 60,
        bitRate = "10M",
        streamPort = 8081,
        showRegion = false,
        screenId = 1,
        scaleFactor = 1,
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
                // Determine the FFmpeg index for the screen on which the recording
                // will be made. This is necessary because the index is not the same
                // as the screen ID.
                const output = await new Promise((resolve, reject) => {
                    try {
                        let deviceListOutput = "";
                        const listDevicesCommand = spawn(
                            ffmpeg,
                            [
                                "-f", "avfoundation", "-list_devices", "true", "-i", "\"\""
                            ]
                        );
                        listDevicesCommand.stderr.on('data', function (data) {
                            deviceListOutput += data.toString();
                        });
                        listDevicesCommand.stdout.on('data', function (data) {
                            deviceListOutput += data.toString();
                        });
                        listDevicesCommand.on('close', function (code) {
                            return resolve(deviceListOutput);
                        });
                    } catch (err) {
                        reject(err);
                    }
                });

                let screenIndexes = [];
                const lines = output.split(/\r?\n/);
                for (const line of lines) {
                    if (line.includes("indev")) {
                        if (line.includes("Capture screen")) {
                            const idx = parseInt(line.split("[").pop().split("]").shift().trim());
                            screenIndexes = [...screenIndexes, idx];
                        }
                    }
                }

                const ffmpegScreenIndex = screenIndexes[screenId - 1];

                // To list screens: `./node_modules/ffmpeg-static/ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep indev | grep screen`

                // Update the width, height, and offset values to account for the
                // screen scaling factor.
                width = width * scaleFactor;
                height = height * scaleFactor;
                offsetX = offsetX * scaleFactor;
                offsetY = offsetY * scaleFactor;

                args = [
                    "-probesize", "10M",
                    "-f", "avfoundation", "-framerate", `${frameRate}`, "-video_device_index", `${ffmpegScreenIndex}`, "-i", "\":none\"", "-vf", `crop=${width}:${height}:${offsetX}:${offsetY}`, '-capture_cursor', 'true',
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




