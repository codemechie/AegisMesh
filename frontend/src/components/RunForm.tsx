import { useState, type FC } from "react";

interface RunFormProps {
  onRun: (sourceCode: string, vulnerability: string) => void;
  loading: boolean;
}

const DEFAULT_CODE = `query = f"SELECT * FROM users WHERE id = '{user_input}'"
cursor.execute(query)`;

const DEFAULT_VULN = "SQL Injection";

const RunForm: FC<RunFormProps> = ({ onRun, loading }) => {
  const [sourceCode, setSourceCode] = useState(DEFAULT_CODE);
  const [vulnerability, setVulnerability] = useState(DEFAULT_VULN);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRun(sourceCode, vulnerability);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-lg"
    >
      <h2 className="text-lg font-semibold text-[#f3f4f6]">Run Mesh</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#9ca3af]">
          Source Code
        </label>
        <textarea
          className="w-full rounded-lg border border-[#1f2937] bg-[#0a0f1a] px-3 py-2 font-mono text-sm text-[#f3f4f6] placeholder-[#4b5563] focus:border-blue-500 focus:outline-none"
          rows={6}
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#9ca3af]">
          Vulnerability
        </label>
        <input
          className="w-full rounded-lg border border-[#1f2937] bg-[#0a0f1a] px-3 py-2 text-sm text-[#f3f4f6] placeholder-[#4b5563] focus:border-blue-500 focus:outline-none"
          value={vulnerability}
          onChange={(e) => setVulnerability(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Running..." : "Submit"}
      </button>
    </form>
  );
};

export default RunForm;
