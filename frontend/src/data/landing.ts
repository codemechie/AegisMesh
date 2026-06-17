export const PROBLEMS = [
  {
    icon: "\u26A0",
    title: "Vulnerability Overload",
    description: "Security teams face thousands of vulnerabilities with limited resources to triage and remediate.",
  },
  {
    icon: "\u{1F6A7}",
    title: "Manual Remediation",
    description: "Developers spend hours crafting patches by hand, leading to delays and inconsistent quality.",
  },
  {
    icon: "\u{1F50D}",
    title: "Review Bottlenecks",
    description: "Every patch requires manual security review, creating a bottleneck that slows deployment velocity.",
  },
  {
    icon: "\u23F3",
    title: "Delayed Deployments",
    description: "The gap between discovery and remediation leaves applications exposed for days or weeks.",
  },
];

export const WORKFLOW = [
  {
    step: "01",
    label: "Vulnerability",
    description: "A security vulnerability is identified and submitted for automated remediation.",
    color: "text-[#9ca3af]",
    border: "border-[#374151]",
    bg: "bg-[#1f2937]",
    icon: "\u{1F50D}",
  },
  {
    step: "02",
    label: "Blue Coder Agent",
    description: "Generates code patches with compile verification up to 3 retry iterations.",
    color: "text-blue-400",
    border: "border-blue-900/50",
    bg: "bg-blue-900/20",
    glows: "shadow-blue-500/10",
    icon: "\u{1F4DD}",
  },
  {
    step: "03",
    label: "Red Auditor Agent",
    description: "Adversarially audits each patch using Graph-of-Thoughts reasoning to find exploits.",
    color: "text-red-400",
    border: "border-red-900/50",
    bg: "bg-red-900/20",
    glows: "shadow-red-500/10",
    icon: "\u{1F3AF}",
  },
  {
    step: "04",
    label: "Security Intelligence Agent",
    description: "Evaluates findings, scores security posture, and provides deployment recommendations.",
    color: "text-purple-400",
    border: "border-purple-900/50",
    bg: "bg-purple-900/20",
    glows: "shadow-purple-500/10",
    icon: "\u{1F4CA}",
  },
  {
    step: "05",
    label: "Deployment Decision",
    description: "Delivers a verdict: APPROVE, APPROVE WITH MONITORING, or ESCALATE.",
    color: "text-[#22c55e]",
    border: "border-[#22c55e]/40",
    bg: "bg-[#22c55e]/10",
    glows: "shadow-[#22c55e]/10",
    icon: "\u2705",
  },
];

export const BAND_BENEFITS = [
  {
    icon: "\u{1F4E1}",
    title: "Agent Communication",
    description: "BAND provides a real-time pub/sub channel where agents broadcast events, findings, and status updates.",
  },
  {
    icon: "\u{1F500}",
    title: "Task Handoffs",
    description: "Agents pass work between each other through structured @mentions and event-driven workflows.",
  },
  {
    icon: "\u{1F91D}",
    title: "Adversarial Collaboration",
    description: "The Blue Coder generates patches while the Red Auditor challenges them, creating a security feedback loop.",
  },
  {
    icon: "\u{1F50D}",
    title: "Execution Traceability",
    description: "Every event is recorded with provenance UUIDs, parent pointers, and ISO 8601 timestamps.",
  },
];

export const RESULTS = [
  {
    vulnerability: "SQL Injection",
    status: "SECURED",
    score: 100,
    border: "border-green-900/50",
    glow: "shadow-green-900/20",
  },
  {
    vulnerability: "Command Injection",
    status: "SECURED",
    score: 95,
    border: "border-green-900/40",
    glow: "shadow-green-900/15",
  },
  {
    vulnerability: "Path Traversal",
    status: "SECURED",
    score: 85,
    border: "border-green-900/30",
    glow: "shadow-green-900/10",
  },
];

