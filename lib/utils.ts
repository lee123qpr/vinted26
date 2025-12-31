export function sortByOrder<T extends { sort_order?: number }>(items: T[]): T[] {
    return items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}
