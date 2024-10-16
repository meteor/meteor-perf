import { timestampToInt } from '../utils';
import { MongoInternals } from 'meteor/mongo';

export class OplogMonitor {
  delay = 0
  interval = null
  handle = null
  lastCheckAt = null

  constructor() {
    this.handle = MongoInternals.defaultRemoteCollectionDriver().mongo._oplogHandle
  }

  start() {
    if (!this.handle) {
      console.error('Meteor Perf: Not Using Oplog')
      return
    }

    this.interval = setInterval(async () => {
      let timestamp = this.handle._lastProcessedTS

      if (!timestamp) return

      timestamp = timestampToInt(timestamp)

      const last = await this.getLastEntry()
      const lastAt = timestampToInt(last.ts)

      // The last entry has not changed since the last call
      if (this.lastCheckAt === lastAt) return

      this.lastCheckAt = lastAt

      if (!last || lastAt === timestamp) return

      this.delay = Date.now() - timestamp

      if (this.isOplogBehind) {
        console.error('Meteor Perf: Oplog Delay', this.delay)
        console.log(this.handle._entryQueue.length)
      }
    }, 100)
  }

  stop() {
    clearInterval(this.interval)
  }

  async getLastEntry() {
    return this.handle._oplogLastEntryConnection.findOneAsync(
      'oplog.rs',
      this.handle._baseOplogSelector,
      { projection: { ts: 1 }, sort: { $natural: -1 } }
    );
  }

  get isOplogBehind() {
    return this.delay > 1000
  }
}