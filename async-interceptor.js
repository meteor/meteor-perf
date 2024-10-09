import async_hooks from 'node:async_hooks';

export const asyncResources = new Map();

export const AsyncInterceptor = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId, resource) {
    logResourceCreation(asyncId, type, triggerAsyncId, resource);
  },
});

function logResourceCreation(asyncId, type, triggerAsyncId, resource) {
  const stack = (new Error()).stack.split('\n').slice(2).filter(line => {
    return !['AsyncHook.init', 'node:internal/async_hooks'].some(fn => line.includes(fn));
  }).join('\n');

  if (!asyncResources.has(stack)) {
    asyncResources.set(stack, { count: 0, types: new Set() });
  }

  const resourceInfo = asyncResources.get(stack);
  resourceInfo.count++;
  resourceInfo.types.add(type);
}


