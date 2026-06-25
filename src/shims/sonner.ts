/**
 * Sonner shim for React Native
 * Maps sonner's `toast` API to react-native-toast-message
 * so existing `import { toast } from 'sonner'` calls work unchanged.
 */
import Toast from "react-native-toast-message";

const toast = {
  success: (message: string, options?: { description?: string }) => {
    Toast.show({
      type: "success",
      text1: message,
      text2: options?.description,
    });
  },
  error: (message: string, options?: { description?: string }) => {
    Toast.show({
      type: "error",
      text1: message,
      text2: options?.description,
    });
  },
  info: (message: string, options?: { description?: string }) => {
    Toast.show({
      type: "info",
      text1: message,
      text2: options?.description,
    });
  },
  warning: (message: string, options?: { description?: string }) => {
    Toast.show({
      type: "error",
      text1: message,
      text2: options?.description,
    });
  },
  /** Generic call used as toast("message") */
  message: (message: string, options?: { description?: string }) => {
    Toast.show({
      type: "info",
      text1: message,
      text2: options?.description,
    });
  },
};

// Allow both `toast("msg")` and `toast.success("msg")` usage
const toastFn = Object.assign(
  (message: string, options?: { description?: string }) =>
    toast.message(message, options),
  toast
);

export { toastFn as toast };
export default toastFn;
