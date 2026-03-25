import { createContext, useContext, useState, ReactNode } from "react";

export interface DatacenterInfo {
  id: string;
  name: string;
  location: string;
  status: "normal" | "warning" | "critical";
  nodes: number;
  currentLoad: number;
}

interface DatacenterContextType {
  connectedDC: DatacenterInfo | null;
  connect: (dc: DatacenterInfo) => Promise<void>;
  disconnect: () => void;
  connecting: string | null; // id of dc being connected
}

const DatacenterContext = createContext<DatacenterContextType | null>(null);

export function DatacenterProvider({ children }: { children: ReactNode }) {
  const [connectedDC, setConnectedDC] = useState<DatacenterInfo | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const connect = async (dc: DatacenterInfo) => {
    setConnecting(dc.id);
        setConnectedDC(dc);
    setConnecting(null);
  };

  const disconnect = () => {
    setConnectedDC(null);
    setConnecting(null);
  };

  return (
    <DatacenterContext.Provider value={{ connectedDC, connect, disconnect, connecting }}>
      {children}
    </DatacenterContext.Provider>
  );
}

export function useDatacenter() {
  const ctx = useContext(DatacenterContext);
  if (!ctx) throw new Error("useDatacenter must be used within DatacenterProvider");
  return ctx;
}
