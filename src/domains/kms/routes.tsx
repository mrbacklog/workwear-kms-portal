import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { KmsSpinner } from './components/KmsSpinner';

const KmsAuthPage = lazy(() => import('./pages/KmsAuthPage'));
const KmsVerifyPage = lazy(() => import('./pages/KmsVerifyPage'));
const KmsOrderPage = lazy(() => import('./pages/KmsOrderPage'));
const KmsConfirmPage = lazy(() => import('./pages/KmsConfirmPage'));

function withSuspense(element: React.ReactElement) {
  return <Suspense fallback={<KmsSpinner />}>{element}</Suspense>;
}

export function kmsRoutes() {
  return (
    <>
      <Route path="/" element={withSuspense(<KmsAuthPage />)} />
      <Route path="/auth/:token" element={withSuspense(<KmsVerifyPage />)} />
      <Route path="/bestellen" element={withSuspense(<KmsOrderPage />)} />
      <Route path="/bevestiging" element={withSuspense(<KmsConfirmPage />)} />
    </>
  );
}
