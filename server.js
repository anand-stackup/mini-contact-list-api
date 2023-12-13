const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const connectDb = require('./server/database/connection')

const app = express()

dotenv.config({ path : '.env' })
const PORT = process.env.PORT || 8080

app.use(cors())

// mongoDb connection 
connectDb()

app.use(express.json())


app.use('/avatars', express.static(path.resolve(__dirname,'avatars')))

// load routes 
app.use('/', require('./server/routes/router'))

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) })