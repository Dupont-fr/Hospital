const express = require('express')
const cors = require('cors')
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
})

// Import database connection
const connectDB = require('./config/db')

// Import routes
const userRoutes = require('./routes/user.routes')

/**
 * User Service Server
 * Microservice for user authentication and role management
 */

// Create Express app
const app = express()

// Serve static frontend (built files from frontend/dist)
app.use(express.static(require('path').join(__dirname, '..', 'dist')))

// CORS only needed in development (when user-service is called directly)
// In production, only the Gateway handles CORS
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }))
}

// Middleware to parse JSON bodies
app.use(express.json())

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User Service is running',
    timestamp: new Date().toISOString(),
  })
})

// Mount user routes
// All routes are prefixed with /api/users when connected to the gateway
app.use('/', userRoutes)

// SPA catch-all: serve index.html for non-API routes (client-side routing)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Route non trouvée',
    })
  }
  res.sendFile(require('path').join(__dirname, '..', 'dist', 'index.html'))
})

/**
 * Global Error Handler
 * Catches and handles all unhandled errors
 */
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message)

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  })
})

// Get port from environment or use default
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

/**
 * Start the server
 * Connect to database first, then start listening
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()

    // Start Express server
    app.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 User Service is running on port ${PORT}               ║
║                                                            ║
║   📍 Health check: http://${HOST}:${PORT}/health          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    console.log('⚠️  Server will retry connection in 5 seconds...')
    setTimeout(startServer, 5000)
  }
}

// Start the server
startServer()

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message)
  process.exit(1)
})

module.exports = app
