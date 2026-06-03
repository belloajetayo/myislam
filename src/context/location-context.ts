import { createContext } from "react";
import { ExactLocation } from "@/hooks/useExactLocation";

export interface LocationContextValue {
  location: ExactLocation | null;
  loading: boolean;
  error: string | null;
  refreshLocation: (opts?: { preferCache?: boolean }) => Promise<ExactLocation>;
}

export const LocationContext = createContext<LocationContextValue | undefined>(undefined);
