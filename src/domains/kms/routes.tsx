import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { KmsSpinner } from './components/KmsSpinner';

const KmsAuthPage = lazy(() => import('./pages/KmsAuthPage'));
const KmsVerifyPage = lazy(() => import('./pages/KmsVerifyPage'));
const KmsOrderPage = lazy(() => import('./pages/KmsOrderPage'));
const KmsConfirmPage = lazy(() => import('./pages/KmsConfirmPage'));
const KmsHmacAuthPage = lazy(() => import('./pages/KmsHmacAuthPage'));

function withSuspense(element: React.ReactElement) {
  return <Suspense fallback={<KmsSpinner />}>{element}</Suspense>;
}

/** Standard KMS routes (embedded in workwear platform at /kms/:slug) */
export function kmsRoutes() {
  return (
    <>
      <Route path="/kms/:slug" element={withSuspense(<KmsAuthPage />)} />
      <Route path="/kms/:slug/auth/hmac" element={withSuspense(<KmsHmacAuthPage />)} />
      <Route path="/kms/:slug/auth/:token" element={withSuspense(<KmsVerifyPage />)} />
      <Route path="/kms/:slug/bestellen" element={withSuspense(<KmsOrderPage />)} />
      <Route path="/kms/:slug/bevestiging" element={withSuspense(<KmsConfirmPage />)} />
    </>
  );
}

/** Portal routes for kms.databiz.app — no /kms/ prefix, slug from config */
export function kmsPortalRoutes() {
  return (
    <>
      <Route path="/" element={withSuspense(<KmsAuthPage />)} />
      <Route path="/auth/hmac" element={withSuspense(<KmsHmacAuthPage />)} />
      <Route path="/auth/:token" element={withSuspense(<KmsVerifyPage />)} />
      <Route path="/bestellen" element={withSuspense(<KmsOrderPage />)} />
      <Route path="/bevestiging" element={withSuspense(<KmsConfirmPage />)} />
    </>
  );
}
