import net from 'net';

const originalWrite = net.Socket.prototype.write;

export const BandwidthMonitor = {
  bytesSent: 0,

  enable() {
    net.Socket.prototype.write = function(data) {
      BandwidthMonitor.bytesSent += data.length;
      return originalWrite.apply(this, arguments);
    };
  },

  disable() {
    net.Socket.prototype.write = originalWrite;
  }
}