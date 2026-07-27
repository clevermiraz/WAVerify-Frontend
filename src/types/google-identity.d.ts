/**
 * Minimal typings for the parts of Google Identity Services we use.
 *
 * Only the ID-token ("Sign in with Google") surface is declared. The OAuth
 * token/code clients are deliberately absent: this app never handles Google
 * access tokens, it hands the signed ID token straight to the backend.
 */

export interface GoogleCredentialResponse {
  /** A JWT ID token. Opaque here — only the backend verifies it. */
  credential: string;
  select_by: string;
}

export interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  itp_support?: boolean;
}

export interface GoogleButtonConfiguration {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  /** Pixels. Google rejects values above 400. */
  width?: number;
  locale?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonConfiguration
          ) => void;
          /** Stops the next visit from silently re-signing the user in. */
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}
