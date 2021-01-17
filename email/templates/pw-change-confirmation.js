const getHtml = (data) => {
  const html =
    'Hello,\n\n' +
    'This is a confirmation that the password for your account ' + data.user_email + ' has just been changed.\n'
  return html
}

module.exports = {
  subject: 'Your WikiFindings password has been changed',
  getHtml
}
