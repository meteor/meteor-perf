import { MongoInternals } from "meteor/mongo";
import { EJSON } from "meteor/ejson";
import { PerfInsights } from './index';

const _observeChanges = MongoInternals.Connection.prototype._observeChanges;

MongoInternals.Connection.prototype._observeChanges = observeChanges

export const StatDict = new Map();

async function observeChanges (...args) {
  const [cursorDescription,,callbacks] = args;

  const stat = getStat(cursorDescription);

  const originals = {
    added: callbacks.added,
    changed: callbacks.changed,
    removed: callbacks.removed,
  }

  callbacks.added = function (...args) {
    stat.incrementAdded();
    originals.added.call(this, ...args);
  }

  callbacks.changed = function (...args) {
    stat.incrementChanged();
    originals.changed.call(this, ...args);
  }

  callbacks.removed = function (...args) {
    stat.incrementRemoved();
    originals.removed.call(this, ...args);
  }

  const handle = await _observeChanges.call(this, ...args);

  stat.incrementStarted()

  const originalStop = handle.stop;

  handle.stop = function () {
    stat.incrementStopped();
    return originalStop.call(this);
  }

  return handle;
}

function getStat(cursorDescription) {
  const key = getKey(cursorDescription);

  if (!StatDict.has(key)) {
    StatDict.set(key, new NamespaceStat(cursorDescription));
  }

  return StatDict.get(key)
}

class NamespaceStat {
  /**
   * Documents
   */
  added = 0;
  changed = 0;
  removed = 0;

  /**
   * Documents When Lagging
   */

  laggingAdded = 0;
  laggingChanged = 0;
  laggingRemoved = 0;

  /**
   * Observer Handles
   */
  started = 0;
  stopped = 0;

  /**
   * Score
   */
  score = 0;

  constructor(cursorDescription) {
    this.key = getKey(cursorDescription);
  }

  incrementAdded() {
    if (PerfInsights.EventLoopMonitor.lagging) {
      this.laggingAdded++;
      this.score += 10;
    } else {
      this.added++;
      this.score++;
    }
  }

  incrementChanged() {
    if (PerfInsights.EventLoopMonitor.lagging) {
      this.laggingChanged++;
      this.score += 10;
    } else {
      this.changed++;
      this.score++;
    }
  }

  incrementRemoved() {
    if (PerfInsights.EventLoopMonitor.lagging) {
      this.laggingRemoved++;
      this.score += 10;
    } else {
      this.removed++;
      this.score++;
    }
  }

  incrementStarted() {
    this.started++;
    this.score += 100;
  }

  incrementStopped() {
    this.stopped++;
    this.score += 10;
  }


  getStats() {
    return {
      key: this.key,
      added: this.added,
      changed: this.changed,
      removed: this.removed,
      started: this.started,
      stopped: this.stopped,

      laggingAdded: this.laggingAdded,
      laggingChanged: this.laggingChanged,
      laggingRemoved: this.laggingRemoved,

      score: this.score,
    }
  }
}

function getKey(cursorDescription) {
  return `${cursorDescription.collectionName}::${EJSON.stringify(cursorDescription.selector)}`;
}

