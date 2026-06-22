const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const useMongoDB = !!process.env.MONGODB_URI;
let dbInstance = null; // Holds SQLite connection if used

// MongoDB Schemas
let MessageModel, AnalyticsModel, ChatbotLogModel;

// ── Database Initialization ──────────────────────────────────────────
function connectDB() {
  return new Promise((resolve, reject) => {
    if (useMongoDB) {
      console.log('Connecting to MongoDB Atlas...');
      mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
          console.log('MongoDB Connected successfully!');
          
          // Define schemas
          const messageSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true },
            subject: { type: String, required: true },
            message: { type: String, required: true },
            date: { type: String, default: () => new Date().toISOString() }
          });
          
          const analyticsSchema = new mongoose.Schema({
            type: { type: String, required: true }, // 'page_view' or 'cv_download'
            timestamp: { type: String, default: () => new Date().toISOString() },
            metadata: { type: String, default: '' }
          });
          
          const chatbotSchema = new mongoose.Schema({
            query: { type: String, required: true },
            timestamp: { type: String, default: () => new Date().toISOString() }
          });

          MessageModel = mongoose.models.Message || mongoose.model('Message', messageSchema);
          AnalyticsModel = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
          ChatbotLogModel = mongoose.models.ChatbotLog || mongoose.model('ChatbotLog', chatbotSchema);
          
          resolve(true);
        })
        .catch(err => {
          console.error('MongoDB Connection Error:', err);
          reject(err);
        });
    } else {
      console.log('Initializing local SQLite database (portfolio.db)...');
      const dbPath = path.join(__dirname, 'portfolio.db');
      
      dbInstance = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('SQLite connection error:', err);
          return reject(err);
        }
        
        console.log('SQLite database loaded successfully.');
        
        // Create tables synchronously-like
        dbInstance.serialize(() => {
          dbInstance.run(`
            CREATE TABLE IF NOT EXISTS messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              subject TEXT NOT NULL,
              message TEXT NOT NULL,
              date TEXT NOT NULL
            )
          `);
          
          dbInstance.run(`
            CREATE TABLE IF NOT EXISTS analytics (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              type TEXT NOT NULL,
              timestamp TEXT NOT NULL,
              metadata TEXT
            )
          `);
          
          dbInstance.run(`
            CREATE TABLE IF NOT EXISTS chatbot_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              query TEXT NOT NULL,
              timestamp TEXT NOT NULL
            )
          `);
          
          resolve(true);
        });
      });
    }
  });
}

// ── Unified Database Interface ────────────────────────────────────────

// 1. Save contact message
function saveMessage(name, email, subject, message) {
  const dateStr = new Date().toISOString();
  if (useMongoDB) {
    const newMessage = new MessageModel({ name, email, subject, message, date: dateStr });
    return newMessage.save();
  } else {
    return new Promise((resolve, reject) => {
      const stmt = dbInstance.prepare(`
        INSERT INTO messages (name, email, subject, message, date)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(name, email, subject, message, dateStr, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
      stmt.finalize();
    });
  }
}

// 2. Log an event (page_view / cv_download)
function logEvent(type, metadata = '') {
  const dateStr = new Date().toISOString();
  if (useMongoDB) {
    const newEvent = new AnalyticsModel({ type, timestamp: dateStr, metadata });
    return newEvent.save();
  } else {
    return new Promise((resolve, reject) => {
      const stmt = dbInstance.prepare(`
        INSERT INTO analytics (type, timestamp, metadata)
        VALUES (?, ?, ?)
      `);
      stmt.run(type, dateStr, metadata, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
      stmt.finalize();
    });
  }
}

// 3. Log chatbot prompt metrics
function logChatbotQuery(query) {
  const dateStr = new Date().toISOString();
  if (useMongoDB) {
    const newLog = new ChatbotLogModel({ query, timestamp: dateStr });
    return newLog.save();
  } else {
    return new Promise((resolve, reject) => {
      const stmt = dbInstance.prepare(`
        INSERT INTO chatbot_logs (query, timestamp)
        VALUES (?, ?)
      `);
      stmt.run(query, dateStr, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
      stmt.finalize();
    });
  }
}

// 4. Fetch KPI statistics
async function getStats() {
  if (useMongoDB) {
    const visitors = await AnalyticsModel.countDocuments({ type: 'page_view' });
    const cvDownloads = await AnalyticsModel.countDocuments({ type: 'cv_download' });
    const messages = await MessageModel.countDocuments();
    return { visitors, cvDownloads, messages };
  } else {
    const getCount = (query, params = []) => {
      return new Promise((resolve, reject) => {
        dbInstance.get(query, params, (err, row) => {
          if (err) return reject(err);
          resolve(row ? row.count : 0);
        });
      });
    };
    
    try {
      const visitors = await getCount("SELECT COUNT(*) as count FROM analytics WHERE type = 'page_view'");
      const cvDownloads = await getCount("SELECT COUNT(*) as count FROM analytics WHERE type = 'cv_download'");
      const messages = await getCount("SELECT COUNT(*) as count FROM messages");
      return { visitors, cvDownloads, messages };
    } catch (err) {
      console.error('SQLite count query error:', err);
      return { visitors: 0, cvDownloads: 0, messages: 0 };
    }
  }
}

// 5. Fetch daily visitor logs for line chart
async function getVisitorChartData() {
  if (useMongoDB) {
    const chartData = await AnalyticsModel.aggregate([
      { $match: { type: 'page_view' } },
      { $group: { _id: { $substr: ["$timestamp", 0, 10] }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);
    
    // Map to daily format: { day, count }
    return chartData.map(item => ({
      day: item._id,
      count: item.count
    }));
  } else {
    return new Promise((resolve, reject) => {
      dbInstance.all(`
        SELECT substr(timestamp, 1, 10) as day, COUNT(*) as count 
        FROM analytics 
        WHERE type = 'page_view' 
        GROUP BY day 
        ORDER BY day ASC 
        LIMIT 7
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
}

module.exports = {
  connectDB,
  saveMessage,
  logEvent,
  logChatbotQuery,
  getStats,
  getVisitorChartData
};
