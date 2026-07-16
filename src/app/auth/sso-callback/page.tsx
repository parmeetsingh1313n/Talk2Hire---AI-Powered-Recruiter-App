import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

// Clerk handles the OAuth handshake here and then forwards the user to
// redirectUrlComplete (/dashboard). This page just renders the callback handler.
export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback />
}
