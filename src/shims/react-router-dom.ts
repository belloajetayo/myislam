/**
 * react-router-dom shim for React Native / Expo Router
 * Maps common react-router-dom hooks/components to expo-router equivalents
 * so existing imports work without changes.
 */
export {
  useRouter as useNavigate,
  usePathname as useLocation,
  useLocalSearchParams as useSearchParams,
  Link,
} from "expo-router";

// useLocation in react-router-dom returns { pathname }, match that shape
export { usePathname } from "expo-router";

// BrowserRouter / Routes / Route are not needed in Expo Router — export no-ops
import React from "react";
export const BrowserRouter = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const Routes = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
// Route accepts path + element props to match react-router-dom's API signature
export const Route = (_props: {
  path?: string;
  element?: React.ReactElement | null;
  children?: React.ReactNode;
  index?: boolean;
}) => null;
