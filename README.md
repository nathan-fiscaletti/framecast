<p align="center">
    <img src="./public/icon.png" width="300" alt="Logo">
</p>

# Advanced Screen Streamer

### The problem

Normally, when sharing your screen, video conferencing applications only allow you to share a specific window, a browser tab, or an entire screen. If you choose to share a specific window, you are unable to drag another window onto the stream without re-sharing your screen. You are also unable to share multiple windows at once without sharing your entire screen.

### The solution

Advanced Screen Streamer is an electron application that leverages FFMPEG to stream a region of your screen to a window. Using this, you can share the selected region by selecting the "Viewer" window from Advanced Screen Streamer in your video conferencing application when you start sharing your screen.

**This is especially useful when you are running on an Ultrawide display.**

## Download

[Download Latest Version](https://github.com/nathan-fiscaletti/advanced-screen-streamer/releases/latest)

## Video Preview

[![Preview](https://i.imgur.com/A7EOJ9l.png)](https://youtu.be/5-75Qg5y3yQ)

## Supported Platforms 

- [X] Windows
- [X] macOS
    - Multi-monitor support is currently functional on macOS, however you may experience issues on some systems due to the ordering of the displays. (The application might stream the left display even though you've selected a region on the right display). To fix this you can attempt re-ordering the displays in the Settings application.
- [ ] Linux
