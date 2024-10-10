:construction: Work in progress! :construction:

Real-time performance optimization for Meteor apps.

Goal: Help detect oplog flooding and event loop blocking issues in Meteor apps, eventually providing easy to understand diagnostic messages users can act upon.

## Installation

```shell
meteor add meteor-perf
```

## Usage

Right now it will output a file called `async-resources.json` in the root of your project as your app is running.

This file can be inspected in any code editor that supports JSON.

The object contains the following keys;

### `bytesSent`:

The amount of data sent from the server to the client in bytes.

### `logs`:

An array of objects containing traces for async resources that were created during Event Loop Lag, along with execution count.

### `stats`:

An array of objects containing stat objects for Observer Handles,
the number of operations they performed, and a key to identify them.
The key is composed of the `collection` and the `selector` separated by `::`.

Example:

```json
{
  "bytesSent": 2661331,
  "logs": [],
  "stats": [
    {
      "key": "child::{\"parentId\":\"MBLMPnnYYCu3RC99p\"}",
      "added": 5600,
      "changed": 3234,
      "removed": 0,
      "started": 56,
      "stopped": 42,
      "laggingAdded": 0,
      "laggingChanged": 0,
      "laggingRemoved": 0,
      "score": 14854
    }
  ]
}
```