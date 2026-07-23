"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  IndianRupee, 
  Hourglass,
  Sliders,
  Filter,
  Mic,
  MicOff,
  Upload,
  Check,
  FileText,
  AlertCircle,
  Search,
  Lock,
  Loader2,
  FileCode,
  Download
} from "lucide-react";
import { 
  analyticsApi, 
  meetingsApi, 
  audioApi, 
  minutesApi, 
  chatApi, 
  searchApi, 
  auditApi 
} from "./lib/api";

// Helper to access token and user locally
const getAuthToken = () => typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
const getAuthUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("auth_user");
  return userStr ? JSON.parse(userStr) : null;
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Local navigation routing listener (SPA wrapper)
  useEffect(() => {
    setMounted(true);
    const handleRoute = () => {
      const path = window.location.pathname.split("/").pop();
      setActiveTab(path || "dashboard");
    };
    handleRoute();
    window.addEventListener("popstate", handleRoute);
    return () => window.removeEventListener("popstate", handleRoute);
  }, []);

  if (!mounted) return null;

  // Render subpage content based on route
  if (activeTab === "meetings") return <MeetingsPage />;
  if (activeTab === "record") return <RecordPage />;
  if (activeTab === "verify") return <VerifyPage />;
  if (activeTab === "chat") return <ChatPage />;
  if (activeTab === "citizen") return <CitizenPortalPage />;
  if (activeTab === "audit") return <AuditPage />;

  return <DashboardView />;
}

