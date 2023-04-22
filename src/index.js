const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dev = require('./config/index')
const connectDB = require('./config/db')
const userRoutes = require('./routes/user')


const app = express();

app.use(morgan('dev'))
app.use(cors());
app.use(bodyParser.json());//json data
app.use(bodyParser.urlencoded({ extended: true })); //from data

const PORT = dev.app.PORT

//routes
app.use('/api/users', userRoutes)
app.get('/', (req, res) => {
  res.send('Hello World!');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
  connectDB()
})