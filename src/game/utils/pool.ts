export class ObjectPool<T> {
  private available: T[] = []
  private readonly active = new Set<T>()

  constructor(
    private readonly factory: () => T,
    private readonly reset: (item: T) => void,
    initialSize = 16,
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory())
    }
  }

  acquire(): T {
    const item = this.available.pop() ?? this.factory()
    this.active.add(item)
    return item
  }

  release(item: T): void {
    if (!this.active.has(item)) return
    this.active.delete(item)
    this.reset(item)
    this.available.push(item)
  }

  getActive(): Iterable<T> {
    return this.active
  }

  get activeCount(): number {
    return this.active.size
  }

  getAll(): T[] {
    return [...this.available, ...this.active]
  }
}
