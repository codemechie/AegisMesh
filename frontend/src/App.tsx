import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TranscriptViewer from "./pages/TranscriptViewer";
import { MeshDataProvider } from "./context/MeshDataContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MeshDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transcript/:sessionId" element={<TranscriptViewer />} />
          </Routes>
        </BrowserRouter>
      </MeshDataProvider>
    </QueryClientProvider>
  );
}

export default App;
