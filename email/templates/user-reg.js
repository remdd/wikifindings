const getHtml = (data) => {
  console.log(data)

  const html =
    '<p>Hello,</p>' +
    '<p>Thank you for joining WikiFindings!<p>' +
    '<p><a target=_blank href=\"' + data.authURL + '\">Please click here to confirm your email and activate your account.</a></p>' +
    '<p>If you have received this email in error, please disregard it.</p>'
  return html
}

module.exports = {
  subject: 'Welcome to WikiFindings! Please confirm your email to complete your registration.',
  getHtml
}
