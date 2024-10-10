import { WebApp } from 'meteor/webapp';
import path from 'node:path';
import fs from 'node:fs';
import { ROOT_DIRECTORY } from './index';

export function registerRoute() {
  WebApp.connectHandlers.use('/meteor-perf.json', (_, res) => {
    const filePath = path.resolve(ROOT_DIRECTORY, 'meteor-perf.json');

    res.setHeader('Content-Disposition', 'attachment; filename=meteor-perf.json');
    res.setHeader('Content-Type', 'application/json');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
  });
}