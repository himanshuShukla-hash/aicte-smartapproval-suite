import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/api';
import { AshokaEmblem, AicteLogo } from './Emblem';
import { 
  Bell, 
  User, 
  ChevronDown, 
  LogOut, 
  Home, 
  FileText, 
  CheckSquare, 
  Settings, 
  HelpCircle,
  PhoneCall,
  Search,
  BookOpen
} from 'lucide-react';

interface PassportSevaHeaderProps {
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  onSwitchUser: (uid: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onResetData: () => void;
}

export const PassportSevaHeader: React.FC<PassportSevaHeaderProps> = ({
  currentUser,
  usersList,
  onSwitchUser,
  activeTab,
  onTabChange,
  unreadCount,
  onOpenNotifications,
  onOpenAuth,
  onResetData
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' | ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-white select-none border-b border-slate-300">
      
      {/* 1. TOP UTILITY STRIP (Indian Government Accessibility Bar) */}
      <div className="bg-[#0b1e36] text-slate-300 text-[11px] px-4 py-1 flex flex-wrap items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white tracking-wide flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-1.5 bg-orange-500 rounded-2xs"></span>
            <span className="inline-block w-2.5 h-1.5 bg-white rounded-2xs"></span>
            <span className="inline-block w-2.5 h-1.5 bg-green-600 rounded-2xs"></span>
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">
            शिक्षा मंत्रालय | Ministry of Education
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span className="hidden md:inline font-mono text-[10px] text-amber-300/90">{timeStr}</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <button className="hover:text-white">Skip to Main Content</button>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-bold text-[10px]">
            <button className="px-1 border border-slate-600 rounded hover:bg-slate-700">A-</button>
            <button className="px-1 border border-slate-600 rounded hover:bg-slate-700">A</button>
            <button className="px-1 border border-slate-600 rounded hover:bg-slate-700">A+</button>
          </div>
          <span className="text-slate-600">|</span>
          <span className="cursor-pointer hover:text-white font-medium">English / हिन्दी</span>
        </div>
      </div>

      {/* 2. MAIN HEADER BRANDING BANNER (Passport Seva Style) */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Emblem and Titles */}
        <div className="flex items-center gap-3.5 sm:gap-5">
          <AshokaEmblem className="h-16 w-auto flex-shrink-0" />
          <div className="h-12 w-px bg-slate-300 hidden sm:block"></div>
          <AicteLogo className="h-14 w-14 flex-shrink-0" />
          
          <div>
            <p className="text-[12px] sm:text-xs font-serif font-bold text-slate-700 uppercase tracking-wider">
              अखिल भारतीय तकनीकी शिक्षा परिषद
            </p>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#002147] tracking-tight leading-none uppercase">
              AICTE SmartApproval Suite
            </h1>
            <p className="text-[11px] sm:text-xs text-orange-600 font-semibold tracking-wide mt-0.5">
              Digital Approval & APH Regulatory Compliance Management System
            </p>
          </div>
        </div>

        {/* Right: National Badges & Helpline */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="text-right border-r border-slate-200 pr-4">
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#002147]">
              <PhoneCall className="w-3.5 h-3.5 text-orange-600" />
              <span>National Approval Helpline</span>
            </div>
            <p className="text-sm font-extrabold text-orange-600 font-mono tracking-wide">
              1800-11-2626 <span className="text-[10px] text-slate-500 font-sans font-normal">(Toll Free)</span>
            </p>
            <p className="text-[10px] text-slate-500">Working Hours: 09:00 AM - 05:30 PM (Mon-Fri)</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
              75+
            </div>
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-[#002147]">Azadi Ka Amrit Mahotsav</span>
              <p className="text-slate-500">Digital India Initiative</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY NAVIGATION BAR (Deep Navy Blue #002147 with Saffron Underline) */}
      <nav className="bg-[#002147] text-white shadow-md border-t-2 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between">
          
          {/* Main Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
            <button
              onClick={() => onTabChange('home')}
              className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-200 hover:bg-[#0a366b] hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>

            {currentUser && currentUser.role === 'institution' && (
              <>
                <button
                  onClick={() => onTabChange('institution_applications')}
                  className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    activeTab === 'institution_applications'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-200 hover:bg-[#0a366b] hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  My Applications
                </button>
                <button
                  onClick={() => onTabChange('new_application')}
                  className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    activeTab === 'new_application'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-200 hover:bg-[#0a366b] hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Apply for Approval
                </button>
              </>
            )}

            {currentUser && (currentUser.role === 'reviewer' || currentUser.role === 'committee') && (
              <button
                onClick={() => onTabChange('reviewer_queue')}
                className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'reviewer_queue'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#0a366b] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Scrutiny Workstation
              </button>
            )}

            {currentUser && currentUser.role === 'admin' && (
              <button
                onClick={() => onTabChange('admin_dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'admin_dashboard'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#0a366b] hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Central Admin Console
              </button>
            )}

            <button
              onClick={() => onTabChange('aph_rules')}
              className={`px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'aph_rules'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-200 hover:bg-[#0a366b] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              APH 2027 Norms
            </button>
          </div>

          {/* Right Action: Notifications & Persona Switcher */}
          <div className="flex items-center gap-2.5 py-1.5">
            
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Official Notifications"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#002147] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Demo Persona Dropdown for instant switching */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                  className="bg-[#0a366b] hover:bg-[#124b91] text-white px-2.5 py-1.5 rounded text-xs flex items-center gap-2 border border-slate-500 shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div className="text-left hidden sm:block">
                    <p className="font-bold text-[11px] leading-tight truncate max-w-[150px]">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-amber-300">
                      Role: {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {isPersonaOpen && (
                  <div className="absolute right-0 mt-1 w-72 bg-white rounded shadow-xl border border-slate-300 py-1.5 text-slate-800 z-50 text-xs animate-in fade-in-50">
                    <div className="px-3 py-1.5 border-b border-slate-200 bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Active User Session
                      </p>
                      <p className="font-bold text-[#002147] truncate">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Demo Role Persona:
                    </div>

                    {usersList.map((user) => (
                      <button
                        key={user.uid}
                        onClick={() => {
                          onSwitchUser(user.uid);
                          setIsPersonaOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between ${
                          user.uid === currentUser.uid ? 'bg-amber-50 font-bold text-blue-900' : ''
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs truncate">{user.displayName}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {user.role}
                        </span>
                      </button>
                    ))}

                    <div className="border-t border-slate-200 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          onResetData();
                          setIsPersonaOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-[11px] text-red-600 hover:bg-red-50 rounded font-semibold"
                      >
                        Reset Demo Data to Factory Baseline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                Login / Register
              </button>
            )}

          </div>

        </div>
      </nav>

      {/* 4. NEWS & CIRCULAR TICKER STRIP (Iconic Passport Seva ticker bar) */}
      <div className="bg-[#fff9e6] border-b border-amber-200 px-4 py-1 text-xs text-slate-800 flex items-center overflow-hidden">
        <span className="bg-[#E65100] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mr-3 flex-shrink-0 animate-pulse">
          LATEST NOTICES
        </span>
        <div className="truncate text-[11px] font-medium text-slate-700 flex items-center gap-6">
          <span>📢 Approval Process Handbook (APH 2027-28) rules are now active with automated compliance checks.</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">⚠️ Zero-tolerance deficiency policy on statutory Student-Faculty Ratio (SFR 1:20 ceiling).</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">⏳ Extension of Approval (EoA) portal closes on 15-November-2026 at 23:59 IST.</span>
        </div>
      </div>

    </header>
  );
};
