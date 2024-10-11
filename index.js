import './observer-monitor'

import { EventLoopMonitor } from './event-loop-monitor';
import { BandwidthMonitor } from './bandwidth-monitor';
import path from 'node:path';
import { saveOutput } from './save-output';
import { registerRoute } from './register-route';

export const ROOT_DIRECTORY = Meteor.isProduction ? process.cwd(): path.resolve(process.cwd().split('.meteor')[0]);

export const MeteorPerf = {
  EventLoopMonitor: new EventLoopMonitor(10),
  isWebSocketCompressionEnabled: Meteor.server.stream_server.server.options.faye_server_options.extensions.some(ext => ext.name === 'permessage-deflate'),
  isUsingRedisOplog: false,
  isOplogDisabled: false,
}

registerRoute();

Meteor.startup(() => {
  MeteorPerf.isUsingRedisOplog =  Package['cultofcoders:redis-oplog'] !== undefined;
  MeteorPerf.isOplogDisabled = Package['disable-oplog'] !== undefined;

  BandwidthMonitor.enable()
  MeteorPerf.EventLoopMonitor.start();

  setInterval(() => {
    saveOutput();
  }, 1000);
})


