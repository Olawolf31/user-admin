const dotenv = require("dotenv")
dotenv.config()

const dev = {
    app: {
        PORT: process.env.PORT
    },
    db: {
        URL: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/booksDB"
    }
}

module.exports = dev