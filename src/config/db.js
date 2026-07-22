// Load environment variables FIRST
require('dotenv').config({
  path: require('path').join(__dirname, '..', '..', '.env'),
})

const mongoose = require('mongoose')

/**
 * Connect to MongoDB database
 * This function establishes connection to MongoDB using the URI from environment variables
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI

    // Connect to MongoDB
    await mongoose.connect(mongoURI)

    console.log('✅ MongoDB connected successfully')

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected')
    })
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message)
    // Exit process with failure code
    process.exit(1)
  }
}

// Export the connection function
module.exports = connectDB
