import type { StripeCardElement } from '@stripe/stripe-js';

export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed';

export interface BookingData {
  id: string;
  serviceId: string;
  serviceType: string;
  serviceTitle: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  customerInfo: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    };
  };
  created: number;
}

export interface PaymentIntentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  payment_method_types: string[];
  metadata: Record<string, string>;
}

export interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
  clientSecret?: string;
  options?: {
    saveCard?: boolean;
    showPaymentMethods?: boolean;
  };
}

export interface StripePaymentFormProps extends PaymentFormProps {
  stripe: any;
  elements: any;
}

export interface CardElementOptions {
  style: {
    base: {
      color: string;
      fontFamily: string;
      fontSmoothing: string;
      fontSize: string;
      '::placeholder': {
        color: string;
      };
      ':-webkit-autofill'?: {
        color: string;
      };
    };
    invalid: {
      color: string;
      iconColor: string;
    };
  };
  hidePostalCode: boolean;
  hideIcon: boolean;
}

export interface PaymentState {
  status: PaymentStatus;
  error: string | null;
  paymentIntent: PaymentIntentData | null;
  paymentMethod: PaymentMethod | null;
  savedCards: PaymentMethod[];
  selectedCard: string;
  useSavedCard: boolean;
  loading: boolean;
}

export interface PaymentAction {
  type: string;
  payload?: any;
}

export const initialPaymentState: PaymentState = {
  status: 'idle',
  error: null,
  paymentIntent: null,
  paymentMethod: null,
  savedCards: [],
  selectedCard: '',
  useSavedCard: false,
  loading: false,
};

export type PaymentContextType = {
  state: PaymentState;
  dispatch: React.Dispatch<PaymentAction>;
  handlePayment: (e: React.FormEvent) => Promise<void>;
  handlePaymentMethodChange: (method: PaymentMethod) => void;
  handleCardSelect: (cardId: string) => void;
  handleSaveCardChange: (checked: boolean) => void;
  handleUseSavedCardChange: (checked: boolean) => void;
  handlePaymentSuccess: (paymentIntent: any) => Promise<void>;
  handlePaymentError: (error: Error) => void;
};
