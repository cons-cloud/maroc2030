declare module 'sonner' {
  export function toast(message: string | React.ReactNode, options?: {
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
    description?: string;
    icon?: React.ReactNode;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
    onDismiss?: () => void;
    onAutoClose?: () => void;
  }): string | number;

  export function toast(message: string | React.ReactNode, options?: any): string | number;

  export namespace toast {
    export function success(message: string | React.ReactNode, options?: any): string | number;
    export function error(message: string | React.ReactNode, options?: any): string | number;
    export function warning(message: string | React.ReactNode, options?: any): string | number;
    export function info(message: string | React.ReactNode, options?: any): string | number;
    export function loading(message: string | React.ReactNode, options?: any): string | number;
    export function dismiss(toastId?: string | number): void;
    export function remove(toastId?: string | number): void;
    export function promise<T>(promise: Promise<T>, msgs: {
      loading: string | React.ReactNode;
      success: string | React.ReactNode | ((data: T) => string | React.ReactNode);
      error?: string | React.ReactNode | ((error: any) => string | React.ReactNode);
    }, opts?: any): Promise<T>;
  }

  export default toast;
}
