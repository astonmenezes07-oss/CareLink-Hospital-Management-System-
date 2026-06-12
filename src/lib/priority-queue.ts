// ============================================================
// CareLink — Chronological Queue (Date & Time Priority)
// ============================================================
// Patients are sorted primarily by Date and Time.
// If times are the same, they are sorted by Priority Score.

import { QueueEntry } from '@/types';

export class PriorityQueue {
  private queue: QueueEntry[] = [];

  get size(): number {
    return this.queue.length;
  }

  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  private compare(a: QueueEntry, b: QueueEntry): number {
    // Helper to get a comparable timestamp
    const getTime = (entry: QueueEntry) => {
      if (entry.timeSlot === 'Emergency') {
        // Emergencies get pushed to the top of their date
        return new Date(entry.date + 'T00:00:00').getTime() - 1; 
      }
      if (entry.date && entry.timeSlot) {
        // e.g., "09:00 - 09:30" -> "09:00"
        const timeStr = entry.timeSlot.split(' ')[0];
        return new Date(entry.date + 'T' + timeStr + ':00').getTime();
      }
      return new Date(entry.checkInTime).getTime();
    };

    const timeA = getTime(a);
    const timeB = getTime(b);

    if (timeA !== timeB) {
      return timeA - timeB; // smaller time (earlier) comes first
    }
    
    // If times are identical, fallback to priority total (higher score = first)
    return b.priority.total - a.priority.total;
  }

  /** Return a shallow copy of all entries sorted. */
  getAll(): QueueEntry[] {
    return [...this.queue];
  }

  /** Insert a new entry and sort. */
  insert(entry: QueueEntry): void {
    this.queue.push(entry);
    this.rebalance();
  }

  /** Remove and return the highest-priority entry (first element). */
  extractMax(): QueueEntry | null {
    if (this.isEmpty) return null;
    const first = this.queue.shift()!;
    this.recalcPositions();
    return first;
  }

  /** Peek at the highest-priority entry without removing it. */
  peek(): QueueEntry | null {
    return this.isEmpty ? null : this.queue[0];
  }

  /** Update priority for a specific appointment and re-sort. */
  updatePriority(
    appointmentId: string,
    newScore: number,
    newLevel: QueueEntry['priority']['level']
  ): boolean {
    const idx = this.queue.findIndex(
      (e) => e.appointmentId === appointmentId
    );
    if (idx === -1) return false;

    this.queue[idx].priority = {
      ...this.queue[idx].priority,
      total: newScore,
      level: newLevel,
    };

    this.rebalance();
    return true;
  }

  /** Remove an entry by appointment ID. */
  remove(appointmentId: string): QueueEntry | null {
    const idx = this.queue.findIndex(
      (e) => e.appointmentId === appointmentId
    );
    if (idx === -1) return null;

    const removed = this.queue.splice(idx, 1)[0];
    this.recalcPositions();
    return removed;
  }

  /** Full rebalance — sort the array. */
  rebalance(): void {
    this.queue.sort(this.compare.bind(this));
    this.recalcPositions();
  }

  /** Load queue from serialised data. */
  load(entries: QueueEntry[]): void {
    this.queue = [...entries];
    this.rebalance();
  }

  /** Serialise for persistence. */
  serialise(): QueueEntry[] {
    return [...this.queue];
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

  /** Re-number queue positions based on current order. */
  private recalcPositions(): void {
    this.queue.forEach((entry, i) => {
      entry.position = i + 1;
      entry.estimatedWaitTime = this.estimateWaitTime(i + 1);
    });
  }
}
