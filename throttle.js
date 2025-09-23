// globalThrottle.js
const { Throttle } = require("stream-throttle");

class GlobalThrottle {
  constructor() {
    // Bandwidths from your MPD (bps)
    this.qualityMap = {
      0: 500_000, // 360p
      1: 1_000_000, // 480p
      2: 2_000_000, // 720p
    };
    this.bitrate = this.qualityMap[0]; // default
  }

  // Set bitrate manually in bps
  setBitrate(bps) {
    this.bitrate = bps;
  }

  // Set bitrate based on quality index (0,1,2)
  setQuality(index) {
    if (this.qualityMap[index] !== undefined) {
      this.bitrate = this.qualityMap[index];
    } else {
      console.warn(
        `Quality index ${index} not defined, keeping current bitrate`
      );
    }
  }

  // Return a throttle stream
  getThrottleStream() {
    return new Throttle({ rate: this.bitrate / 8 }); // convert bps -> B/s
  }
}

// Export singleton
module.exports = new GlobalThrottle();
