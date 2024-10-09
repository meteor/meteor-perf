import './observer-monitor'

import { EventLoopMonitor } from './event-loop-monitor';
import { BandwidthMonitor } from './bandwidth-monitor';
import { StatDict } from './observer-monitor';
import path from 'node:path';
import fs from 'node:fs';
import { asyncResources } from './async-interceptor';

export const PerfInsights = {
  EventLoopMonitor: new EventLoopMonitor(10),
  isWebSocketCompressionEnabled: Meteor.server.stream_server.server.options.faye_server_options.extensions.some(ext => ext.name === 'permessage-deflate'),
}

Meteor.startup(() => {
  BandwidthMonitor.enable()
  PerfInsights.EventLoopMonitor.start();

  setInterval(() => {
    printResults();
  }, 1000);
})

function printResults() {
  let logs = []

  asyncResources.forEach((info, stack) => {
    if (info.count <= 1) {
      return;
    }

    logs.push({
      count: info.count,
      types: [...info.types],
      stack,
    });
  });

  logs = logs.sort((a, b) => b.count - a.count).slice(0, 100);

  const stats = Array.from(StatDict.values()).map(stat => stat.getStats()).sort((a, b) => b.score - a.score).slice(0, 100);

  const filename = path.join(process.cwd().split('.meteor')[0], 'async-resources.json');

  fs.writeFileSync(filename, JSON.stringify({
    bytesSent: BandwidthMonitor.bytesSent,
    logs,
    stats,
  }, null, 2));
}
