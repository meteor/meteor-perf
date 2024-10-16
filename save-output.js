import { AsyncResourceMap } from './async-interceptor';
import { StatDict } from './observer-monitor';
import path from 'node:path';
import fs from 'node:fs';
import { BandwidthMonitor } from './bandwidth-monitor';
import { ROOT_DIRECTORY } from './index';

export function saveOutput() {
  performance.mark('saveOutput-start');
  let async_traces = []

  AsyncResourceMap.forEach((info, stack) => {
    if (info.count <= 1) {
      return;
    }

    async_traces.push({
      count: info.count,
      types: [...info.types],
      stack,
    });
  });

  async_traces = async_traces.sort((a, b) => b.count - a.count).slice(0, 100);

  const observer_stats = Array.from(StatDict.values()).map(stat => stat.getStats()).sort((a, b) => b.score - a.score).slice(0, 100);

  const filename = path.join(ROOT_DIRECTORY, 'meteor-perf.json');

  fs.writeFileSync(filename, JSON.stringify({
    bytes_sent: BandwidthMonitor.bytesSent,
    async_traces,
    observer_stats,
  }, null, 2));

  performance.mark('saveOutput-end');
  performance.measure('saveOutput', 'saveOutput-start', 'saveOutput-end');
}