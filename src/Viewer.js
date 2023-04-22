import React, { useEffect } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";

const ffmpegIP = "127.0.0.1";

const Viewer = () => {
  useEffect(() => {
    var videoUrl = `ws://${ffmpegIP}:8082/`;
    var player = new JSMpeg.VideoElement("#video-container", videoUrl, {
      autoplay: true,
      canvas: '#video-canvas',
    });
    console.log(player);
  });

  return (
    <div id="video-container" style={{
      width: '100%',
      height: '100vh',
      textAlign: "center",
      backgroundColor: "black",
      float: "left",
    }}>
      <canvas id="video-canvas" style={{
        height: '100vh',
        objectFit: "contain",
      }}></canvas>
    </div>
  );
};

export default Viewer;