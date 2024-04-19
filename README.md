<p align="center">
    <img src="./public/icon.png" width="300" alt="Logo">
</p>

# [FrameCast](https://framecast.app/)

FrameCast is a dynamic screen sharing tool designed to enhance your video conferencing experience. It leverages the power of FFMPEG to allow users to select a specific region of any monitor and share just that region. This feature is particularly useful for those who work from home and need to share detailed visual content without losing clarity on standard video conference displays.

## Downloads

- [Download for Windows (x64)](https://github.com/nathan-fiscaletti/framecast/releases/latest/download/FrameCast.Setup.windows_amd64.exe)
- [Download for Linux (x64)](https://github.com/nathan-fiscaletti/framecast/releases/latest/download/FrameCast.Setup.linux_amd64.deb)
- [Download for macOS (x64)](https://github.com/nathan-fiscaletti/framecast/releases/latest/download/FrameCast.Setup.darwin_x64.dmg)
- [Download for macOS (arm64)](https://github.com/nathan-fiscaletti/framecast/releases/latest/download/FrameCast.Setup.darwin_arm64.dmg)

## Video Preview

[![Preview](https://i.imgur.com/4F3RiCd.png)](https://youtu.be/hPjuXTlpybg)

## Key Features

- **Selective Screen Sharing**: Choose exactly what part of your screen you want to share with participants.
- **FFMPEG Backend**: Robust and high-performance media handling for smooth streaming quality.
- **Customizable Stream Settings**: Adjust the bitrate and frame rate to optimize the quality and performance of your video streams.
- **Support for Ultra-wide Displays**: Perfect for ultra-wide monitor users, ensuring that the shared content fits well on standard displays without distortion or unnecessary scaling.
- **Simple and Intuitive Interface**: Easy to use and navigate, with straightforward controls for selecting and sharing your screen region.

## Overview

When it comes to video conferencing, screen sharing is a critical feature that enables remote teams to collaborate effectively. However, the limitations of conventional screen sharing options can hinder this collaboration. For instance, if you're working on multiple windows simultaneously, you may need to switch between them while sharing your screen. In such cases, the inability to share multiple windows at once without sharing your entire desktop can be a significant drawback. Similarly, if you need to add another window to the stream, you have to re-share your screen, which can be disruptive and inconvenient.

> **FrameCast provides a way to overcome these limitations by allowing you to share a specific region of your screen instead of the entire screen or a single window.**

This can help you avoid distractions and maintain a focused, streamlined presentation. Additionally, it enables you to switch between multiple windows while sharing your screen without the need to re-share your screen, enhancing your ability to collaborate with others.

The application works through [FFMPEG](https://ffmpeg.org/), an open-source video and audio processing software, to stream a portion of your screen to a separate window that you can then select for sharing in your video conferencing application. The viewer window is fully customizable, allowing you to adjust its size, position, bit-rate and frame-rate to suit your preferences.

**This is especially useful when you are running on an Ultra-wide display.**

## Installation

Download the [Latest Version](https://github.com/nathan-fiscaletti/framecast/releases/latest) from the releases page.

## FAQ

#### Why am I getting a "File is corrupted" error when I run the macOS installer?

  - If you receive a "File is corrupted" error when trying to open the macOS installer, it is likely due to the "Quarantine" attribute being set on the file by macOS. This happens when the file is downloaded from the internet and can prevent you from opening the installer. 

    To fix this issue, you can remove the quarantine attribute from the file using the `xattr` command in the terminal. Open the terminal and run the following command:

    ```bash
    xattr -c /path/to/FrameCast.Setup.darwin_x64.dmg
    ```

    This will remove the quarantine attribute from the installer and allow you to open it.

## Usage

To use FrameCast, follow these steps:

1. Open the application.
2. Select the region of your screen that you want to share.
3. Start the stream in the application.
4. Start sharing your screen in your video conferencing application.
5. Select the "FrameCast - Viewer" window to share the selected region.

## Contributing

Contributions to FrameCast are welcome and appreciated. To contribute to the project, follow these steps:

1. Fork the project.
2. Create a new branch for your changes.
3. Make your changes and test them thoroughly.
4. Submit a pull request with your changes.

## License

FrameCast is licensed under the [MIT License](./LICENSE).
