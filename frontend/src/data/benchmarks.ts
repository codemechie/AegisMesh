export interface BenchmarkResult {
  id: string;
  title: string;
  description: string;
  securityScore: number;
  riskLevel: string;
  finalStatus: string;
  runtime: string;
  iterations: number;
  findings: {
    verifiedExploits: number;
    speculativeRisks: number;
    informational: number;
  };
}

export const BENCHMARK_RESULTS: BenchmarkResult[] = [
  {
    id: "sql-injection",
    title: "SQL Injection",
    description:
      "Unsantized string concatenation in a SQL query. Blue Coder converted to parameterized statements. Red Auditor validated the patch and found no residual injection vectors.",
    securityScore: 95,
    riskLevel: "LOW",
    finalStatus: "SECURED",
    runtime: "18.2s",
    iterations: 1,
    findings: {
      verifiedExploits: 0,
      speculativeRisks: 1,
      informational: 0,
    },
  },
  {
    id: "command-injection",
    title: "Command Injection",
    description:
      "User-controlled input passed to os.system(). Blue Coder replaced with subprocess.run using argument lists. Red Auditor confirmed no shell injection surface remains.",
    securityScore: 98,
    riskLevel: "LOW",
    finalStatus: "SECURED",
    runtime: "14.1s",
    iterations: 1,
    findings: {
      verifiedExploits: 0,
      speculativeRisks: 0,
      informational: 1,
    },
  },
  {
    id: "path-traversal",
    title: "Path Traversal",
    description:
      "Unsantized filename concatenation allowing directory escape. Blue Coder implemented path normalization with strict prefix validation. Red Auditor identified TOCTOU race condition, classified as speculative risk.",
    securityScore: 92,
    riskLevel: "LOW",
    finalStatus: "SECURED",
    runtime: "46.2s",
    iterations: 1,
    findings: {
      verifiedExploits: 0,
      speculativeRisks: 1,
      informational: 0,
    },
  },
];
