import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import TranscriptViewer from "./pages/TranscriptViewer";
import Benchmarks from "./pages/Benchmarks";
import Documentation from "./pages/Documentation";
import ApiReference from "./pages/ApiReference";
import { MeshDataProvider } from "./context/MeshDataContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MeshDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transcript/:sessionId" element={<TranscriptViewer />} />
            <Route path="/benchmarks" element={<Benchmarks />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/api-reference" element={<ApiReference />} />
          </Routes>
        </BrowserRouter>
      </MeshDataProvider>
    </QueryClientProvider>
  );
}

export default App;
