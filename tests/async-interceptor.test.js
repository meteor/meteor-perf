import { expect } from 'chai';
import { AsyncInterceptor, AsyncResourceMap, stackTrace } from '../async-interceptor';
import Benchmarkify from "benchmarkify";

const benchmark = new Benchmarkify("Meteor Perf", { chartImage: true }).printHeader();

benchmark.createSuite("Stack Trace", { time: 1000 })
  .add("default error stack trace", () => {
    return new Error().stack;
  })
  .ref("clean stack trace", () => {
    return (new Error()).stack.split('\n').slice(2).filter(line => {
      return !['AsyncHook.init', 'node:internal/async_hooks'].some(fn => line.includes(fn));
    }).join('\n');
  });


await benchmark.run();

describe('Async Interceptor', () => {
  it('get stack trace', async () => {
    const stack = stackTrace();

    expect(stack).to.be.a('string');
  });

  it('should capture async operations', async () => {
    AsyncInterceptor.enable();

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    AsyncInterceptor.disable();

    expect(AsyncResourceMap.size).to.be.greaterThan(0);
  })
})