export function mapToGraphQLType<T>(entity: any): T {
  return entity as unknown as T;
}

export function mapArrayToGraphQLType<T>(entities: any[]): T[] {
  return entities as unknown as T[];
}
