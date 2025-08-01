const enviarCorreo = require('./src/utils/mailer');

enviarCorreo({
  to: 'daniel.martinez@propais.org.co', // Cambia esto por un correo tuyo para la prueba
  subject: 'Prueba de correo desde Nodemailer',
  text: '¡Este es un correo de prueba enviado desde el backend usando Outlook y Nodemailer!'
}).then(() => {
  console.log('Correo enviado correctamente');
}).catch(console.error);