export const AI_AGENTS = [
  {
    role: "Blue Coder Agent",
    model: "Qwen3-Coder 480B",
    description: "Autonomous remediation engineer responsible for vulnerability analysis, patch generation, and self-healing compilation fixes.",
    capabilities: ["Vulnerability remediation", "Patch generation", "Patch regeneration", "Self-healing compilation fixes"],
    color: "text-blue-400",
    border: "border-blue-900/40",
    bg: "bg-blue-900/10",
    dot: "bg-blue-400",
    icon: "\u{1F4DD}",
  },
  {
    role: "Red Auditor Agent",
    model: "DeepSeek",
    description: "Adversarial security researcher responsible for exploit discovery, attack-path analysis, and independent security validation.",
    capabilities: ["Exploit discovery", "Attack path analysis", "Red-team validation", "Security critique"],
    color: "text-red-400",
    border: "border-red-900/40",
    bg: "bg-red-900/10",
    dot: "bg-red-400",
    icon: "\u{1F3AF}",
  },
  {
    role: "Security Intelligence Agent",
    model: "GPT-4o",
    description: "Senior security architect responsible for risk assessment, security scoring, deployment recommendations, and executive reporting.",
    capabilities: ["Risk assessment", "Security scoring", "Executive reporting", "Deployment recommendations"],
    color: "text-purple-400",
    border: "border-purple-900/40",
    bg: "bg-purple-900/10",
    dot: "bg-purple-400",
    icon: "\u{1F4CA}",
  },
];

export const BENCHMARK_FINDINGS = [
  { text: "Qwen3-Coder outperformed alternative Blue Agent candidates in patch generation accuracy and compilation success rate." },
  { text: "GPT-4o improved Security Intelligence quality — delivering more precise risk assessments and deployment recommendations." },
  { text: "The multi-agent architecture converged across all benchmark scenarios, demonstrating consistent remediation quality." },
  { text: "Successful remediation demonstrated for SQL Injection, Command Injection, and Path Traversal vulnerabilities." },
  { text: "Automated model benchmarking pipeline runs continuously, ensuring agents always route to the best-performing frontier model." },
];

export const TECH_CATEGORIES = [
  {
    title: "AI Intelligence",
    items: ["Qwen3-Coder", "DeepSeek", "GPT-4o"],
    description: "Frontier models selected for specialized security reasoning and code generation.",
    border: "border-purple-900/40",
    bg: "bg-purple-900/10",
    dot: "bg-purple-400",
  },
  {
    title: "Agent Orchestration",
    items: ["Band of Agents", "OpenRouter"],
    description: "Event-driven multi-agent coordination with standardized model routing.",
    border: "border-blue-900/40",
    bg: "bg-blue-900/10",
    dot: "bg-blue-400",
  },
  {
    title: "Platform",
    items: ["FastAPI", "React", "TypeScript", "Vite"],
    description: "High-performance backend API and modern reactive frontend stack.",
    border: "border-[#1f2937]",
    bg: "bg-[#111827]",
    dot: "bg-[#9ca3af]",
  },
  {
    title: "Deployment",
    items: ["Vercel"],
    description: "Edge-optimized serverless deployment with global CDN distribution.",
    border: "border-[#22c55e]/30",
    bg: "bg-[#22c55e]/10",
    dot: "bg-[#22c55e]",
  },
];

export const TRANSCRIPT_EVENTS = [
  { agent: "Blue Coder Agent", badge: "PATCH_GENERATED", message: "Generated remediation patch for SQL injection vulnerability.", color: "text-blue-400", dot: "bg-blue-400" },
  { agent: "Red Auditor Agent", badge: "AUDIT_COMPLETED", message: "Performed exploit analysis VERIFIED_EXPLOIT found.", color: "text-red-400", dot: "bg-red-400" },
  { agent: "Blue Coder Agent", badge: "PATCH_GENERATED", message: "Received exploit vector. Regenerating patch with improved input sanitization.", color: "text-blue-400", dot: "bg-blue-400" },
  { agent: "Red Auditor Agent", badge: "AUDIT_COMPLETED", message: "Secondary audit: no remaining exploit vectors identified.", color: "text-red-400", dot: "bg-red-400" },
  { agent: "Security Intelligence Agent", badge: "SECURITY_REPORT_GENERATED", message: "Deployment recommendation: APPROVE Security Score 100.", color: "text-purple-400", dot: "bg-purple-400" },
];
