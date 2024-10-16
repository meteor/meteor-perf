import async_hooks from 'node:async_hooks';

// 50% of map limit
export const GC_LIMIT = Meteor.isPackageTest ? 7 : Math.pow(2, 23);

export const AsyncResourceMap = new Map();

export const AsyncInterceptor = async_hooks.createHook({
  init(asyncId, type) {
    captureResource(asyncId, type);
  },
});

function captureResource(asyncId, type) {
  let stack = stackTrace();

  stack = `${type}\n${stack}`;

  if (AsyncResourceMap.size > GC_LIMIT) {
    garbageCollectAsyncResources();
  }

  if (!AsyncResourceMap.has(stack)) {
    AsyncResourceMap.set(stack, { count: 0 });
  }

  const resourceInfo = AsyncResourceMap.get(stack);
  resourceInfo.count++;
}

function garbageCollectAsyncResources() {
  AsyncResourceMap.forEach((info, stack) => {
    if (info.count <= 1) {
      AsyncResourceMap.delete(stack);
    }
  });
}

export function stackTrace () {
  return (new Error()).stack.split('\n').slice(3).filter(line => {
    return !['AsyncHook.init', 'node:internal/async_hooks'].some(fn => line.includes(fn));
  }).join('\n')
}

setInterval(garbageCollectAsyncResources, 10000);