import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
const api3=import.meta.env.VITE_API_PA;

const QuizAnalytics = () => {
  const API_BASE = api3+"/api";

  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [participatedQuizzes, setParticipatedQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userPerformance, setUserPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleLogin = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's participated quizzes
      const res = await fetch(`${API_BASE}/analytics/user/${encodeURIComponent(userName)}`);
      if (!res.ok) throw new Error("Failed to fetch your quiz history");

      const data = await res.json();
      
      if (data.length === 0) {
        setError("No quiz attempts found for this name. Please take a quiz first!");
        return;
      }

      setParticipatedQuizzes(data);
      setIsLoggedIn(true);

      // Fetch user performance overview
      const perfRes = await fetch(`${API_BASE}/analytics/user/${encodeURIComponent(userName)}/performance`);
      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setUserPerformance(perfData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizAnalytics = async (qid) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch detailed analytics
      const analyticsRes = await fetch(`${API_BASE}/analytics/quiz/${qid}/user/${encodeURIComponent(userName)}`);
      if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");
      const analyticsData = await analyticsRes.json();
      setQuizAnalytics(analyticsData);

      // Fetch leaderboard
      const leaderRes = await fetch(`${API_BASE}/analytics/leaderboard/${qid}?limit=20`);
      if (leaderRes.ok) {
        const leaderData = await leaderRes.json();
        setLeaderboard(leaderData.leaderboard);
      }

      setSelectedQuiz(qid);
      setActiveTab("overview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreDistributionData = quizAnalytics?.scoreDistribution
    ? Object.entries(quizAnalytics.scoreDistribution).map(([range, count]) => ({
        range,
        count
      }))
    : [];

  const performanceChartData = userPerformance?.performanceData?.map((item, index) => ({
    name: item.quizTitle.substring(0, 15) + "...",
    score: item.percentage,
    attempt: index + 1
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100 p-4 sm:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-20"
          >
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">
                Quiz Analytics
              </h1>
              <p className="text-gray-400 text-center mb-8">Enter your name to view your performance</p>
              
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your name..."
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-4"
                autoFocus
              />
              
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              >
                {loading ? "Loading..." : "View Analytics"}
              </button>
            </div>
          </motion.div>
        ) : !selectedQuiz ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Welcome, {userName}! 👋
                </h1>
                <p className="text-gray-400">View your quiz performance and rankings</p>
              </div>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setUserName("");
                  setParticipatedQuizzes([]);
                  setUserPerformance(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-all"
              >
                Logout
              </button>
            </div>

            {/* Overall Performance Stats */}
            {userPerformance && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 rounded-2xl">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-3xl font-bold text-white">{userPerformance.totalQuizzesTaken}</div>
                  <div className="text-sm text-gray-400">Quizzes Taken</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 rounded-2xl">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-3xl font-bold text-white">{userPerformance.averagePercentage}%</div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 p-6 rounded-2xl">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-3xl font-bold text-white">{userPerformance.bestScore}%</div>
                  <div className="text-sm text-gray-400">Best Score</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 p-6 rounded-2xl">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-3xl font-bold text-white">{userPerformance.totalAttempts}</div>
                  <div className="text-sm text-gray-400">Total Attempts</div>
                </div>
              </div>
            )}

            {/* Performance Over Time Chart */}
            {performanceChartData.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">📈 Performance Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} name="Score %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Participated Quizzes List */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">📚 Your Quiz History</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {participatedQuizzes.map((quiz, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => loadQuizAnalytics(quiz.qid)}
                    className="p-5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700 hover:border-slate-600 cursor-pointer transition-all"
                  >
                    <h3 className="text-lg font-bold text-white mb-2">{quiz.quizTitle}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Score:</span>
                      <span className={`text-lg font-bold ${quiz.percentage >= 70 ? 'text-green-400' : quiz.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {quiz.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{quiz.score}/{quiz.total} correct</span>
                      <span>{new Date(quiz.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-all"
              >
                ← Back to All Quizzes
              </button>
              <h1 className="text-2xl font-bold text-white">{quizAnalytics?.quizInfo?.title}</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {["overview", "leaderboard", "attempts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "overview" && quizAnalytics && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 rounded-2xl">
                    <div className="text-3xl mb-2">🏅</div>
                    <div className="text-3xl font-bold text-white">#{quizAnalytics.userRank}</div>
                    <div className="text-sm text-gray-400">Your Rank</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 rounded-2xl">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-3xl font-bold text-white">{quizAnalytics.totalParticipants}</div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 p-6 rounded-2xl">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-3xl font-bold text-white">{quizAnalytics.averageScore}%</div>
                    <div className="text-sm text-gray-400">Average Score</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 p-6 rounded-2xl">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-3xl font-bold text-white">{quizAnalytics.userAttempts.length}</div>
                    <div className="text-sm text-gray-400">Your Attempts</div>
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6">📊 Score Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Performers */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-6">🏆 Top 5 Performers</h2>
                  <div className="space-y-3">
                    {quizAnalytics.topPerformers.slice(0, 5).map((performer, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          performer.userName === userName
                            ? "bg-purple-500/20 border border-purple-500/30"
                            : "bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <span className="text-white font-medium">{performer.userName}</span>
                          {performer.userName === userName && (
                            <span className="text-xs px-2 py-1 bg-purple-500/50 rounded-full">You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-sm">{performer.score}/{performer.total}</span>
                          <span className="text-lg font-bold text-green-400">{performer.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">🏆 Full Leaderboard</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-gray-400 font-semibold">Rank</th>
                        <th className="text-left p-3 text-gray-400 font-semibold">Name</th>
                        <th className="text-right p-3 text-gray-400 font-semibold">Score</th>
                        <th className="text-right p-3 text-gray-400 font-semibold">Percentage</th>
                        <th className="text-right p-3 text-gray-400 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`border-b border-slate-800 ${
                            entry.userName === userName ? "bg-purple-500/10" : ""
                          }`}
                        >
                          <td className="p-3">
                            <span className={`font-bold ${
                              entry.rank === 1 ? "text-yellow-400" :
                              entry.rank === 2 ? "text-gray-300" :
                              entry.rank === 3 ? "text-orange-400" :
                              "text-gray-400"
                            }`}>
                              #{entry.rank}
                            </span>
                          </td>
                          <td className="p-3 text-white">{entry.userName}</td>
                          <td className="p-3 text-right text-gray-300">{entry.score}/{entry.total}</td>
                          <td className="p-3 text-right">
                            <span className={`font-bold ${
                              entry.percentage >= 80 ? "text-green-400" :
                              entry.percentage >= 60 ? "text-blue-400" :
                              entry.percentage >= 40 ? "text-yellow-400" :
                              "text-red-400"
                            }`}>
                              {entry.percentage}%
                            </span>
                          </td>
                          <td className="p-3 text-right text-gray-400 text-sm">
                            {new Date(entry.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "attempts" && quizAnalytics && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">📝 Your Attempts</h2>
                <div className="space-y-4">
                  {quizAnalytics.userAttempts.map((attempt, index) => (
                    <div
                      key={index}
                      className="p-5 bg-slate-800/50 rounded-xl border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400">Attempt #{quizAnalytics.userAttempts.length - index}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(attempt.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 text-sm">Score: </span>
                          <span className="text-white font-medium">{attempt.score}/{attempt.total}</span>
                        </div>
                        <div className={`text-2xl font-bold ${
                          attempt.percentage >= 70 ? "text-green-400" :
                          attempt.percentage >= 50 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {attempt.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizAnalytics;