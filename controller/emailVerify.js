const nodemailer = require('nodemailer')
const path = require('path')
const EmailTemplate = require('email-templates')

exports.verifyEmail = async (email, name, host, token) => {
  const transporter = nodemailer.createTransport({
    service: process.env.GMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD }
  });
  const emails = new EmailTemplate({
    send: true,
    message: {
      from: process.env.GMAIL_USER
    },
    transport: transporter,
    preview: false
  });
  await emails.send({
    template: path.join(__dirname, '..', 'email', 'mentors'),
    message: {
      to: email,
      subject: "Account Verification"
    },
    locals: {
      name: name,
      host: host,
      token: token
    }
  })
}
