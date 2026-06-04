// ============================================================
// CareLink — Max-Heap Priority Queue
// ============================================================
// Patients with HIGHER priority scores are extracted first.

import { QueueEntry } from '@/types';

export class PriorityQueue {
  private heap: QueueEntry[] = [];

  get size(): number {
    return this.heap.length;
  }

  get isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /** Return a shallow copy of all entries sorted by descending priority. */
  getAll(): QueueEntry[] {
    return [...this.heap].sort(
      (a, b) => b.priority.total - a.priority.total
    );
  }

  /** Insert a new entry and restore heap property. */
  insert(entry: QueueEntry): void {
    this.heap.push(entry);
    this.bubbleUp(this.heap.length - 1);
    this.recalcPositions();
  }

  /** Remove and return the highest-priority entry. */
  extractMax(): QueueEntry | null {
    if (this.isEmpty) return null;
    const max = this.heap[0];
    const last = this.heap.pop()!;
    if (!this.isEmpty) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    this.recalcPositions();
    return max;
  }

  /** Peek at the highest-priority entry without removing it. */
  peek(): QueueEntry | null {
    return this.isEmpty ? null : this.heap[0];
  }

  /** Update priority for a specific appointment and re-heapify. */
  updatePriority(
    appointmentId: string,
    newScore: number,
    newLevel: QueueEntry['priority']['level']
  ): boolean {
    const idx = this.heap.findIndex(
      (e) => e.appointmentId === appointmentId
    );
    if (idx === -1) return false;

    this.heap[idx].priority = {
      ...this.heap[idx].priority,
      total: newScore,
      level: newLevel,
    };

    // Could have gone up or down — do both safely.
    this.bubbleUp(idx);
    this.sinkDown(idx);
    this.recalcPositions();
    return true;
  }

  /** Remove an entry by appointment ID. */
  remove(appointmentId: string): QueueEntry | null {
    const idx = this.heap.findIndex(
      (e) => e.appointmentId === appointmentId
    );
    if (idx === -1) return null;

    const removed = this.heap[idx];
    const last = this.heap.pop()!;
    if (idx < this.heap.length) {
      this.heap[idx] = last;
      this.bubbleUp(idx);
      this.sinkDown(idx);
    }
    this.recalcPositions();
    return removed;
  }

  /** Full rebalance — rebuild heap from scratch. */
  rebalance(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.sinkDown(i);
    }
    this.recalcPositions();
  }

  /** Load queue from serialised data. */
  load(entries: QueueEntry[]): void {
    this.heap = [...entries];
    this.rebalance();
  }

  /** Serialise for persistence. */
  serialise(): QueueEntry[] {
    return [...this.heap];
  }

  /** Get entries filtered by priority level. */
  getByPriority(level: QueueEntry['priority']['level']): QueueEntry[] {
    return this.getAll().filter((e) => e.priority.level === level);
  }

  /** Get entries filtered by department. */
  getByDepartment(departmentId: string): QueueEntry[] {
    return this.getAll().filter((e) => e.departmentId === departmentId);
  }

  /** Estimate wait time for a given position (avg 15 min per patient). */
  estimateWaitTime(position: number): number {
    return Math.max(0, (position - 1) * 15);
  }

  // ---- internal helpers ----

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (
        this.heap[idx].priority.total <=
        this.heap[parentIdx].priority.total
      )
        break;
      [this.heap[idx], this.heap[parentIdx]] = [
        this.heap[parentIdx],
        this.heap[idx],
      ];
      idx = parentIdx;
    }
  }

  private sinkDown(idx: number): void {
    const length = this.heap.length;
    while (true) {
      let largest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (
        left < length &&
        this.heap[left].priority.total >
          this.heap[largest].priority.total
      )
        largest = left;

      if (
        right < length &&
        this.heap[right].priority.total >
          this.heap[largest].priority.total
      )
        largest = right;

      if (largest === idx) break;

      [this.heap[idx], this.heap[largest]] = [
        this.heap[largest],
        this.heap[idx],
      ];
      idx = largest;
    }
  }

  /** Re-number queue positions based on current heap order. */
  private recalcPositions(): void {
    const sorted = this.getAll();
    sorted.forEach((entry, i) => {
      entry.position = i + 1;
      entry.estimatedWaitTime = this.estimateWaitTime(i + 1);
    });
  }
}
