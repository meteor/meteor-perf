import async_hooks from 'node:async_hooks';

// 50% of map limit
export const GC_LIMIT = Math.pow(2, 23);

export const AsyncResourceMap = new Map();

export const AsyncInterceptor = async_hooks.createHook({
  init(asyncId, type) {
    logResourceCreation(asyncId, type);
  },
});

function logResourceCreation(asyncId, type) {
  const stack = (new Error()).stack.split('\n').slice(2).filter(line => {
    return !['AsyncHook.init', 'node:internal/async_hooks'].some(fn => line.includes(fn));
  }).join('\n');

  if (AsyncResourceMap.size > GC_LIMIT) {
    console.log('Meteor Perf: Garbage collecting async resources');
    garbageCollectAsyncResources();
  }

  if (!AsyncResourceMap.has(stack)) {
    AsyncResourceMap.set(stack, { count: 0, types: new Set() });
  }

  const resourceInfo = AsyncResourceMap.get(stack);
  resourceInfo.count++;
  resourceInfo.types.add(type);
}

function garbageCollectAsyncResources() {
  AsyncResourceMap.forEach((info, stack) => {
    if (info.count <= 1) {
      AsyncResourceMap.delete(stack);
    }
  });
}