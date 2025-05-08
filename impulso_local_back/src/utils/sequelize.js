const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('prueba_platform', 'postgres', 'postgres', {
  host: 'localhost',
  port: 5433,
  dialect: 'postgres',
  dialectOptions: {
    ssl: false
  },
});

// Verificar conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL mediante Sequelize');
  })
  .catch((err) => {
    console.error('Error conectando a la base de datos:', err);
  });

module.exports = sequelize;
