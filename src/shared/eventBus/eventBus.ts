import { EventEmitter } from 'node:events';
import { logger } from '../utils/logger';

class TypedEventBus {
  private readonly emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(20);
  }

  emit(event: string, payload: unknown): void {
    logger.debug(`Event emitted: ${event}`, { payload });
    this.emitter.emit(event, payload);
  }

  on(event: string, handler: (payload: any) => void | Promise<void>): void {
    this.emitter.on(event, async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`Event handler error for ${event}`, { error });
      }
    });
  }

  off(event: string, handler: (...args: any[]) => void): void {
    this.emitter.off(event, handler);
  }
}

export const eventBus = new TypedEventBus();
