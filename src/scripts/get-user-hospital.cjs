const userId = process.argv[2]
if (!userId) {
  process.stdout.write('')
  process.exit(0)
}

async function main() {
  require('dotenv').config()
  const mongoose = require('mongoose')
  const uri = process.env.MONGODB_URI

  await mongoose.connect(uri)
  const db = mongoose.connection.db
  const user = await db.collection('users').findOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { projection: { hospitalUser: 1 } }
  )
  process.stdout.write(user?.hospitalUser || '')
  await mongoose.disconnect()
  process.exit(0)
}

main().catch(() => {
  process.stdout.write('')
  process.exit(0)
})
