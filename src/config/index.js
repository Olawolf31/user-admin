const dotenv = require("dotenv")
dotenv.config()

const dev = {
    app: {
        port: process.env.PORT,
        jwtSecretKey: process.env.JWT_SECRET_KEY || "ezez4573j",
        smtpUsername: process.env.SMTP_USERNAME,
        smtpPassword: process.env.SMTP_PASSWORD,
        clientUrl: process.env.CLIENT_URL,
        sessionSecretKey: process.env.SESSION_SECRET_KEY || "jsjsjs98373"
    },
    db: {
        url: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/usersDB"
    }
}

module.exports = dev