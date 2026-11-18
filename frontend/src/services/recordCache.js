const RECORD_CACHE_TTL_MS = 30_000;
const records = new Map();
const pendingRequests = new Map();
let cacheVersion = 0;
function scopedKey(key) {
  // Keep protected data in memory only and separate it by the active token.
  return `${localStorage.getItem("token") || "anonymous"}:${key}`;
}
export async function getCachedRecord(key, request) {
  const cacheKey = scopedKey(key);
  const cached = records.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }
  if (cached) {
    records.delete(cacheKey);
  }
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }
  const requestVersion = cacheVersion;
  const response = request().then(value => {
    if (requestVersion === cacheVersion) {
      records.set(cacheKey, {
        value,
        expiresAt: Date.now() + RECORD_CACHE_TTL_MS
      });
    }
    return value;
  }).finally(() => {
    pendingRequests.delete(cacheKey);
  });
  pendingRequests.set(cacheKey, response);
  return response;
}
export function peekCachedRecord(key) {
  const cacheKey = scopedKey(key);
  const cached = records.get(cacheKey);
  if (!cached || cached.expiresAt <= Date.now()) {
    if (cached) {
      records.delete(cacheKey);
    }
    return undefined;
  }
  return cached.value;
}
export function invalidateRecordCache() {
  cacheVersion += 1;
  records.clear();
  pendingRequests.clear();
}