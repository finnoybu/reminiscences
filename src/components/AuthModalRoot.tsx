import { useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import PasswordRecoveryModal from './PasswordRecoveryModal';

export default function AuthModalRoot() {
  const [signInOpen, setSignInOpen] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    // Sign-in modal triggers
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-open-signin]')) {
        e.preventDefault();
        setSignInOpen(true);
      }
    };
    const onOpen = () => setSignInOpen(true);
    document.addEventListener('click', onClick);
    window.addEventListener('auth:open', onOpen);

    // Password recovery modal: open automatically when Better Auth's reset
    // flow lands the user back at this page with ?token=<token>.
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setRecoveryToken(token);
      // Strip the token from the visible URL so a page refresh after submit
      // doesn't try to re-open the modal with a now-spent token.
      const cleaned = new URL(window.location.href);
      cleaned.searchParams.delete('token');
      window.history.replaceState({}, '', cleaned.toString());
    }

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('auth:open', onOpen);
    };
  }, []);

  return (
    <>
      {signInOpen && <AuthModal onClose={() => setSignInOpen(false)} />}
      {recoveryToken && (
        <PasswordRecoveryModal token={recoveryToken} onClose={() => setRecoveryToken(null)} />
      )}
    </>
  );
}
