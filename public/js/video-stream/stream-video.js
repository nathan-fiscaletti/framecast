const { spawn } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

            case 'linux': {
                args = [
                    '-video_size', `${width}x${height}`, `-framerate`, `${frameRate}`, ...(showRegion ? ['-show_region', '1', '-region_border', '8'] : []), '-f', 'x11grab', '-i', `:0.0+${offsetX},${offsetY}`,
                    "-f", "mpegts", "-codec:v", "mpeg1video", "-s", `${width}x${height}`, "-b:v", bitRate, "-bf", "0", `http://localhost:${streamPort}/${streamSecret}`
                ];
                break;
            }

            case 'darwin': {
                const screenIndex = await getCurrentScreenIndex(screenId)

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

                const lines = output.split(/\r?\n/);
                const line = lines.find(line => line.includes(`Capture screen ${screenIndex}`))
                if (!line) {
                    throw new Error(`Unable to find Capture screen ${screenIndex} in output.`);
                }

                const ffmpegScreenIndex = parseInt(line.split("[").pop().split("]").shift().trim())

                // To list screens: `./node_modules/ffmpeg-static/ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep indev | grep screen`

                // Update the width, height, and offset values to account for the
                // screen scaling factor.
                width = width * scaleFactor;
                height = height * scaleFactor;
                offsetX = offsetX * scaleFactor;
                offsetY = offsetY * scaleFactor;

                args = [
                    "-probesize", "50M",
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

async function getCurrentScreenIndex(screenId) {
    const command = `system_profiler SPDisplaysDataType -json`;    
    try {
        const { stdout, stderr } = await exec(command);
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        const displayData = JSON.parse(stdout);
        const displays = displayData.SPDisplaysDataType.flatMap(d => d.spdisplays_ndrvs)
        const displayIndexLookup = displays.map(d => d._spdisplays_displayID)
        // eslint-disable-next-line eqeqeq
        return  displayIndexLookup.findIndex(x => x == screenId)
    } catch (error) {
        console.error('Failed to fetch display data:', error);
    }
}
