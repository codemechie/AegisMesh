import { createContext, useContext, useState, type FC, type ReactNode } from "react";
import type { MeshContext } from "../types/mesh";

interface MeshDataContextValue {
  data: MeshContext | null;
  setData: (data: MeshContext | null) => void;
}

const MeshDataContext = createContext<MeshDataContextValue | null>(null);

export const MeshDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<MeshContext | null>(null);
  return (
    <MeshDataContext.Provider value={{ data, setData }}>
      {children}
    </MeshDataContext.Provider>
  );
};

export function useMeshData(): MeshDataContextValue {
  const ctx = useContext(MeshDataContext);
  if (!ctx) {
    throw new Error("useMeshData must be used within a MeshDataProvider");
  }
  return ctx;
}
