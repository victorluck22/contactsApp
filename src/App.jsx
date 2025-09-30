import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Layout } from "./components/Layout.jsx";
import { fadeIn } from "./lib/motion.js";
import LoginPage from "./pages/auth/Login.jsx";
import RegisterPage from "./pages/auth/Register.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPassword.jsx";
import VerifyEmailPage from "./pages/auth/VerifyEmail.jsx";
import ResetPasswordPage from "./pages/auth/ResetPassword.jsx";
import AccountPage from "./pages/account/Account.jsx";
import { MapView } from "./components/MapView.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ContactsProvider } from "./context/ContactsContext.jsx";
import { UiProvider } from "./context/UiContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

const PageWrapper = ({ children }) => (
  <motion.div {...fadeIn("up", 16)} className="w-full h-full relative">
    {children}
  </motion.div>
);

function DashboardMapPage() {
  return (
    <PageWrapper>
      <MapView />
    </PageWrapper>
  );
}

function LoadingFallback() {
  return <div className="p-4 text-sm">Carregando...</div>;
}

// AccountPage agora importado de pages/account/Account.jsx

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ContactsProvider>
          <UiProvider>
            <ToastProvider>
              <Layout>
                <AnimatePresence mode="wait">
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Públicas */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                      />
                      <Route
                        path="/verify-email"
                        element={<VerifyEmailPage />}
                      />
                      <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                      />
                      {/* Privadas */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <DashboardMapPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </Layout>
            </ToastProvider>
          </UiProvider>
        </ContactsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
