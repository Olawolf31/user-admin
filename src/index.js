const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dev = require('./config/index')
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/user')


const app = express();

app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors());
app.use(bodyParser.json());//json data
app.use(bodyParser.urlencoded({ extended: true })); //form data

app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data



const PORT = dev.app.port

//routes
app.use('/api/users', userRoutes)
app.get('/', (req, res) => {
  res.send('Hello World!');
})


app.listen(PORT, async () => {
  console.log(`Example app listening on port ${PORT}`)
  await connectDB()
})