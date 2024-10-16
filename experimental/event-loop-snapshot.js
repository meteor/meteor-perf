import async_hooks from 'node:async_hooks';
import path from 'node:path';
import { ROOT_DIRECTORY } from '../index';
import fs from 'node:fs';

export const EventLoopMirror = new Map();

const ah = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId, resource) {
    const stack = (new Error()).stack.split('\n').slice(2).filter(line => {
      return !['AsyncHook.init', 'node:internal/async_hooks'].some(fn => line.includes(fn));
    }).join('\n');

    EventLoopMirror.set(asyncId, { type, triggerAsyncId, stack });
  },
  destroy(asyncId) {
    EventLoopMirror.delete(asyncId);
  },
});

ah.enable();

export function saveEventLoopSnapshot() {
  const snapshot = Array.from(EventLoopMirror.values());

  const filename = path.join(ROOT_DIRECTORY, `event-loop-snapshot-${Date.now()}.json`);

  fs.writeFileSync(filename, JSON.stringify(snapshot, null, 2));
}