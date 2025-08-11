import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'

// Pages d'authentification
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import ResetPassword from './pages/auth/ResetPassword'

// Pages principales
import Home from './pages/Home'
import Contact from './pages/Contact'

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Pages d'authentification sans layout */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    {/* Pages avec layout */}
                    <Route path="/" element={
                        <Layout>
                            <Home />
                        </Layout>
                    } />
                    
                    <Route path="/contact" element={
                        <Layout>
                            <Contact />
                        </Layout>
                    } />

                    {/* Route 404 */}
                    <Route path="*" element={
                        <Layout>
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                                    <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                                    <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                                        Retour à l'accueil
                                    </a>
                                </div>
                            </div>
                        </Layout>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
