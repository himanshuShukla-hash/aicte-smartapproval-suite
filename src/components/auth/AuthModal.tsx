import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types/api';
import { AshokaEmblem, AicteLogo } from '../common/Emblem';
import { LogIn, UserPlus, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  usersList: UserProfile[];
  onSelectUser: (uid: string) => void;
  onRegisterUser: (name: string, email: string, role: UserRole) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  usersList,
  onSelectUser,
  onRegisterUser
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7K9N2');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('institution');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaCode) {
      alert('Security Captcha does not match. Please re-enter.');
      refreshCaptcha();
      return;
    }

    const matched = usersList.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (matched) {
      onSelectUser(matched.uid);
      onClose();
    } else {
      alert('Email not recognized. Use one of the Demo One-Click Personas below or register.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaCode) {
      alert('Security Captcha does not match.');
      refreshCaptcha();
      return;
    }
    setIsRegistering(true);
    try {
      await onRegisterUser(regName, regEmail, regRole);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#002147] text-white p-4 border-b-2 border-orange-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AshokaEmblem className="h-9 w-auto text-amber-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">AICTE Official Portal Login</h3>
              <p className="text-[10px] text-slate-300">National Single Sign-On (SSO)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              tab === 'login'
                ? 'bg-white text-[#002147] border-b-2 border-[#002147]'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Existing User Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              tab === 'register'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Tab 1: Login */}
        {tab === 'login' && (
          <div className="p-6 space-y-4">
            
            {/* Quick One-Click Demo Personas for Judge/User testing */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-2">
              <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                ⚡ Quick Demo Fast-Login (Click to switch persona):
              </span>
              <div className="space-y-1">
                {usersList.slice(0, 3).map(u => (
                  <button
                    key={u.uid}
                    onClick={() => {
                      onSelectUser(u.uid);
                      onClose();
                    }}
                    className="w-full text-left p-1.5 rounded bg-white hover:bg-amber-100 border border-amber-200 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <span className="font-bold text-slate-800 truncate">{u.displayName}</span>
                    <span className="font-mono text-[9px] uppercase px-1 py-0.5 rounded bg-slate-200 text-slate-700">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Email ID / Login ID</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="principal@delhi-tech.edu.in"
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              {/* Simulated Captcha */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enter Security Characters</label>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="bg-slate-800 text-amber-300 font-mono font-black text-base px-3 py-1.5 tracking-widest rounded select-none shadow-inner border border-slate-600 line-through">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                    title="Change Captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Type characters above"
                  className="w-full govt-input text-xs uppercase font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-govt-primary text-xs py-2 flex items-center justify-center gap-2 shadow-sm mt-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Portal
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Register */}
        {tab === 'register' && (
          <div className="p-6 space-y-4">
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorized Person Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Prof. Rajesh K. Sharma"
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="director@tech-campus.ac.in"
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Category</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full govt-input text-xs"
                >
                  <option value="institution">Applicant Institution User</option>
                  <option value="reviewer">Scrutiny Reviewer</option>
                </select>
              </div>

              {/* Captcha */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Security Code</label>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="bg-slate-800 text-amber-300 font-mono font-black text-base px-3 py-1.5 tracking-widest rounded select-none shadow-inner line-through">
                    {captchaCode}
                  </div>
                  <button type="button" onClick={refreshCaptcha} className="p-1.5 bg-slate-100 rounded">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Type characters"
                  className="w-full govt-input text-xs uppercase font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full btn-govt-saffron text-xs py-2 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                {isRegistering ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
