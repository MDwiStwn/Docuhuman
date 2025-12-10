"use client";

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  LayoutGrid,
  FileText,
  BarChart2,
  LogOut,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  ChevronRight,
  Bell,
  Search,
  Trash2,
  MoreHorizontal,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import { jwtDecode } from "jwt-decode";

// Replace with your actual Client ID or use environment variable
const GOOGLE_CLIENT_ID = "839700373186-lnqj1senhlrd2nmpfdi94koc0npt4een.apps.googleusercontent.com";

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

interface HistoryEntry {
  id: string;
  title: string;
  date: string;
  status: string;
  downloadUrl?: string;
}

export default function Home() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Dashboard />
    </GoogleOAuthProvider>
  );
}

function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Initial Dummy History
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: '1', title: "Thesis_Final_Draft.docx", date: "Just now", status: "Completed" },
    { id: '2', title: "Chapter_1_Rev2.pdf", date: "2 hours ago", status: "Completed" },
    { id: '3', title: "Abstract_Indo.docx", date: "Yesterday", status: "Completed" },
    { id: '4', title: "Proposal_Skripsi.pdf", date: "2 days ago", status: "Completed" },
    { id: '5', title: "Journal_Article_v1.docx", date: "3 days ago", status: "Completed" },
    { id: '6', title: "Essay_Pancasila.pdf", date: "Last week", status: "Completed" },
  ]);

  const handleLoginSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setToken(credentialResponse.credential);
      setError(null);
      try {
        const decoded: any = jwtDecode(credentialResponse.credential);
        setUser({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        });
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  };

  const handleLoginError = () => {
    setError("Login Failed. Please try again.");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setFile(null);
    setDownloadUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setDownloadUrl(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file || !token) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/paraphrase", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || "Processing failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Add to History
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        title: file.name,
        date: "Just now",
        status: "Completed",
        downloadUrl: url
      };
      setHistory(prev => [newEntry, ...prev]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteAllHistory = () => {
    setHistory([]);
    setShowHistoryMenu(false);
  };

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedHistory = showAllHistory ? filteredHistory : filteredHistory.slice(0, 4);

  return (
    <div className="flex h-screen bg-[#F5F6FA] font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-24 bg-white flex flex-col items-center py-8 border-r border-gray-100 flex-shrink-0">
        <div className="mb-12">
          {/* Logo */}
          {/* Logo */}
          <div className="w-14 h-14 relative mb-2">
            <img src="/logo.png" alt="DocuHuman" className="w-full h-full object-contain drop-shadow-md" />
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-6 w-full items-center">
          <NavItem
            icon={<LayoutGrid size={24} />}
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavItem
            icon={<BarChart2 size={24} />}
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
          />
        </nav>

        <div className="mt-auto">
          {token && (
            <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut size={24} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-10 bg-[#F5F6FA] flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'home' ? 'Dashboard' : activeTab === 'stats' ? 'History' : 'Settings'}
            </h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.name || 'Guest'}!</p>
          </div>

          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none focus:ring-2 focus:ring-gray-200 outline-none text-sm shadow-sm transition-shadow"
            />
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          <div className="w-full h-full flex flex-col">

            {/* HOME TAB: Paraphraser Tool */}
            {activeTab === 'home' && (
              <div className="bg-white rounded-[40px] p-8 shadow-sm relative overflow-hidden flex-1 min-h-[500px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Card Header */}
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-2 h-8 bg-yellow-400 rounded-full"></span>
                      <h2 className="text-3xl font-bold text-gray-900">Paraphraser Tool</h2>
                    </div>
                    <p className="text-gray-500 ml-5">Upload your document to humanize AI text.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-600">System Online</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 flex flex-col relative z-10">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-2xl text-red-600 flex items-center animate-in fade-in slide-in-from-top-2">
                      <AlertCircle size={20} className="mr-3" />
                      {error}
                    </div>
                  )}

                  {!token ? (
                    <AuthRequired onSuccess={handleLoginSuccess} onError={handleLoginError} />
                  ) : (
                    <div className="flex-1 flex flex-col">
                      {/* Upload Area */}
                      <div className="flex-1 border-3 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center p-10 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer relative group bg-gray-50/30">
                        <input
                          type="file"
                          accept=".docx,.pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />

                        {file ? (
                          <div className="text-center animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 relative">
                              <FileText className="text-black" size={48} />
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-white">
                                <CheckCircle size={14} />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{file.name}</h3>
                            <p className="text-gray-500 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
                            <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                              Ready to process
                            </span>
                          </div>
                        ) : (
                          <div className="text-center group-hover:scale-105 transition-transform duration-300">
                            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200">
                              <Upload className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your file here</h3>
                            <p className="text-gray-400">or click to browse</p>
                            <div className="mt-6 flex gap-3 justify-center">
                              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">.docx</span>
                              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">.pdf</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions Bar */}
                      <div className="mt-8 bg-gray-50 rounded-3xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-6 px-4">
                          <div className="hidden md:block">
                            <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Model</span>
                            <span className="block font-bold text-gray-900">Gemini 1.5 Pro</span>
                          </div>
                          <div className="hidden md:block w-[1px] h-8 bg-gray-200"></div>
                          <div className="hidden md:block">
                            <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Mode</span>
                            <span className="block font-bold text-gray-900">Academic</span>
                          </div>
                        </div>

                        {isProcessing ? (
                          <button disabled className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center opacity-80 cursor-not-allowed">
                            <Loader2 size={20} className="mr-3 animate-spin" />
                            Humanizing Text...
                          </button>
                        ) : downloadUrl ? (
                          <a
                            href={downloadUrl}
                            download={`humanized_${file?.name || "doc.docx"}`}
                            className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-1"
                          >
                            <Download size={20} className="mr-3" />
                            Download Result
                          </a>
                        ) : (
                          <button
                            onClick={handleProcess}
                            disabled={!file}
                            className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all ${file
                              ? "bg-black text-white hover:bg-gray-800 shadow-xl shadow-gray-200 hover:shadow-2xl transform hover:-translate-y-1"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            Start Paraphrasing
                            <ChevronRight size={20} className="ml-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-50/50 to-transparent rounded-bl-full -z-0 pointer-events-none"></div>
              </div>
            )}

            {/* STATS TAB: Full History View */}
            {activeTab === 'stats' && (
              <div className="bg-white rounded-[40px] p-8 shadow-sm flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-2 h-8 bg-black rounded-full"></span>
                      <h2 className="text-3xl font-bold text-gray-900">Document History</h2>
                    </div>
                    <p className="text-gray-500 ml-5">Manage your previously paraphrased documents.</p>
                  </div>
                  {token && (
                    <button
                      onClick={handleDeleteAllHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 size={18} />
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {!token ? (
                    <AuthRequired onSuccess={handleLoginSuccess} onError={handleLoginError} />
                  ) : filteredHistory.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{item.date}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-green-600 font-medium">{item.status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.downloadUrl && (
                              <a
                                href={item.downloadUrl}
                                download={`humanized_${item.title}`}
                                className="p-3 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-xl transition-colors"
                                title="Download"
                              >
                                <Download size={20} />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteHistory(item.id)}
                              className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} />
                      </div>
                      <p className="text-lg">No history found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Panel - Simplified */}
      <aside className="w-80 bg-[#F5F6FA] p-8 pl-0 flex flex-col gap-8 flex-shrink-0 hidden 2xl:flex">
        {/* User Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.picture ? (
              <Image
                src={user.picture}
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full border-4 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-4 border-white shadow-sm">
                <span className="text-xs font-bold">GUEST</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">{user?.name || "Guest User"}</span>
              <span className="text-xs text-gray-500 truncate w-32">{user?.email || "Not logged in"}</span>
            </div>
          </div>
          <button className="p-3 bg-white rounded-full shadow-sm text-gray-400 hover:text-black transition-colors">
            <Bell size={20} />
          </button>
        </div>

        {/* Recent History Widget */}
        <div className="flex-1 bg-white rounded-[32px] p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 relative">
            <h3 className="font-bold text-lg text-gray-900">History</h3>
            <div className="relative">
              {token && (
                <button
                  onClick={() => setShowHistoryMenu(!showHistoryMenu)}
                  className="p-2 hover:bg-gray-50 rounded-full text-gray-400"
                >
                  <MoreHorizontal size={20} />
                </button>
              )}

              {showHistoryMenu && token && (
                <div className="absolute right-0 top-10 bg-white shadow-xl rounded-xl border border-gray-100 py-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={handleDeleteAllHistory}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete All History
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {!token ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Lock size={24} />
                </div>
                <p className="text-sm text-gray-500 mb-4">Please login to view your history</p>
                <div className="w-full">
                  <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} type="icon" shape="circle" />
                </div>
              </div>
            ) : displayedHistory.length > 0 ? (
              displayedHistory.map((item) => (
                <HistoryItem
                  key={item.id}
                  title={item.title}
                  date={item.date}
                  status={item.status}
                  downloadUrl={item.downloadUrl}
                  onDelete={() => handleDeleteHistory(item.id)}
                />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                No history found
              </div>
            )}
          </div>

          {token && (
            <button
              onClick={() => setActiveTab('stats')}
              className="mt-4 w-full py-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              View All History
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function NavItem({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${active
        ? 'bg-black text-white shadow-lg shadow-gray-300 scale-110'
        : 'text-gray-400 hover:bg-white hover:text-gray-600'
        }`}
    >
      {icon}
    </button>
  );
}

function AuthRequired({ onSuccess, onError }: { onSuccess: (res: any) => void, onError: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
          <FileText size={32} className="text-gray-900" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3">Authentication Required</h3>
      <p className="text-gray-500 mb-8 leading-relaxed">
        To ensure the security and quality of our service, please sign in with your Google account to access the paraphrasing tool and history.
      </p>
      <div className="w-full">
        <GoogleLogin onSuccess={onSuccess} onError={onError} useOneTap />
      </div>
    </div>
  );
}

function HistoryItem({ title, date, status, onDelete, downloadUrl }: { title: string, date: string, status: string, onDelete: () => void, downloadUrl?: string }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
        <FileText size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-400">{date}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`humanized_${title}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
            title="Download"
          >
            <Download size={16} />
          </a>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
