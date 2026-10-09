import { DomainEvent } from '@shared/domain/domain-event.js';
import { InMemoryEventDispatcher } from '@shared/infra/events/in-memory-event-dispatcher.js';

class SomethingHappened extends DomainEvent {}
class SomethingElseHappened extends DomainEvent {}

describe('InMemoryEventDispatcher', () => {
  it('dispatches events only to the handlers registered for their class', async () => {
    const dispatcher = new InMemoryEventDispatcher();
    const handled: DomainEvent[] = [];
    dispatcher.register(SomethingHappened, { handle: async (event) => void handled.push(event) });

    const event = new SomethingHappened();
    await dispatcher.dispatchAll([event, new SomethingElseHappened()]);

    expect(handled).toEqual([event]);
  });

  it('propagates handler failures', async () => {
    const dispatcher = new InMemoryEventDispatcher();
    dispatcher.register(SomethingHappened, {
      handle: async () => {
        throw new Error('boom');
      },
    });

    await expect(dispatcher.dispatch(new SomethingHappened())).rejects.toThrow('boom');
  });
});
