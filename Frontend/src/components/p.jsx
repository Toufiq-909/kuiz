import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QuizApp = () => {
  const API_BASE = "http://localhost:5000/api";

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [pendingQuiz, setPendingQuiz] = useState(null);
  const [userName, setUserName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const getAllQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/quizzes`);
      if (!res.ok) throw new Error("Failed to fetch quizzes");

      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      const formatted = data.map((quiz) => ({
        id: quiz.qid,
        title: quiz.title || `Quiz ${quiz.qid.substring(0, 8)}`,
        desc: `${quiz.total_questions || 0} questions`,
        questions: quiz.total_questions || 0,
        difficulty: quiz.difficulty || "Easy",
        hasCode: !!quiz.code,
        icon: quiz.difficulty === "hard" ? "🔥" : quiz.difficulty === "medium" ? "⚡" : "📘",
      }));

      setQuizzes(formatted);
    } catch (err) {
      console.warn("⚠️ Error fetching quizzes:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quiz) => {
    if (quiz.hasCode) {
      setPendingQuiz(quiz);
      setQuizCode("");
      setShowCodeModal(true);
    } else {
      startQuiz(quiz.id);
    }
  };

  const verifyCodeAndStart = async () => {
    if (!quizCode.trim()) {
      setError("Please enter the quiz code");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/quizzes/${pendingQuiz.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: quizCode }),
      });

      const data = await res.json();

      if (data.verified) {
        setShowCodeModal(false);
        setError(null);
        startQuiz(pendingQuiz.id);
      } else {
        setError("Invalid quiz code. Please try again.");
      }
    } catch (err) {
      setError("Failed to verify code: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/quizzes/${quizId}`);
      if (!res.ok) throw new Error("Failed to fetch quiz questions");

      let data = await res.json();
      console.log("📥 Raw questions data:", data);

      const transformedQuestions = data.map((q) => {
        const questionId = typeof q.id === "object" ? JSON.stringify(q.id) : String(q.id);

        return {
          id: questionId,
          question: q.question,
          options: Array.isArray(q.options) && q.options.length > 0 ? q.options : [],
          question_type: q.question_type || "MCQ",
          Ans: q.Ans,
          explanation: q.explanation,
          difficulty: q.difficulty,
        };
      });

      if (transformedQuestions.length === 0) {
        throw new Error("No questions found for this quiz");
      }

      setQuestions(transformedQuestions);
      setSelectedQuiz(quizId);
      setAnswers({});
      setSubmitted(false);
      setQuizResult(null);
    } catch (err) {
      console.error("❌ Error loading questions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    setShowNameModal(true);
  };

  const submitQuiz = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/quizzes/${selectedQuiz}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, userName }),
      });
      const result = await res.json();
      console.log("✅ Quiz submitted:", result);
      setQuizResult(result);
      setShowNameModal(false);
    } catch (err) {
      console.error("❌ Failed to submit quiz:", err);
      setError("Failed to submit quiz: " + err.message);
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllQuizzes();
  }, []);

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const difficultyColors = {
    Easy: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    easy: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    Medium: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    medium: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    Hard: "from-red-500/20 to-pink-500/20 border-red-500/30",
    hard: "from-red-500/20 to-pink-500/20 border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100 p-4 sm:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        {loading && !showCodeModal && !showNameModal && (
          <div className="text-center py-20 text-blue-400 animate-pulse text-lg">
            Loading...
          </div>
        )}

        {/* Code Verification Modal */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">🔐 Enter Quiz Code</h2>
              <p className="text-gray-400 mb-6">This quiz requires a code to access.</p>
              <input
                type="text"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && verifyCodeAndStart()}
                placeholder="Enter code..."
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setError(null);
                  }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyCodeAndStart}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Continue"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Name Input Modal */}
        {showNameModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">👤 Enter Your Name</h2>
              <p className="text-gray-400 mb-6">Your results will be saved with this name.</p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && submitQuiz()}
                placeholder="Your name..."
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNameModal(false);
                    setError(null);
                  }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Quiz"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {!loading && !showCodeModal && !showNameModal && (
          <AnimatePresence mode="wait">
            {!selectedQuiz ? (
              <motion.div
                key="quizList"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    QuizMaster
                  </h1>
                  <p className="text-gray-400 text-lg">Challenge yourself with interactive quizzes</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      onClick={() => handleQuizClick(quiz)}
                      className={`relative p-6 bg-gradient-to-br ${difficultyColors[quiz.difficulty]} backdrop-blur-sm rounded-2xl cursor-pointer border transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group overflow-hidden`}
                    >
                      {quiz.hasCode && (
                        <div className="absolute top-3 right-3 text-xl">🔒</div>
                      )}
                      <div className="text-5xl mb-4">{quiz.icon}</div>
                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {quiz.title}
                      </h2>
                      <p className="text-gray-400 text-sm mb-4">{quiz.desc}</p>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">{quiz.difficulty}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="quizQuestions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => {
                      setSelectedQuiz(null);
                      setSubmitted(false);
                      setQuizResult(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 transition-all border border-slate-700/50 hover:border-slate-600"
                  >
                    ← Back
                  </button>
                  {!submitted && (
                    <div className="text-sm text-gray-400">
                      {Object.keys(answers).length} / {questions.length} answered
                    </div>
                  )}
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">No questions available for this quiz</div>
                ) : submitted && quizResult ? (
                  <div className="space-y-6">
                    {/* Score Summary */}
                    <div className="p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 text-center">
                      <h3 className="text-3xl font-bold text-green-400 mb-4">🎉 Quiz Completed!</h3>
                      <div className="text-6xl font-bold text-white mb-4">{quizResult.percentage}%</div>
                      <p className="text-xl text-gray-300 mb-2">
                        {quizResult.score} out of {quizResult.total} correct
                      </p>
                      <p className="text-gray-400 mb-6">{quizResult.message}</p>
                      <button
                        onClick={() => {
                          setSelectedQuiz(null);
                          setSubmitted(false);
                          setQuizResult(null);
                        }}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-semibold transition-all"
                      >
                        Back to Quizzes
                      </button>
                    </div>

                    {/* Answer Review */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white mb-4">📝 Review Your Answers</h3>
                      {questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer && userAnswer.trim().toLowerCase() === q.Ans.trim().toLowerCase();
                        
                        return (
                          <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-6 rounded-2xl border ${
                              isCorrect
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-red-500/10 border-red-500/30"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl mt-1">{isCorrect ? "✅" : "❌"}</span>
                              <div className="flex-1">
                                <p className="font-semibold text-lg text-gray-100 mb-3">
                                  {index + 1}. {q.question}
                                </p>
                                
                                <div className="space-y-2 text-sm mb-3">
                                  <div>
                                    <span className="text-gray-400">Your answer: </span>
                                    <span className={isCorrect ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                                      {userAnswer || "(Not answered)"}
                                    </span>
                                  </div>
                                  
                                  {!isCorrect && (
                                    <div>
                                      <span className="text-gray-400">Correct answer: </span>
                                      <span className="text-green-400 font-medium">{q.Ans}</span>
                                    </div>
                                  )}
                                </div>

                                {q.explanation && (
                                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                    <p className="text-xs text-gray-400 mb-1">💡 Explanation:</p>
                                    <p className="text-sm text-gray-300">{q.explanation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {questions.map((q, index) => (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <p className="font-semibold text-lg text-gray-100 flex-1">
                              {index + 1}. {q.question}
                            </p>
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-gray-400 ml-4">
                              {q.question_type}
                            </span>
                          </div>

                          {q.question_type === "fill in the blanks" || q.question_type === "Fill in the Blanks" || q.options.length === 0 ? (
                            <input
                              type="text"
                              value={answers[q.id] || ""}
                              onChange={(e) => handleAnswer(q.id, e.target.value)}
                              placeholder="Type your answer..."
                              className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          ) : (
                            <div className="space-y-2">
                              {q.options.map((opt) => (
                                <motion.label
                                  key={opt}
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  className={`flex items-center space-x-3 cursor-pointer rounded-xl p-4 transition-all duration-200 ${
                                    answers[q.id] === opt
                                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                                      : "bg-slate-800/30 hover:bg-slate-700/50 text-gray-300 border border-slate-700/30"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={() => handleAnswer(q.id, opt)}
                                    className="hidden"
                                  />
                                  <span className="flex-1 font-medium">{opt}</span>
                                </motion.label>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitClick}
                      className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 border border-blue-500/50"
                    >
                      Submit Quiz 🚀
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default QuizApp;