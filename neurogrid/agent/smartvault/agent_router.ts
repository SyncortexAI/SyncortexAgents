import { z } from "zod"
import {
  BaseAction,
  ActionResponse,
  ActionSchema,
  makeErrorResponse,
} from "./action_base_types"

interface AgentContext {
  apiEndpoint: string
  apiKey: string
}

/**
 * Central Agent: routes calls to registered actions with runtime schema validation.
 */
export class CoreAgent {
  private actions = new Map<string, BaseAction<any, any, AgentContext>>()

  register<S extends ActionSchema, R>(action: BaseAction<S, R, AgentContext>): void {
    if (this.actions.has(action.id)) {
      throw new Error(`Action "${action.id}" already registered`)
    }
    this.actions.set(action.id, action)
  }

  registerMany(actions: Array<BaseAction<any, any, AgentContext>>): void {
    for (const a of actions) this.register(a)
  }

  unregister(actionId: string): boolean {
    return this.actions.delete(actionId)
  }

  hasAction(actionId: string): boolean {
    return this.actions.has(actionId)
  }

  listActionIds(): string[] {
    return Array.from(this.actions.keys())
  }

  getAction<S extends ActionSchema, R>(
    actionId: string
  ): BaseAction<S, R, AgentContext> | undefined {
    return this.actions.get(actionId) as BaseAction<S, R, AgentContext> | undefined
  }

  /**
   * Invoke an action by id with payload validation against its Zod schema.
   * Attaches durationMs to the response meta if not present.
   */
  async invoke<R>(
    actionId: string,
    payload: unknown,
    ctx: AgentContext
  ): Promise<ActionResponse<R>> {
    const start = Date.now()
    const action = this.actions.get(actionId)

    if (!action) {
      return makeErrorResponse<R>(
        `Unknown action "${actionId}"`,
        "ACTION_NOT_FOUND",
        "error",
        { durationMs: Date.now() - start }
      )
    }

    const parsed = (action.input as z.ZodTypeAny).safeParse(payload)
    if (!parsed.success) {
      const details = parsed.error.issues.map(i => i.message).join("; ")
      return makeErrorResponse<R>(
        details || "Invalid payload",
        "INVALID_PAYLOAD",
        "error",
        { durationMs: Date.now() - start }
      )
    }

    const result = await action.execute({ payload: parsed.data, context: ctx })

    // Ensure meta.durationMs exists
    result.meta = result.meta ?? {}
    if (result.meta.durationMs === undefined) {
      result.meta.durationMs = Date.now() - start
    }
    return result
  }
}