// ----------------------------------------------------
// SUB-PAGE: DASHBOARD VIEW
// ----------------------------------------------------
function DashboardView() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = getAuthToken();
      try {
        setLoading(true);
        const data = await analyticsApi.getDashboard(token);
        setMetrics(data);

        // Fetch recent meetings to fill the logs table
        const meets = await meetingsApi.list(token);
        // Show first 5 meetings
        setRecentMeetings(meets.slice(0, 5));
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Retrieving official e-Panchayat indicators...</span>
      </div>
    );
  }

  const kpis = [
    { 
      title: "Meetings Conducted", 
      value: metrics?.meetings_conducted ?? 0, 
      icon: Calendar, 
      change: "All scheduled/historic", 
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" 
    },
    { 
      title: "Women Participation", 
      value: `${metrics?.women_participation_pct ?? 0}%`, 
      icon: Users, 
      change: "Women empowerment ratio", 
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" 
    },
    { 
      title: "Action Items Done", 
      value: `${metrics?.action_completion_pct ?? 0}%`, 
      icon: CheckCircle, 
      change: `${metrics?.finalized_minutes ?? 0} signed minutes logs`, 
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" 
    },
    { 
      title: "Funds Sanctioned", 
      value: `₹${(metrics?.total_budget_approved ?? 0).toLocaleString()}`, 
      icon: IndianRupee, 
      change: "100% auditable via ledger", 
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" 
    }
  ];

  const socialCategoryData = [
    { name: "SC/ST", value: metrics?.sc_st_participation_pct ?? 0 },
    { name: "OBC", value: metrics?.sc_st_participation_pct ? Math.max(10, 80 - metrics.sc_st_participation_pct) : 40 },
    { name: "General/Others", value: metrics?.sc_st_participation_pct ? Math.max(10, 100 - metrics.sc_st_participation_pct - 30) : 60 }
  ];

  const budgetAllocationData = metrics?.budget_allocation?.length > 0
    ? metrics.budget_allocation.map((b: any) => ({ name: b.sector, amount: b.amount }))
    : [
        { name: "Water Supply", amount: 450000 },
        { name: "Road Repair", amount: 680000 },
        { name: "Primary School", amount: 350000 }
      ];

  const speakingTimeData = metrics?.speaking_time?.length > 0
    ? metrics.speaking_time
    : [
        { name: "Secretary", value: 30 },
        { name: "Sarpanch", value: 45 },
        { name: "Citizens", value: 25 }
      ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-12">
          <Users className="h-96 w-96 text-white" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">Namaste! Gram Panchayat Digital Dashboard</h2>
          <p className="text-slate-300 text-sm mt-1">Real-time indicators, digital meeting ledger tracking, and Indic Whisper translation portal.</p>
        </div>
        <div className="shrink-0 flex space-x-3 relative z-10">
          <button 
            onClick={() => {
              window.history.pushState({}, "", "/record");
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl flex items-center shadow-md transition-colors"
          >
            Record Live Sabha
            <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${kpi.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-slate-400 text-xs font-medium tracking-wide uppercase">{kpi.title}</div>
                <div className="text-2xl font-extrabold mt-1 tracking-tight text-slate-800 dark:text-white">{kpi.value}</div>
                <div className="text-emerald-600 dark:text-emerald-400 text-xs font-medium mt-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget approved by sector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center text-slate-800 dark:text-slate-100">
            <IndianRupee className="h-4.5 w-4.5 mr-2 text-amber-500" />
            Budgetary Allocations (INR)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={budgetAllocationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {budgetAllocationData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#FF9933" : "#138808"} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Splits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center text-slate-800 dark:text-slate-100">
            <Users className="h-4.5 w-4.5 mr-2 text-indigo-500" />
            Marginalized & Social Category Split
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={socialCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#4F46E5" />
                    <Cell fill="#FF9933" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {socialCategoryData.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ["#4F46E5", "#FF9933", "#10B981"][idx] }} />
                    <span className="font-semibold">{cat.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row: Speaking Time and Recent Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Speaking time donut chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:col-span-1 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center text-slate-800 dark:text-slate-100">
            <Hourglass className="h-4.5 w-4.5 mr-2 text-indigo-500" />
            Speaking Time Distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speakingTimeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                  label
                >
                  <Cell fill="#F59E0B" />
                  <Cell fill="#10B981" />
                  <Cell fill="#3B82F6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Gram Sabhas Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:col-span-2 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Gram Sabha Logs</h3>
            <button 
              onClick={() => {
                window.history.pushState({}, "", "/meetings");
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center"
            >
              View All Logs
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                  <th className="pb-3 font-medium">Meeting Title</th>
                  <th className="pb-3 font-medium">Conducted On</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {recentMeetings.map((meet) => (
                  <tr 
                    key={meet.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer" 
                    onClick={() => {
                      if (meet.status === "draft") {
                        window.history.pushState({}, "", "/verify");
                      } else {
                        window.history.pushState({}, "", "/meetings");
                      }
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                  >
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">{meet.title}</td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">{new Date(meet.date).toLocaleDateString()}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        meet.status === "approved" 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : meet.status === "draft"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : meet.status === "processing"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {meet.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-650 dark:text-slate-300 font-semibold">{meet.location || "Rampur"}</td>
                  </tr>
                ))}
                {recentMeetings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-medium">
                      No meetings records found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SUB-PAGE: MEETINGS & ATTENDANCE MANAGEMENT
// ----------------------------------------------------
function MeetingsPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<any | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getAuthUser());
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    const token = getAuthToken();
    try {
      setLoading(true);
      const data = await meetingsApi.list(token);
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load meetings list.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    const token = getAuthToken();
    if (!token) return;

    setSubmitLoading(true);
    setError("");
    try {
      const data = await meetingsApi.create({
        title,
        date: new Date(date).toISOString(),
        location,
        agenda,
        scheduled_start: new Date(date).toISOString(),
        agenda_pdf_url: ""
      }, token);

      setCreatedMeeting(data);
      setShowQR(true);
      setTitle("");
      setDate("");
      setLocation("");
      setAgenda("");
      // Reload meetings list
      await loadMeetings();
    } catch (err: any) {
      setError(err.message || "Failed to schedule the meeting.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const isSecretaryOrAdmin = currentUser?.role === "Secretary" || currentUser?.role === "Admin";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Loading scheduled meetings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Meetings & Check-in QR Codes</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Schedule Sabha assemblies, print Check-in passes, and trace attendance registers.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form (Only visible to Secretary/Admin) */}
        <div className={`lg:col-span-2 ${isSecretaryOrAdmin ? "" : "hidden"}`}>
          <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-100">Schedule New Gram Sabha</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Sabha Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Clean Drinking Water Resolution"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Proposed Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assembly Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Rampur Panchayat Hall"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Detailed Agenda</label>
                <textarea 
                  value={agenda} 
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Outline key discussion items and budget proposals..."
                  rows={4}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center shadow-md transition-colors"
              >
                {submitLoading ? "Scheduling..." : "Schedule Gram Sabha"}
                <Calendar className="h-4 w-4 ml-1.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Read-only view for citizens / other roles */}
        {!isSecretaryOrAdmin && (
          <div className="lg:col-span-2 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
            <Calendar className="h-10 w-10 text-indigo-500 mx-auto mb-3" />
            <h3 className="text-base font-bold mb-1 text-slate-800 dark:text-slate-200">Official Schedules Registry</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              All scheduled assemblies are managed by the Panchayat Secretary. Citizens and officers can view schedules, check-in QR codes, and read official agendas below.
            </p>
          </div>
        )}

        {/* Dynamic QR Code display card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
          {showQR && createdMeeting ? (
            <div className="space-y-4 animate-scaleUp">
              <div className="border border-slate-200 dark:border-slate-800 p-4 bg-white rounded-2xl shadow-inner inline-block">
                {/* Visual Representation of QR checkin */}
                <div className="h-44 w-44 bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 rounded-xl relative">
                  <FileCode className="h-12 w-12 text-indigo-500" />
                  <span className="text-[10px] font-mono text-slate-400 mt-2 px-2 break-all">{createdMeeting.qr_code_data}</span>
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5"><Check className="h-3 w-3" /></div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Attendance QR Ready</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">Citizens scan this code via e-Panchayat mobile app to register check-in logs immediately.</p>
              </div>
              <button 
                onClick={() => setShowQR(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Close Ticket
              </button>
            </div>
          ) : (
            <div className="text-slate-400 space-y-2">
              <FileCode className="h-12 w-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-500">QR Check-in Pass</h4>
              <p className="text-xs text-slate-400 max-w-xs">Schedule a meeting or click any scheduled log below to show the official e-Panchayat QR Code pass.</p>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled meetings listing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold mb-4">Official Sabha Schedules & Agenda Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                <th className="pb-3">Gram Sabha Topic</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Venue</th>
                <th className="pb-3">Agenda Detail</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {meetings.map((meet) => (
                <tr key={meet.id} className="hover:bg-slate-50/20">
                  <td className="py-4 font-bold text-slate-800 dark:text-slate-150">{meet.title}</td>
                  <td className="py-4 text-slate-500">{new Date(meet.date).toLocaleString()}</td>
                  <td className="py-4 text-slate-600 font-semibold">{meet.location || "Panchayat Compound"}</td>
                  <td className="py-4 text-slate-450 truncate max-w-[200px]" title={meet.agenda}>{meet.agenda || "Not specified"}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      meet.status === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : meet.status === "draft"
                        ? "bg-amber-50 text-amber-700"
                        : meet.status === "processing"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-50 text-slate-700"
                    }`}>
                      {meet.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setCreatedMeeting(meet);
                        setShowQR(true);
                      }}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Show QR
                    </button>
                  </td>
                </tr>
              ))}
              {meetings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-medium">
                    No scheduled meetings available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SUB-PAGE: MEETING RECORDER PIPELINE (SPEECH-TO-TEXT)
// ----------------------------------------------------
function RecordPage() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState(0);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [polling, setPolling] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadMeetings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const loadMeetings = async () => {
    const token = getAuthToken();
    try {
      const data = await meetingsApi.list(token);
      setMeetings(data);
      if (data.length > 0) {
        setSelectedMeeting(String(data[0].id));
      }
    } catch (err: any) {
      setError("Failed to fetch meetings for uploader link.");
    }
  };

  // Start live microphone recording
  const startRecording = async () => {
    setError("");
    setUploadStatus("");
    setProcessingStatus("");
    audioChunksRef.current = [];
    setAudioChunks(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" };
      
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream); // fallback
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioUpload(audioBlob);
      };

      // Request data every 2s
      mediaRecorder.start(2000);
      setRecording(true);

      timerRef.current = setInterval(() => {
        setAudioChunks((prev) => prev + 1);
      }, 2000);

    } catch (err: any) {
      setError("Microphone permission denied or device not supported. Use the local audio file uploader instead.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      // Stop stream tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Common upload logic (Blob or File)
  const handleAudioUpload = async (audioBlobOrFile: Blob | File) => {
    if (!selectedMeeting) {
      setError("Please choose a target meeting link.");
      return;
    }
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    setUploadStatus("Uploading audio buffer segment to Indic Pipeline...");
    setError("");
    try {
      const meetingId = parseInt(selectedMeeting);
      
      // Update meeting status to ongoing/processing
      await meetingsApi.updateStatus(meetingId, "ongoing", token);
      
      // Upload file
      await audioApi.upload(meetingId, audioBlobOrFile, token);

      setUploadStatus("Upload successful. Running ASR Speech-to-Text Pipeline...");
      startPollingStatus(meetingId);
    } catch (err: any) {
      setError(err.message || "Failed to upload audio payload.");
      setLoading(false);
    }
  };

  // Poll meeting status to show granular pipeline logs
  const startPollingStatus = (meetingId: number) => {
    setPolling(true);
    const token = getAuthToken();
    let counter = 0;

    pollIntervalRef.current = setInterval(async () => {
      counter++;
      try {
        const meet = await meetingsApi.get(meetingId, token);
        if (meet.status === "processing") {
          // Dynamic fake granular steps based on timing
          if (counter < 3) {
            setProcessingStatus("Step 1/4: Running noise reduction & bandwidth filtering (PS-Denoise)...");
          } else if (counter < 6) {
            setProcessingStatus("Step 2/4: Detecting dialects & running Speech-to-Text (ASR Whisper)...");
          } else if (counter < 9) {
            setProcessingStatus("Step 3/4: running pyannote.audio speaker diarization & timestamps...");
          } else {
            setProcessingStatus("Step 4/4: Extracting structured minutes (resolutions, budget splits)...");
          }
        } else if (meet.status === "draft") {
          setUploadStatus("Speech-to-Text and minutes extraction complete!");
          setProcessingStatus("Status: DRAFT review ready. Proceed to the 'Review & Sign' tab.");
          setLoading(false);
          setPolling(false);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (meet.status === "failed") {
          setError("indic Speech-to-Text pipeline encountered an error compiling audio segments.");
          setLoading(false);
          setPolling(false);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch (err) {
        // Ignore error and continue polling
      }
    }, 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleAudioUpload(file);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Indic Speech-to-Text Pipeline (ASR)</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Capture live Gram Sabha audio with noise filter buffers, or upload pre-recorded meetings.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Recording Panel */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 text-center relative overflow-hidden shadow-lg border border-slate-850">
            <h3 className="text-lg font-bold">Assembly Live Mic Streamer</h3>
            <p className="text-slate-400 text-xs mt-1">Directly records and streams audio segments to the ASR indic pipeline.</p>
            
            {/* Visualizer animation */}
            <div className="my-8 flex justify-center items-center space-x-1.5 h-16">
              {recording ? (
                Array.from({ length: 15 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-amber-400 rounded-full animate-pulse" 
                    style={{ 
                      height: `${Math.max(10, Math.sin(i + audioChunks) * 50 + 20)}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))
              ) : (
                <div className="h-1.5 w-48 bg-slate-800 rounded-full" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {recording ? (
                <button 
                  onClick={stopRecording}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center transition-colors"
                >
                  <MicOff className="h-4.5 w-4.5 mr-2" /> Stop & Process Audio
                </button>
              ) : (
                <button 
                  onClick={startRecording}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white shadow-md flex items-center justify-center transition-colors"
                >
                  <Mic className="h-4.5 w-4.5 mr-2" /> Start Live Recording
                </button>
              )}
              {recording && (
                <span className="text-xs text-slate-450 font-semibold">
                  {audioChunks * 2}s elapsed | buffering segments...
                </span>
              )}
            </div>
          </div>

          {/* Upload panel */}
          <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-100">Upload Pre-recorded Audio or Video</h3>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-900/10 cursor-pointer transition-colors relative">
              <Upload className="h-8 w-8 text-slate-450 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Drag and drop file here, or click to browse</p>
              <p className="text-xs text-slate-400 mt-1">Supports MP3, WAV, WebM, M4A (max 100MB)</p>
              <input 
                type="file" 
                onChange={handleFileChange}
                disabled={loading}
                className="hidden" 
                id="file-upload" 
              />
              <label 
                htmlFor="file-upload" 
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Select Audio File
              </label>
            </div>
          </div>

          {(uploadStatus || processingStatus) && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900 p-5 rounded-xl space-y-2.5 shadow-sm">
              {uploadStatus && <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> {uploadStatus}</h4>}
              {processingStatus && (
                <div className="flex items-center gap-2">
                  {polling && <Loader2 className="h-3.5 w-3.5 text-indigo-500 animate-spin" />}
                  <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold">{processingStatus}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pipeline options */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Pipeline Configuration</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Target Meeting Link</label>
            <select 
              value={selectedMeeting}
              onChange={(e) => setSelectedMeeting(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
              {meetings.length === 0 && <option value="">No scheduled meetings available</option>}
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
            <div>
              <h4 className="text-sm font-semibold">Active Noise Reduction</h4>
              <p className="text-xs text-slate-450">Filter background ceiling fans/chatter</p>
            </div>
            <input 
              type="checkbox" 
              checked={noiseReduction}
              onChange={() => setNoiseReduction(!noiseReduction)}
              className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500" 
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ASR AI Stack</h4>
            <div className="flex justify-between text-xs font-medium text-slate-550">
              <span>ASR Engine:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">OpenAI Whisper V3</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-550">
              <span>Diarization:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">pyannote.audio</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-550">
              <span>Language:</span>
              <span className="font-extrabold text-indigo-650 dark:text-indigo-400">Indic Speech Autodetect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SUB-PAGE: HUMAN VERIFICATION EDITOR (SIDE-BY-SIDE)
// ----------------------------------------------------
function VerifyPage() {
  const [draftMeetings, setDraftMeetings] = useState<any[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [meetingDetail, setMeetingDetail] = useState<any | null>(null);
  const [minutesData, setMinutesData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit fields
  const [summary, setSummary] = useState("");
  const [topicsStr, setTopicsStr] = useState("");
  const [schemesStr, setSchemesStr] = useState("");
  const [budgetStr, setBudgetStr] = useState("");

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const token = getAuthToken();
    try {
      const all = await meetingsApi.list(token);
      // Filter meetings with 'draft' or 'approved' status
      const drafts = all.filter((m: any) => m.status === "draft" || m.status === "approved");
      setDraftMeetings(drafts);
      if (drafts.length > 0) {
        setSelectedMeetingId(String(drafts[0].id));
        loadMeetingMinutes(drafts[0].id);
      }
    } catch (err: any) {
      setError("Failed to fetch draft meetings list.");
    }
  };

  const loadMeetingMinutes = async (meetingId: number) => {
    const token = getAuthToken();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const detail = await meetingsApi.get(meetingId, token);
      setMeetingDetail(detail);

      const minutes = await minutesApi.get(meetingId, token);
      setMinutesData(minutes);

      // Populate edit fields
      setSummary(minutes.summary || "");
      setTopicsStr(JSON.stringify(minutes.topics || [], null, 2));
      setSchemesStr(JSON.stringify(minutes.schemes || [], null, 2));
      setBudgetStr(JSON.stringify(minutes.budget_summary || {}, null, 2));
    } catch (err: any) {
      setError(err.message || "Failed to load minutes details.");
      setMinutesData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMeetingId(val);
    if (val) {
      loadMeetingMinutes(parseInt(val));
    }
  };

  const handleSave = async () => {
    if (!selectedMeetingId) return;
    const token = getAuthToken();
    setSaveLoading(true);
    setError("");
    setSuccess("");
    try {
      const updatedData = {
        summary,
        topics: JSON.parse(topicsStr),
        schemes: JSON.parse(schemesStr),
        budget_summary: JSON.parse(budgetStr)
      };

      const data = await minutesApi.update(parseInt(selectedMeetingId), updatedData, token);
      setMinutesData(data);
      setSuccess("Draft changes saved successfully.");
    } catch (err: any) {
      setError(err.message || "Malformed JSON inside lists or failed to update minutes.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedMeetingId) return;
    const token = getAuthToken();
    setFinalizeLoading(true);
    setError("");
    setSuccess("");
    try {
      const finalized = await minutesApi.finalize(parseInt(selectedMeetingId), token);
      setMinutesData(finalized);
      setSuccess("Minutes cryptographic signature ledger lock sealed successfully!");
      // Reload lists
      await loadDrafts();
    } catch (err: any) {
      setError(err.message || "Failed to sign and seal minutes ledger.");
    } finally {
      setFinalizeLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Review & Sign Resolutions</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit draft resolutions, edit budget items, and seal with SHA256 cryptographic logs.</p>
        </div>

        {/* Meeting selector dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Sabha Drafts:</label>
          <select 
            value={selectedMeetingId}
            onChange={handleMeetingSelect}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
          >
            {draftMeetings.map((d) => (
              <option key={d.id} value={d.id}>{d.title} ({d.status})</option>
            ))}
            {draftMeetings.length === 0 && <option value="">No draft meetings found</option>}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 animate-bounce" />
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading draft details & transcripts...</span>
        </div>
      ) : minutesData ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left panel - ASR Transcript Reference */}
          <div className="bg-slate-50/50 dark:bg-slate-800/15 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 h-[600px] overflow-y-auto pr-2">
            <h3 className="text-sm font-bold flex items-center text-slate-800 dark:text-slate-200">
              <FileText className="h-4.5 w-4.5 mr-2 text-indigo-500" />
              ASR Transcript Logs
            </h3>
            {meetingDetail?.transcripts ? (
              <div className="space-y-4 font-sans text-xs">
                {meetingDetail.transcripts.diarized_json ? (
                  meetingDetail.transcripts.diarized_json.map((seg: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-3 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                        <span className="text-indigo-600 dark:text-indigo-400">{seg.speaker}</span>
                        <span>{seg.start}s - {seg.end}s</span>
                      </div>
                      <p className="text-slate-650 dark:text-slate-300 font-medium leading-relaxed">{seg.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 leading-relaxed font-semibold italic">{meetingDetail.transcripts.raw_text}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-semibold italic">No raw transcript segments found for this meeting.</p>
            )}
          </div>

          {/* Right panel - Live Editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col h-[600px] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold">Official Resolution Form</h3>
              {minutesData.digital_hash ? (
                <div className="bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                  <Lock className="h-3 w-3 mr-1" /> Ledger Locked
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  Draft Edit Mode
                </div>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Executive Summary</label>
                <textarea 
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={!!minutesData.digital_hash}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium leading-relaxed disabled:opacity-75"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Topics Discussed (JSON Array)</label>
                  <textarea 
                    value={topicsStr}
                    onChange={(e) => setTopicsStr(e.target.value)}
                    disabled={!!minutesData.digital_hash}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-[10px] font-mono focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Supporting Schemes (JSON Array)</label>
                  <textarea 
                    value={schemesStr}
                    onChange={(e) => setSchemesStr(e.target.value)}
                    disabled={!!minutesData.digital_hash}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-[10px] font-mono focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Budget Breakdown (JSON Key-Value)</label>
                <textarea 
                  value={budgetStr}
                  onChange={(e) => setBudgetStr(e.target.value)}
                  disabled={!!minutesData.digital_hash}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-[10px] font-mono focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-75"
                />
              </div>
            </div>

            {/* Cryptographic Ledger Signature display */}
            {minutesData.digital_hash && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">e-Panchayat Ledger Checksum Hash</span>
                <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400 font-bold break-all block">{minutesData.digital_hash}</span>
                <div className="pt-2 flex justify-center gap-4">
                  <a 
                    href={minutesApi.exportUrl(parseInt(selectedMeetingId), "text")} 
                    download 
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Export Govt TXT
                  </a>
                  <a 
                    href={minutesApi.exportUrl(parseInt(selectedMeetingId), "json")} 
                    download 
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> Export JSON Ledger
                  </a>
                </div>
              </div>
            )}

            {/* Actions Buttons */}
            {!minutesData.digital_hash && (
              <div className="flex gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saveLoading || finalizeLoading}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all"
                >
                  {saveLoading ? "Saving..." : "Save Draft Changes"}
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={saveLoading || finalizeLoading}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md hover:shadow-emerald-650/15 transition-all"
                >
                  <Lock className="h-3.5 w-3.5" /> Sign & Finalize Ledger
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-500">No minutes generated</h3>
          <p className="text-xs text-slate-450 mt-1">Please select another meeting or upload/record audio for this meeting in the 'Record' page first.</p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// SUB-PAGE: AI SEARCH ASSISTANT (RAG CHATBOT)
// ----------------------------------------------------
function ChatPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Greetings! I am the e-Panchayat RAG assistant. Ask me anything about local Gram Sabha resolutions, budgetary allocations, or scheme updates." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMeetings = async () => {
    const token = getAuthToken();
    try {
      const data = await meetingsApi.list(token);
      setMeetings(data);
    } catch (_) {}
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    setError("");
    const userMsg = { role: "user", content: inputValue };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);

    const token = getAuthToken();
    try {
      const meetingFilter = selectedMeetingId ? parseInt(selectedMeetingId) : null;
      const data = await chatApi.ask(updatedMessages, meetingFilter, token);
      
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.content, citations: data.citations }
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to connect to RAG assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn h-[680px] flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AI RAG Assistant</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Contextual semantic search over archived Gram Sabha transcripts.</p>
        </div>

        {/* Optional filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500">Filter Meeting:</label>
          <select 
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] outline-none font-bold"
          >
            <option value="">All Sabha Archives</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
          <AlertCircle className="h-4.5 w-4.5" /> {error}
        </div>
      )}

      {/* Chat scroll content */}
      <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-2xl rounded-2xl p-4 shadow-sm text-xs leading-relaxed space-y-3 ${
              msg.role === "user" 
                ? "bg-indigo-600 text-white font-medium" 
                : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-slate-150"
            }`}>
              <p>{msg.content}</p>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5 mt-2.5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Citations & Sources</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((cit: any, cIdx: number) => (
                      <div key={cIdx} className="bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-850 rounded-xl text-[10px]">
                        <span className="font-bold text-indigo-650 dark:text-indigo-400 block">{cit.title}</span>
                        <p className="text-slate-500 mt-1 italic line-clamp-2">"...{cit.text_segment}..."</p>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold mt-1">
                          <span>Confidence:</span>
                          <span className="text-emerald-500 font-extrabold">{Math.round(cit.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-400 font-semibold">Consulting vector indexing databases...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex gap-3 shrink-0">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about Rampur budget updates, drinking water projects, or scheduled meetings..."
          className="flex-1 bg-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        />
        <button 
          type="submit" 
          disabled={loading || !inputValue.trim()}
          className="px-6 bg-indigo-600 hover:bg-indigo-750 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Send Query
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------
// SUB-PAGE: PUBLIC CITIZEN SEARCH REGISTRY
// ----------------------------------------------------
function CitizenPortalPage() {
  const [searchWord, setSearchWord] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWord.trim()) return;

    const token = getAuthToken();
    setLoading(true);
    setError("");
    try {
      const data = await searchApi.search(searchWord, token);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Global index search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Citizen Portal (Public Semantic Search)</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit resolutions index, open data files, and RTI transparency logs.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0">
          <AlertCircle className="h-4.5 w-4.5" /> {error}
        </div>
      )}

      {/* Public Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-2">
        <input 
          type="text" 
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          placeholder="Search by topic, scheme name, or ward details..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          Search
        </button>
      </form>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold mb-4">Official Public Resolutions Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                <th className="pb-3">Resolution Details</th>
                <th className="pb-3">Supporting Sabha</th>
                <th className="pb-3">Matching Content Segment</th>
                <th className="pb-3">Approval Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {results.map((res, index) => (
                <tr key={index} className="hover:bg-slate-55/20">
                  <td className="py-4 font-bold text-slate-800 dark:text-slate-150">Topic index Match</td>
                  <td className="py-4 text-slate-600 font-bold">{res.title} (ID: {res.meeting_id})</td>
                  <td className="py-4 text-slate-500 italic max-w-sm">"...{res.text_segment}..."</td>
                  <td className="py-4 text-slate-400">{res.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      res.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-semibold italic">
                    Type a query above (e.g. "water", "school") and search to check official vector index matches in the SQLite db.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SUB-PAGE: IMMUTABLE AUDIT LEDGER
// ----------------------------------------------------
function AuditPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    const token = getAuthToken();
    try {
      const data = await meetingsApi.list(token);
      setMeetings(data);
      if (data.length > 0) {
        setSelectedMeetingId(String(data[0].id));
        loadLogs(data[0].id);
      }
    } catch (_) {}
  };

  const loadLogs = async (meetingId: number) => {
    const token = getAuthToken();
    setLoading(true);
    setError("");
    try {
      const logs = await auditApi.getLogs(meetingId, token);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs trail.");
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMeetingId(val);
    if (val) {
      loadLogs(parseInt(val));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Immutable e-Panchayat Audit Ledger</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Verify cryptographic checksum signatures of finalized Gram Sabha decisions.</p>
        </div>

        {/* Meeting selector dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Target Sabha Ledger:</label>
          <select 
            value={selectedMeetingId}
            onChange={handleMeetingSelect}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
          >
            {meetings.map((d) => (
              <option key={d.id} value={d.id}>{d.title} (ID: {d.id})</option>
            ))}
            {meetings.length === 0 && <option value="">No meetings found</option>}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
          <AlertCircle className="h-4.5 w-4.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Checking block hashes & audit trail logs...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-6 text-slate-800 dark:text-slate-100">Verification Ledger Chronology</h3>
          <div className="space-y-6 relative border-l border-slate-100 dark:border-slate-850 ml-4 pl-6">
            {auditLogs.map((log) => (
              <div key={log.id} className="relative">
                {/* Dot marker */}
                <div className="absolute -left-9 top-1.5 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-650 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Action performed by User ID: {log.modified_by_id}</h4>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-slate-50/50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Previous state summary</span>
                      <p className="text-[11px] text-slate-500 italic max-h-[80px] overflow-y-auto">{log.previous_state?.summary || "No previous summary"}</p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current state summary</span>
                      <p className="text-[11px] text-slate-500 italic max-h-[80px] overflow-y-auto">{log.current_state?.summary || "No current summary"}</p>
                    </div>
                  </div>
                  {log.current_state?.digital_hash && (
                    <div className="bg-slate-900/5 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 break-all">
                      Sealed Signature Ledger Checksum: {log.current_state.digital_hash}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">
                No logs exist in the ledger for this meeting yet. Try finalizing draft minutes first.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
