const { Sequelize } = require('sequelize');
require('dotenv').config();

const useSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  {
    dialect: 'postgres',
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {},
    logging: console.log
  }
);

// Verificar conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL mediante Sequelize');
  })
  .catch((err) => {
    console.error('Error conectando a la base de datos:', err);
  });

module.exports = sequelize;
