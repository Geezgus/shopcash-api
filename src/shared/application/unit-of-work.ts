/**
 * Runs a unit of work inside a transaction: everything succeeds and is committed, or everything is rolled back.
 * `TContext` is whatever the infrastructure needs to build transactional repositories (e.g. an ORM entity manager).
 */
export abstract class UnitOfWork<TContext = unknown> {
  abstract execute<T>(work: (context: TContext) => Promise<T>): Promise<T>;
}
