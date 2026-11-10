/**
 * Minimal size-capped LRU cache built on Map's insertion-order guarantee.
 * Least-recently-used entry is the first key in the Map; a read or write moves
 * the key to the end. No dependency needed.
 */
class LRUCache {
    constructor(maxSize) {
        if (!Number.isInteger(maxSize) || maxSize < 1) {
            throw new Error("LRUCache maxSize must be a positive integer");
        }
        this.maxSize = maxSize;
        this.map = new Map();
    }

    get size() {
        return this.map.size;
    }

    // Read and mark as most-recently-used.
    get(key) {
        if (!this.map.has(key)) return undefined;
        const value = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    // Read WITHOUT changing recency (used for identity checks).
    peek(key) {
        return this.map.get(key);
    }

    set(key, value) {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, value);
        if (this.map.size > this.maxSize) {
            const oldestKey = this.map.keys().next().value;
            this.map.delete(oldestKey);
        }
        return this;
    }

    delete(key) {
        return this.map.delete(key);
    }

    clear() {
        this.map.clear();
    }
}

module.exports = LRUCache;
