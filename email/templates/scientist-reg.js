const getHtml = (data) => {
  const html =
    '<p>Hello WikiFindings admin,</p>' +
    '<p>A new Scientist user has registered on WikiFindings with username <strong>' + data.username + '</strong>.</p>' +
    '<p>As a reminder, newly registered Scientist users are currently able to create new and edit all existing Findings, including those created by other users, immediately on signup - without any additional approval from WikiFindings administrators.</p>'
  return html
}

module.exports = {
  subject: 'New Scientist signup alert.',
  getHtml
}
