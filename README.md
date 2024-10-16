:construction: Work in progress! :construction:

Real-time performance optimization for Meteor apps.

Goal: Help detect oplog flooding and event loop blocking issues in Meteor apps, eventually providing easy to understand diagnostic messages users can act upon.

## Installation

```shell
meteor add meteor-perf
```

## Usage

Right now it will output a file called `meteor-perf.json` in the root of your project as your app is running.

This file can be inspected in any code editor that supports JSON.

The object contains the following keys;

### `bytes_sent`:

The amount of data sent from the server to the client in bytes.

### `async_traces`:

An array of objects containing traces for async resources that were created during Event Loop Lag, along with execution count.

### `observer_stats`:

An array of objects containing stat objects for Observer Handles,
the number of operations they performed, and a key to identify them.
The key is composed of the `collection` and the `selector` separated by `::`.

It groups the stats by selector, so you can see how many operations were performed on a specific query.

Example:

```json
{
  "bytes_sent": 2661331,
  "async_traces": [
    {
      "count": 60,
      "types": [
        "PROMISE"
      ],
      "stack": "    at Publication._getCursor (packages/reywood:publish-composite/lib/publication.js:95:36)\n    at Publication.publish (packages/reywood:publish-composite/lib/publication.js:26:30)\n    at packages/reywood:publish-composite/lib/publication.js:110:17\n    at Array.map (<anonymous>)\n    at Publication._publishChildrenOf (packages/reywood:publish-composite/lib/publication.js:106:32)\n    at Publication._handleAddedAsync (packages/reywood:publish-composite/lib/publication.js:77:18)\n    at packages/reywood:publish-composite/lib/publication.js:38:16\n    at new Promise (<anonymous>)\n    at packages/reywood:publish-composite/lib/publication.js:36:30\n    at packages/meteor.js:1399:24"
    }
  ],
  "observer_stats": [
    {
      "key": "child::{\"parentId\":\"MBLMPnnYYCu3RC99p\"}",
      "added": 5600,
      "changed": 3234,
      "removed": 0,
      "started": 56,
      "stopped": 42,
      "lagging_added": 0,
      "lagging_changed": 0,
      "lagging_removed": 0,
      "score": 14854
    }
  ]
}
```

## Downloading the stat file

You can call the following HTTP endpoint to download the stat file:

```
GET /meteor-perf.json
```

## License

MIT