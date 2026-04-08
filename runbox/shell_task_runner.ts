import { execCommand } from "./execCommand"

export interface ShellTask {
  id: string
  command: string
  description?: string
  timeoutMs?: number
}

export interface ShellResult {
  taskId: string
  output?: string
  error?: string
  executedAt: number
  durationMs: number
}

export class ShellTaskRunner {
  private tasks: ShellTask[] = []

  /**
   * Schedule a shell task for execution.
   */
  scheduleTask(task: ShellTask): void {
    if (this.tasks.find(t => t.id === task.id)) {
      throw new Error(`Task with id "${task.id}" already scheduled`)
    }
    this.tasks.push(task)
  }

  /**
   * Cancel a task before execution.
   */
  cancelTask(id: string): boolean {
    const idx = this.tasks.findIndex(t => t.id === id)
    if (idx >= 0) {
      this.tasks.splice(idx, 1)
      return true
    }
    return false
  }

  /**
   * List all scheduled tasks.
   */
  listTasks(): ShellTask[] {
    return [...this.tasks]
  }

  /**
   * Execute all scheduled tasks in sequence.
   */
  async runAll(): Promise<ShellResult[]> {
    const results: ShellResult[] = []
    while (this.tasks.length) {
      const task = this.tasks.shift()!
      const start = Date.now()
      try {
        const output = await execCommand(task.command, task.timeoutMs ?? 30_000)
        results.push({
          taskId: task.id,
          output,
          executedAt: start,
          durationMs: Date.now() - start,
        })
      } catch (err: any) {
        results.push({
          taskId: task.id,
          error: err.message,
          executedAt: start,
          durationMs: Date.now() - start,
        })
      }
    }
    return results
  }
}
