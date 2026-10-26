import React from 'react';
import { NotificationItem } from '../../types/api';
import { Bell, CheckCheck, X, AlertCircle, FileCheck, Info } from 'lucide-react';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onSelectApplication?: (appId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onSelectApplication
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-300 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-[#002147] text-white p-4 flex items-center justify-between border-b-2 border-orange-500">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">In-App Official Alerts</h3>
              <p className="text-[11px] text-slate-300">Statutory and Workflow Notifications</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No pending alerts</p>
              <p className="text-xs">All notifications are up to date.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const isUnread = !item.readAt;
              let icon = <Info className="w-4 h-4 text-sky-600 mt-0.5" />;

              if (item.type === 'deficiency_raised') {
                icon = <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />;
              } else if (item.type === 'final_decision' || item.type === 'submission_confirmed') {
                icon = <FileCheck className="w-4 h-4 text-emerald-600 mt-0.5" />;
              }

              return (
                <div
                  key={item.notificationId}
                  className={`p-3 rounded border text-xs transition-all ${
                    isUnread
                      ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {icon}
                    <div className="flex-1">
                      <p className={`text-slate-800 ${isUnread ? 'font-semibold' : 'font-normal'}`}>
                        {item.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
                        <span>{new Date(item.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                        <div className="flex items-center gap-2">
                          {item.applicationId && onSelectApplication && (
                            <button
                              onClick={() => {
                                onSelectApplication(item.applicationId!);
                                onClose();
                              }}
                              className="text-blue-700 hover:underline font-semibold"
                            >
                              View App
                            </button>
                          )}
                          {isUnread && (
                            <button
                              onClick={() => onMarkRead(item.notificationId)}
                              className="inline-flex items-center gap-0.5 text-slate-600 hover:text-slate-900 font-medium"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-blue-800" />
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          AICTE SmartApproval Notification Service v2.0
        </div>
      </div>
    </div>
  );
};
