import React from 'react'
import { Link } from 'react-router-dom'

function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Container principal avec design moderne */}
            <div className="flex min-h-screen">
                {/* Section gauche - Branding Sonitelecom */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Gradient de fond avec les couleurs Sonitelecom */}
                    <div className="absolute inset-0 bg-gradient-to-br from-soni-navy via-soni-navy/95 to-blue-900"></div>

                    {/* Motifs géométriques inspirés de la charte */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-accent-400 rounded-2xl rotate-12"></div>
                        <div className="absolute top-1/3 right-16 w-24 h-24 bg-accent-400 rounded-full"></div>
                        <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-white rotate-45"></div>
                        <div className="absolute bottom-20 right-1/3 w-16 h-40 bg-gradient-to-t from-accent-400/60 to-transparent rounded-full"></div>
                        <div className="absolute top-1/2 left-10 w-6 h-6 bg-accent-300 rounded-full"></div>
                        <div className="absolute top-3/4 right-20 w-8 h-8 bg-white/30 rounded-full"></div>
                    </div>

                    {/* Contenu principal */}
                    <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
                        {/* Logo et branding */}
                        <div className="mb-12">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center mr-4">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">
                                        <Link to="/" className="text-2xl font-bold text-soni-navy">
                                            <span className="text-accent-400">SONI</span>
                                            <span className="text-white">SHOP</span>
                                        </Link>
                                    </h1>
                                    <p className="text-accent-200 text-sm">by Sonitelecom</p>
                                </div>
                            </div>

                            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                                Votre marketplace <br />
                                <span className="text-accent-400">de confiance</span>
                            </h2>

                            <p className="text-xl text-blue-100 leading-relaxed">
                                Découvrez une expérience d'achat unique avec la technologie et la fiabilité Sonitelecom
                            </p>
                        </div>

                        {/* Fonctionnalités clés */}
                        <div className="space-y-6 mb-12">
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-accent-400/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold">Paiement 100% sécurisé</p>
                                    <p className="text-blue-200 text-sm">Technologie de cryptage avancée</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-accent-400/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold">Livraison express</p>
                                    <p className="text-blue-200 text-sm">24h à 48h partout au Cameroun</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-accent-400/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold">Support 24/7</p>
                                    <p className="text-blue-200 text-sm">Assistance dédiée et réactive</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistiques de confiance */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent-400 mb-1">15K+</div>
                                <div className="text-blue-200 text-sm uppercase tracking-wide">Clients satisfaits</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent-400 mb-1">98%</div>
                                <div className="text-blue-200 text-sm uppercase tracking-wide">Satisfaction</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent-400 mb-1">24/7</div>
                                <div className="text-blue-200 text-sm uppercase tracking-wide">Support</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section droite - Formulaire */}
                <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md mx-auto">
                        {/* Logo mobile */}
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/" className="inline-flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-soni-navy to-blue-800 rounded-xl flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold">
                                    <span className="text-soni-navy">SONI</span>
                                    <span className="text-gray-800">SHOP</span>
                                </div>
                            </Link>
                        </div>

                        {/* En-tête */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-gray-600 text-lg">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Contenu du formulaire */}
                        <div className="space-y-6">
                            {children}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-500">
                                © 2024 SoniShop by Sonitelecom. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
