import DataLoader from 'dataloader';

/**
 * Builds a DataLoader for a one-to-many relation (parent id -> children[]).
 *
 * All `.load(parentId)` calls made during one tick are collected and resolved with a
 * single `fetchByParentIds([...])` call, i.e. one `WHERE parent_id IN (...)` query
 * instead of one query per parent (the N+1 problem).
 *
 * The order of children inside each group is preserved from `fetchByParentIds`, so
 * ordering stays the responsibility of the data-access layer (ORDER BY).
 */
export function createOneToManyLoader<TKey, TChild>(
  fetchByParentIds: (ids: readonly TKey[]) => Promise<TChild[]>,
  parentKeyOf: (child: TChild) => TKey,
): DataLoader<TKey, TChild[]> {
  return new DataLoader<TKey, TChild[]>(async (ids) => {
    const children = await fetchByParentIds(ids);

    const byParent = new Map<TKey, TChild[]>();
    for (const child of children) {
      const key = parentKeyOf(child);
      const group = byParent.get(key);
      if (group) group.push(child);
      else byParent.set(key, [child]);
    }

    // DataLoader contract: result[i] must correspond to ids[i].
    return ids.map((id) => byParent.get(id) ?? []);
  });
}
