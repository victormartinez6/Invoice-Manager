import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-toastify';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword, error, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Digite seu email para receber o link de recuperação de senha');
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword(email);
      setResetEmailSent(true);
      toast.success(
        'Link de recuperação enviado! Verifique sua caixa de entrada e spam.',
        { autoClose: 5000 }
      );
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast.error(
        'Não foi possível enviar o email de recuperação. Verifique o email e tente novamente.',
        { autoClose: 5000 }
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-primary-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            GERAR INVOICE
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Geração de Faturas
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading || isResettingPassword}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>

            <div className="flex flex-col items-center space-y-4">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResettingPassword || resetEmailSent}
                className="text-sm font-medium text-primary-500 hover:text-primary-600 focus:outline-none focus:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResettingPassword ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : resetEmailSent ? (
                  'Email de recuperação enviado!'
                ) : (
                  'Esqueceu sua senha?'
                )}
              </button>

              {resetEmailSent && (
                <p className="text-sm text-gray-600 text-center">
                  Verifique seu email para recuperar sua senha. 
                  <br />
                  Não recebeu? Verifique sua caixa de spam ou{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmailSent(false);
                      handleForgotPassword();
                    }}
                    className="text-primary-500 hover:text-primary-600 focus:outline-none focus:underline"
                  >
                    tente novamente
                  </button>
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-100 text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-sm text-center">
              <span className="text-gray-500">Ainda não tem uma conta? </span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-medium text-primary-500 hover:text-primary-600 focus:outline-none focus:underline transition-colors duration-200"
              >
                Cadastre-se aqui
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};