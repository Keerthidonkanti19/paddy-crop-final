// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { I18nextProvider } from "react-i18next";
// import i18n from "./i18n";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import AuthPage from "./pages/AuthPage";
// import HomePage from "./pages/HomePage";
// import ProfilePage from "./pages/ProfilePage";

// function Protected({ children }: { children: React.ReactNode }) {
//   const { isAuthenticated } = useAuth();
//   if (!isAuthenticated) return <Navigate to="/" replace />;
//   return <>{children}</>;
// }

// export default function App() {
//   return (
//     <I18nextProvider i18n={i18n}>
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<AuthPage />} />
//             <Route
//               path="/home"
//               element={
//                 <Protected>
//                   <HomePage />
//                 </Protected>
//               }
//             />
//             <Route
//               path="/profile"
//               element={
//                 <Protected>
//                   <ProfilePage />
//                 </Protected>
//               }
//             />
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </I18nextProvider>
//   );
// }


// frontend/src/App.tsx

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { I18nextProvider } from "react-i18next";

import i18n from "./i18n";

import {
  AuthProvider,
  useAuth,
} from "./contexts/AuthContext";

import AuthPage from "./pages/AuthPage";

import HomePage from "./pages/HomePage";

import ProfilePage from "./pages/ProfilePage";

import PredictPage from "./pages/PredictPage";


// ---------------------------------------------------
// Protected Route Wrapper
// ---------------------------------------------------
function Protected({
  children,
}: {
  children: React.ReactNode;
}) {

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


// ---------------------------------------------------
// Main App
// ---------------------------------------------------
export default function App() {

  return (
    <I18nextProvider i18n={i18n}>

      <AuthProvider>

        <BrowserRouter>

          <Routes>

            {/* Auth Page */}
            <Route
              path="/"
              element={<AuthPage />}
            />

            {/* Home Page */}
            <Route
              path="/home"
              element={
                <Protected>
                  <HomePage />
                </Protected>
              }
            />

            {/* Predict Page */}
            <Route
              path="/predict"
              element={
                <Protected>
                  <PredictPage />
                </Protected>
              }
            />

            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                <Protected>
                  <ProfilePage />
                </Protected>
              }
            />

            {/* Fallback Route */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </BrowserRouter>

      </AuthProvider>

    </I18nextProvider>
  );
}
