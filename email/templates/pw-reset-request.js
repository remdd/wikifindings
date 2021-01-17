const getHtml = (data) => {
  const html =
    'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
    data.link +
    '\n\n' +
    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
  return html
}

module.exports = {
  subject: 'WikiFindings password reset',
  getHtml
}
