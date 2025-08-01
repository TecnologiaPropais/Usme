require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Outlook',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function enviarCorreo({ to, subject, text }) {
  await transporter.sendMail({
    from: `"Propais Notificaciones" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text
  });
}

function renderTemplate(template, variables) {
  return template.replace(/{{(.*?)}}/g, (_, key) => variables[key.trim()] || '');
}

module.exports = { enviarCorreo, renderTemplate };
