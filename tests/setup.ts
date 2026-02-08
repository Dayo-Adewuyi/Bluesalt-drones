process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.LOG_LEVEL = 'silent';

jest.mock('ioredis', () => {
  const { EventEmitter } = require('node:events');
  class MockRedis extends EventEmitter {
    store: Map<string, string>;
    constructor() {
      super();
      this.store = new Map();
    }
    get = jest.fn(async (key: string) => this.store.get(key) ?? null);
    set = jest.fn(async (key: string, value: string) => {
      this.store.set(key, value);
      return 'OK';
    });
    del = jest.fn(async (...keys: string[]) => {
      keys.forEach((k) => this.store.delete(k));
      return keys.length;
    });
    scan = jest.fn(async (_cursor: string, _match: string, pattern: string) => {
      const prefix = pattern.replace('*', '');
      const keys = Array.from(this.store.keys()).filter((k) => k.startsWith(prefix));
      return ['0', keys];
    });
    connect = jest.fn(async function (this: MockRedis) {
      this.emit('connect');
    });
    quit = jest.fn(async () => 'OK');
  }
  return { __esModule: true, default: MockRedis };
});

jest.mock('bullmq', () => {
  const { EventEmitter } = require('node:events');
  class Queue {
    name: string;
    opts: any;
    add: jest.Mock;
    constructor(name: string, opts: any) {
      this.name = name;
      this.opts = opts;
      this.add = jest.fn(async () => ({ id: 'job-1' }));
    }
  }
  class Worker extends EventEmitter {
    name: string;
    processor: any;
    opts: any;
    constructor(name: string, processor: any, opts: any) {
      super();
      this.name = name;
      this.processor = processor;
      this.opts = opts;
    }
  }
  return { Queue, Worker };
});
