export interface FileContext {
  file_path: string;
  raw_code: string;
  language: string;
}

export interface VulnerabilityReport {
  cve_id: string | null;
  description: string;
  target_lines: number[];
  severity: string;
}

export interface PatchProposal {
  patch_id: string;
  proposed_code: string;
  architectural_changes: string;
  dependencies_added: string[];
}

export interface ThoughtNode {
  thought_id: string;
  hypothesis: string;
  evaluation_result: string;
  parent_thoughts: string[];
}

export interface AuditCritique {
  patch_id: string;
  is_secure: boolean;
  exploit_found: string | null;
  graph_of_thoughts: ThoughtNode[];
}

export interface EventRecord {
  event_id: string;
  timestamp: string;
  event_type: string;
  payload: Record<string, unknown>;
  parent_event_id: string | null;
}

export interface AgentFailure {
  agent: string;
  event_type: string;
  error: string;
}

export interface ExploitChainEntry {
  description: string;
  target_lines: number[];
  severity: string;
}

export interface MeshContext {
  session_id: string;
  status: string;
  source_file: FileContext;
  vulnerability: VulnerabilityReport;
  latest_patch: PatchProposal | null;
  original_vulnerability: VulnerabilityReport;
  active_vulnerability: VulnerabilityReport;
  audit_history: AuditCritique[];
  system_logs: string[];
  mesh_iteration: number;
  max_mesh_iterations: number;
  exploit_chain: ExploitChainEntry[];
  event_history: EventRecord[];
  last_event_id: string | null;
  agent_failures: AgentFailure[];
}

export interface RunRequest {
  source_code: string;
  vulnerability: string;
}
