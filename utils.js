export function timestampToInt(timestamp) {
  const high = timestamp.getHighBits();
  return high * 1000;
}