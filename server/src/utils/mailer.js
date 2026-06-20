const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))
}

async function sendContactEmail({ name, email, message }) {
  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `[作品集聯絡] 來自 ${esc(name)}`,
    html: `
      <h2>新聯絡訊息</h2>
      <p><strong>姓名：</strong>${esc(name)}</p>
      <p><strong>Email：</strong>${esc(email)}</p>
      <p><strong>訊息：</strong></p>
      <p>${esc(message).replace(/\n/g, '<br>')}</p>
    `,
  })
}

module.exports = { sendContactEmail }
