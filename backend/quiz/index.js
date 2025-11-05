const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 🌐 SurrealDB Cloud Config
const SURREAL_URL = "https://jolly-island-06ck5mr7vdo0ndagnhlbpobvgc.aws-use1.surreal.cloud/sql";
const USERNAME = "me";
const PASSWORD = "1234";
const NAMESPACE = "kuiz";
const DATABASE = "kuiz_db";

// 🔧 Helper: Query SurrealDB Cloud
async function surrealQuery(query) {
  try {
    console.log("🔍 Executing query:", query);
    
    const token = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    
    const res = await axios.post(SURREAL_URL, query, {
      headers: {
        'Authorization': `Basic ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
        'NS': NAMESPACE,
        'DB': DATABASE,
        'surreal-ns': NAMESPACE,
        'surreal-db': DATABASE
      }
    });

    console.log("📥 Raw response:", JSON.stringify(res.data, null, 2));

    if (res.data?.[0]?.status === 'ERR') {
      throw new Error(res.data[0].result || 'Database query failed');
    }

    const result = res.data?.[0]?.result || [];
    console.log("✅ Parsed result count:", Array.isArray(result) ? result.length : 'N/A');
    return result;
  } catch (err) {
    console.error("❌ SurrealDB Error:", err.response?.data || err.message);
    throw new Error(err.message || "Database query failed");
  }
}

// Test connection on startup
async function testConnection() {
  try {
    console.log("\n🔌 Testing SurrealDB connection...");
    console.log(`   URL: ${SURREAL_URL}`);
    console.log(`   Namespace: ${NAMESPACE}`);
    console.log(`   Database: ${DATABASE}`);
    
    const sampleResult = await surrealQuery("SELECT * FROM Question LIMIT 1;");
    console.log("✅ Connection successful!");
    console.log("📄 Sample record:", JSON.stringify(sampleResult, null, 2));
    
    const countResult = await surrealQuery("SELECT count() AS total FROM Question GROUP ALL;");
    console.log("📊 Total questions:", countResult[0]?.total || 0);
    
  } catch (err) {
    console.error("❌ Connection test failed:", err.message);
  }
}

// 🧠 1️⃣ Get all available quizzes (with title, code, etc.)
app.get("/api/quizzes", async (req, res) => {
  try {
    // Simple query - get one question per qid to extract title and code
    const query = `
      SELECT qid, title, code, difficulty, count() AS total_questions
      FROM Question
      GROUP BY qid, title, code, difficulty;
    `;

    const results = await surrealQuery(query);
    console.log("📊 Raw quiz data:", results);
    
    const quizMap = new Map();
    
    results.forEach(item => {
      if (!quizMap.has(item.qid)) {
        quizMap.set(item.qid, {
          qid: item.qid,
          title: item.title || `Quiz ${item.qid.substring(0, 8)}`,
          code: item.code || null,
          difficulty: item.difficulty,
          total_questions: item.total_questions
        });
      } else {
        const existing = quizMap.get(item.qid);
        existing.total_questions += item.total_questions;
      }
    });
    
    const quizzes = Array.from(quizMap.values());
    console.log("📊 Processed quizzes:", quizzes.length);
    res.json(quizzes);
  } catch (err) {
    console.error("❌ Failed to fetch quizzes:", err.message);
    res.status(500).json({ error: "Failed to fetch quizzes", details: err.message });
  }
});

// 🔐 2️⃣ Verify quiz code before showing questions
app.post("/api/quizzes/:qid/verify", async (req, res) => {
  try {
    const { qid } = req.params;
    const { code } = req.body;

    console.log("🔐 Verifying code for qid:", qid);
    
    // Get the quiz code from any question with this qid
    const query = `SELECT code FROM Question WHERE qid = "${qid}" LIMIT 1;`;
    const result = await surrealQuery(query);
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const correctCode = result[0].code;
    
    // If no code is set, allow access
    if (!correctCode) {
      return res.json({ verified: true });
    }

    // Check if provided code matches
    if (code && code.trim() === correctCode.trim()) {
      res.json({ verified: true });
    } else {
      res.status(403).json({ verified: false, error: "Invalid quiz code" });
    }
  } catch (err) {
    console.error("❌ Failed to verify code:", err.message);
    res.status(500).json({ error: "Failed to verify code", details: err.message });
  }
});

// 🧩 3️⃣ Get all questions for a specific quiz (after code verification)
app.get("/api/quizzes/:qid", async (req, res) => {
  try {
    const { qid } = req.params;
    console.log("🎯 Fetching questions for qid:", qid);
    
    const query = `SELECT * FROM Question WHERE qid = "${qid}" ORDER BY set ASC;`;
    
    const questions = await surrealQuery(query);
    
    console.log(`📝 Found ${questions.length} questions for qid: ${qid}`);
    
    if (questions.length > 0) {
      console.log("📄 Sample question:", JSON.stringify(questions[0], null, 2));
    }
    
    const transformedQuestions = questions.map(q => ({
      id: q.id,
      qid: q.qid,
      set: q.set,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      Ans: q.Ans,
      explanation: q.explanation,
      difficulty: q.difficulty,
      question_type: q.question_type || 'MCQ'
    }));
    
    res.json(transformedQuestions);
  } catch (err) {
    console.error("❌ Failed to fetch quiz questions:", err.message);
    res.status(500).json({ error: "Failed to fetch quiz questions", details: err.message });
  }
});

// 🚀 4️⃣ Submit quiz answers and store results in database
app.post("/api/quizzes/:qid/submit", async (req, res) => {
  try {
    const { qid } = req.params;
    const { answers, userName } = req.body;

    console.log("📤 Submitting answers for qid:", qid);
    console.log("👤 User:", userName || "Anonymous");
    console.log("📝 Answers received:", answers);

    const query = `SELECT id, Ans FROM Question WHERE qid = "${qid}";`;
    const correctAnswers = await surrealQuery(query);

    let score = 0;
    const total = correctAnswers.length;
    const results = [];

    correctAnswers.forEach((q) => {
      let questionId;
      if (typeof q.id === 'string') {
        questionId = q.id;
      } else if (typeof q.id === 'object') {
        questionId = q.id.id ? `Question:${q.id.id}` : JSON.stringify(q.id);
      } else {
        questionId = String(q.id);
      }
      
      const userAns = answers[questionId];
      const isCorrect = userAns && userAns.trim().toLowerCase() === q.Ans.trim().toLowerCase();
      
      if (isCorrect) {
        score++;
      }

      results.push({
        questionId,
        userAnswer: userAns,
        correctAnswer: q.Ans,
        isCorrect
      });
    });

    const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : 0;

    // Store the result in the database
    const timestamp = new Date().toISOString();
    const resultRecord = {
      qid: qid,
      userName: userName || "Anonymous",
      score: score,
      total: total,
      percentage: parseFloat(percentage),
      answers: JSON.stringify(answers),
      results: JSON.stringify(results),
      submittedAt: timestamp
    };

    // Create result record in Result table
    const createResultQuery = `
      CREATE Result CONTENT ${JSON.stringify(resultRecord)};
    `;
    
    try {
      await surrealQuery(createResultQuery);
      console.log("✅ Result stored in database");
    } catch (dbErr) {
      console.error("⚠️ Failed to store result in DB:", dbErr.message);
    }

    const response = {
      score,
      total,
      percentage,
      message: `You got ${score} out of ${total} correct!`,
      results
    };

    console.log("✅ Quiz results:", response);
    res.json(response);

  } catch (err) {
    console.error("❌ Failed to submit quiz:", err.message);
    res.status(500).json({ error: "Failed to submit quiz", details: err.message });
  }
});

// 📊 5️⃣ Get quiz results/leaderboard
app.get("/api/quizzes/:qid/results", async (req, res) => {
  try {
    const { qid } = req.params;
    
    const query = `
      SELECT userName, score, total, percentage, submittedAt 
      FROM Result 
      WHERE qid = "${qid}" 
      ORDER BY percentage DESC, submittedAt ASC;
    `;
    
    const results = await surrealQuery(query);
    res.json(results);
  } catch (err) {
    console.error("❌ Failed to fetch results:", err.message);
    res.status(500).json({ error: "Failed to fetch results", details: err.message });
  }
});

// 🏥 Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    config: {
      namespace: NAMESPACE,
      database: DATABASE,
      url: SURREAL_URL
    }
  });
});

// 🔍 Debug endpoint
app.get("/api/debug/tables", async (req, res) => {
  try {
    const questions = await surrealQuery("SELECT * FROM Question LIMIT 3;");
    const qids = await surrealQuery("SELECT qid FROM Question GROUP BY qid;");
    const results = await surrealQuery("SELECT * FROM Result LIMIT 5;");
    
    res.json({
      sampleQuestions: questions,
      uniqueQuizIds: qids,
      sampleResults: results
    });
  } catch (err) {
    console.error("❌ Debug failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add these new endpoints to your existing backend (index.js)

// 📊 1️⃣ Get user's participated quizzes
app.get("/api/analytics/user/:userName", async (req, res) => {
  try {
    const { userName } = req.params;
    
    const query = `
      SELECT qid, userName, score, total, percentage, submittedAt
      FROM Result
      WHERE userName = "${userName}"
      ORDER BY submittedAt DESC;
    `;
    
    const results = await surrealQuery(query);
    
    // Get quiz titles for each result
    const enrichedResults = [];
    for (const result of results) {
      const quizQuery = `SELECT title FROM Question WHERE qid = "${result.qid}" LIMIT 1;`;
      const quizData = await surrealQuery(quizQuery);
      
      enrichedResults.push({
        ...result,
        quizTitle: quizData[0]?.title || "Unknown Quiz"
      });
    }
    
    res.json(enrichedResults);
  } catch (err) {
    console.error("❌ Failed to fetch user results:", err.message);
    res.status(500).json({ error: "Failed to fetch user results", details: err.message });
  }
});

// 📊 2️⃣ Get detailed analytics for a specific quiz and user
app.get("/api/analytics/quiz/:qid/user/:userName", async (req, res) => {
  try {
    const { qid, userName } = req.params;
    
    // Get user's attempts for this quiz
    const userAttemptsQuery = `
      SELECT score, total, percentage, submittedAt, answers, results
      FROM Result
      WHERE qid = "${qid}" AND userName = "${userName}"
      ORDER BY submittedAt DESC;
    `;
    const userAttempts = await surrealQuery(userAttemptsQuery);
    
    // Get all attempts for ranking
    const allAttemptsQuery = `
      SELECT userName, score, total, percentage, submittedAt
      FROM Result
      WHERE qid = "${qid}"
      ORDER BY percentage DESC, submittedAt ASC;
    `;
    const allAttempts = await surrealQuery(allAttemptsQuery);
    
    // Calculate user's rank
    let userRank = 0;
    if (userAttempts.length > 0) {
      const userBestScore = Math.max(...userAttempts.map(a => a.percentage));
      userRank = allAttempts.findIndex(a => 
        a.userName === userName && a.percentage === userBestScore
      ) + 1;
    }
    
    // Get quiz info
    const quizQuery = `SELECT title, difficulty FROM Question WHERE qid = "${qid}" LIMIT 1;`;
    const quizInfo = await surrealQuery(quizQuery);
    
    // Calculate statistics
    const totalParticipants = new Set(allAttempts.map(a => a.userName)).size;
    const averageScore = allAttempts.length > 0 
      ? (allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length).toFixed(2)
      : 0;
    
    // Score distribution
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };
    
    allAttempts.forEach(attempt => {
      const score = attempt.percentage;
      if (score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });
    
    // Top performers
    const topPerformers = allAttempts.slice(0, 10);
    
    res.json({
      quizInfo: quizInfo[0] || {},
      userAttempts,
      userRank,
      totalParticipants,
      averageScore: parseFloat(averageScore),
      scoreDistribution: scoreRanges,
      topPerformers,
      totalAttempts: allAttempts.length
    });
  } catch (err) {
    console.error("❌ Failed to fetch quiz analytics:", err.message);
    res.status(500).json({ error: "Failed to fetch quiz analytics", details: err.message });
  }
});

// 📊 3️⃣ Get leaderboard for a specific quiz
app.get("/api/analytics/leaderboard/:qid", async (req, res) => {
  try {
    const { qid } = req.params;
    const limit = req.query.limit || 50;
    
    const query = `
      SELECT userName, score, total, percentage, submittedAt
      FROM Result
      WHERE qid = "${qid}"
      ORDER BY percentage DESC, submittedAt ASC
      LIMIT ${limit};
    `;
    
    const leaderboard = await surrealQuery(query);
    
    // Get quiz title
    const quizQuery = `SELECT title FROM Question WHERE qid = "${qid}" LIMIT 1;`;
    const quizInfo = await surrealQuery(quizQuery);
    
    res.json({
      quizTitle: quizInfo[0]?.title || "Quiz",
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry
      }))
    });
  } catch (err) {
    console.error("❌ Failed to fetch leaderboard:", err.message);
    res.status(500).json({ error: "Failed to fetch leaderboard", details: err.message });
  }
});

// 📊 4️⃣ Get overall statistics for all quizzes
app.get("/api/analytics/overview", async (req, res) => {
  try {
    // Get all quizzes
    const quizzesQuery = `
      SELECT qid, title, difficulty, count() AS total_questions
      FROM Question
      GROUP BY qid, title, difficulty;
    `;
    const quizzes = await surrealQuery(quizzesQuery);
    
    // Get participation stats for each quiz
    const quizStats = [];
    for (const quiz of quizzes) {
      const statsQuery = `
        SELECT count() AS attempts, 
               array::group(userName) AS participants
        FROM Result
        WHERE qid = "${quiz.qid}"
        GROUP ALL;
      `;
      const stats = await surrealQuery(statsQuery);
      
      const uniqueParticipants = stats[0]?.participants 
        ? new Set(stats[0].participants).size 
        : 0;
      
      quizStats.push({
        qid: quiz.qid,
        title: quiz.title,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.total_questions,
        totalAttempts: stats[0]?.attempts || 0,
        uniqueParticipants
      });
    }
    
    res.json(quizStats);
  } catch (err) {
    console.error("❌ Failed to fetch overview:", err.message);
    res.status(500).json({ error: "Failed to fetch overview", details: err.message });
  }
});

// 📊 5️⃣ Get user's performance comparison across all quizzes
app.get("/api/analytics/user/:userName/performance", async (req, res) => {
  try {
    const { userName } = req.params;
    
    const query = `
      SELECT qid, score, total, percentage, submittedAt
      FROM Result
      WHERE userName = "${userName}"
      ORDER BY submittedAt ASC;
    `;
    
    const results = await surrealQuery(query);
    
    // Get quiz titles
    const performanceData = [];
    for (const result of results) {
      const quizQuery = `SELECT title FROM Question WHERE qid = "${result.qid}" LIMIT 1;`;
      const quizData = await surrealQuery(quizQuery);
      
      performanceData.push({
        quizTitle: quizData[0]?.title || "Unknown",
        percentage: result.percentage,
        score: result.score,
        total: result.total,
        date: result.submittedAt
      });
    }
    
    // Calculate overall stats
    const totalQuizzesTaken = new Set(results.map(r => r.qid)).size;
    const averagePercentage = results.length > 0
      ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2)
      : 0;
    const bestScore = results.length > 0
      ? Math.max(...results.map(r => r.percentage))
      : 0;
    
    res.json({
      userName,
      totalQuizzesTaken,
      totalAttempts: results.length,
      averagePercentage: parseFloat(averagePercentage),
      bestScore,
      performanceData
    });
  } catch (err) {
    console.error("❌ Failed to fetch user performance:", err.message);
    res.status(500).json({ error: "Failed to fetch user performance", details: err.message });
  }
});

// 🌍 Start the server
const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/quizzes - List all quizzes`);
  console.log(`   POST /api/quizzes/:qid/verify - Verify quiz code`);
  console.log(`   GET  /api/quizzes/:qid - Get quiz questions`);
  console.log(`   POST /api/quizzes/:qid/submit - Submit answers`);
  console.log(`   GET  /api/quizzes/:qid/results - Get leaderboard\n`);
  
  await testConnection();
});
