import { createOneToManyLoader } from './one-to-many.loader';

interface Child {
  id: number;
  parentId: number;
}

describe('createOneToManyLoader', () => {
  const rows: Child[] = [
    { id: 1, parentId: 10 },
    { id: 2, parentId: 20 },
    { id: 3, parentId: 10 },
  ];

  it('batches loads issued in the same tick into a single fetch', async () => {
    const fetch = jest.fn(async (ids: readonly number[]) =>
      rows.filter((r) => ids.includes(r.parentId)),
    );
    const loader = createOneToManyLoader(fetch, (c: Child) => c.parentId);

    const [a, b] = await Promise.all([loader.load(10), loader.load(20)]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith([10, 20]);
    expect(a.map((c) => c.id)).toEqual([1, 3]);
    expect(b.map((c) => c.id)).toEqual([2]);
  });

  it('returns an empty array for parents without children', async () => {
    const loader = createOneToManyLoader(
      async () => rows,
      (c: Child) => c.parentId,
    );

    await expect(loader.load(99)).resolves.toEqual([]);
  });

  it('preserves the order returned by the fetch function', async () => {
    const reversed = [...rows].reverse();
    const loader = createOneToManyLoader(
      async () => reversed,
      (c: Child) => c.parentId,
    );

    const children = await loader.load(10);

    expect(children.map((c) => c.id)).toEqual([3, 1]);
  });

  it('caches per loader instance, so repeated loads do not refetch', async () => {
    const fetch = jest.fn(async () => rows);
    const loader = createOneToManyLoader(fetch, (c: Child) => c.parentId);

    await loader.load(10);
    await loader.load(10);

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
