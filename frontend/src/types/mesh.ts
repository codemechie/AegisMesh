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

export interface Evidence {
  file: string;
  line: number;
  reason: string;
}

export interface AuditCritique {
  patch_id: string;
  is_secure: boolean;
  finding_type: "VERIFIED_EXPLOIT" | "SPECULATIVE_RISK" | "INFORMATIONAL";
  confidence: string;
  evidence: Evidence[];
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
  event_type?: string;
  error?: string;
  failure_type?: string;
  reason?: string;
  recovered?: boolean;
  timestamp?: string;
}

export interface ExploitChainEntry {
  description: string;
  target_lines: number[];
  severity: string;
}

export interface BenchmarkTelemetry {
  blue_model: string;
  red_model: string;
  mesh_iterations: number;
  verified_exploits: number;
  speculative_risks: number;
  informational_findings: number;
  audit_degradations: number;
  final_status: string | null;
  time_started: string | null;
  time_completed: string | null;
}

export interface BandTelemetry {
  band_room_created: number;
  band_messages_sent: number;
  band_failures: number;
  band_room_id: string | null;
  band_room_url: string | null;
}

export interface SecurityIntelligenceReport {
  security_score: number;
  confidence: number;
  risk_level: string;
  deployment_recommendation: string;
  executive_summary: string;
  model?: string;
  verified_exploits: number;
  speculative_risks: number;
  informational_findings: number;
  audit_degradations: number;
  reasoning: string[];
  remaining_risks: string[];
}

export interface ActiveModels {
  blue: string;
  red: string;
  security_intelligence: string;
}

export interface MeshContext {
  session_id: string;
  status: string;
  source_file: FileContext;
  vulnerability: VulnerabilityReport;
  latest_patch: PatchProposal | null;
  original_vulnerability: VulnerabilityReport;
  active_vulnerability: VulnerabilityReport;
  active_models: ActiveModels;
  audit_history: AuditCritique[];
  system_logs: string[];
  mesh_iteration: number;
  max_mesh_iterations: number;
  exploit_chain: ExploitChainEntry[];
  event_history: EventRecord[];
  last_event_id: string | null;
  agent_failures: AgentFailure[];
  benchmark_telemetry: BenchmarkTelemetry;
  security_report?: SecurityIntelligenceReport;
  band_room_id?: string | null;
  band_room_url?: string | null;
  band_telemetry?: BandTelemetry;
}

export interface RunRequest {
  source_code: string;
  vulnerability: string;
}
