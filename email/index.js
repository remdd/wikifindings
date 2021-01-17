const mailgun = require('mailgun-js')
const config = require('./config.js')
const userReg = require('./templates/user-reg')
const scientistReg = require('./templates/scientist-reg')
const pwChangeConfirmation = require('./templates/pw-change-confirmation')
const pwResetRequest = require('./templates/pw-reset-request')

const send = (template, recipient, data) => {
  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    host: process.env.MAILGUN_HOST
  })
  let email = {
    from: config.sender,
    to: recipient,
  }
  switch (template) {
    case 'userReg':
      email.subject = userReg.subject
      email.html = userReg.getHtml(data)
      email.bcc = process.env.ADMIN_EMAILS
      break;
    case 'scientistReg':
      email.subject = scientistReg.subject
      email.html = scientistReg.getHtml(data)
      break;
    case 'pwChangeConfirmation':
      email.subject = pwChangeConfirmation.subject
      email.html = pwChangeConfirmation.getHtml(data)
      break;
    case 'pwResetRequest':
      email.subject = pwResetRequest.subject
      email.html = pwResetRequest.getHtml(data)
    break;
      default:
      throw new Error('Invalid email template')
  }
  mg.messages().send(email, (err, body) => {
    console.log(`'${template}' email sent to ${recipient}`)
    if (err) {
      console.error(`mailgun response: ${JSON.stringify(err)}`)
    } else {
      console.info(`mailgun response: ${JSON.stringify(body)}`)
    }
  })
}

module.exports = {
  send
}
