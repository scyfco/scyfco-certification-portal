'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur de vérification');
        setLoading(false);
        return;
      }

      // Rediriger vers la page principale
      router.push('/ds-mentors');
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Logo Section - Top Left */}
      <div className="absolute top-8 left-8">
        {/* Placeholder pour votre logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
            {/* Remplacer par votre logo */}
            <span className="text-white font-bold text-xl">S</span>
          </div>
        </div>
      </div>

      {/* Left Side - Image/Illustration Area */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="/images/illustration.jpeg" 
          alt="Illustration" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-20">
            <img 
              src="/images/logo%20scyfco.png" 
              alt="SCYFCO Logo" 
              className="h-20 w-auto"
            />
          </div>

            {/* Header Text */}
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bon retour
            </h1>
            <p className="text-gray-600">
              Accédez à votre portail de certification SCYFCO pour suivre vos sessions, 
              évaluer vos participants et gérer l'ensemble de vos parcours de formation.
            </p>
            </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
