export interface AgentCapabilities {
  canAnswerProtocolQuestions: boolean
  canAnswerTokenQuestions: boolean
  canDescribeTooling: boolean
  canReportEcosystemNews: boolean
  canTrackWallets: boolean
  canAnalyzeMarkets: boolean
}

export interface AgentFlags {
  requiresExactInvocation: boolean
  noAdditionalCommentary: boolean
  strictMode: boolean
  allowPartialMatches: boolean
}

export const SOLANA_AGENT_CAPABILITIES: AgentCapabilities = {
  canAnswerProtocolQuestions: true,
  canAnswerTokenQuestions: true,
  canDescribeTooling: true,
  canReportEcosystemNews: true,
  canTrackWallets: true,
  canAnalyzeMarkets: true,
}

export const SOLANA_AGENT_FLAGS: AgentFlags = {
  requiresExactInvocation: true,
  noAdditionalCommentary: true,
  strictMode: true,
  allowPartialMatches: false,
}

/**
 * Utility helpers for agent config
 */
export function describeCapabilities(caps: AgentCapabilities): string {
  const enabled = Object.entries(caps)
    .filter(([_, v]) => v)
    .map(([k]) => k.replace(/^can/, ""))
  return `Capabilities: ${enabled.join(", ")}`
}

export function validateAgentFlags(flags: AgentFlags): string[] {
  const issues: string[] = []
  if (flags.strictMode && flags.allowPartialMatches) {
    issues.push("Conflicting flags: strictMode and allowPartialMatches cannot both be true")
  }
  return issues
}
