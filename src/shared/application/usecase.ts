/**
 * A use case is a single operation the system performs, orchestrating domain entities and repositories.
 * Use cases are framework-agnostic: they receive their dependencies through the constructor.
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
