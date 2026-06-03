import { useContext } from "react";
import { LocationContext } from "@/context/location-context";

export function useSharedLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useSharedLocation must be used inside LocationProvider");
  }
  return context;
}
