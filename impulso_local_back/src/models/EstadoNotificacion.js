module.exports = (sequelize, DataTypes) => {
  const EstadoNotificacion = sequelize.define('EstadoNotificacion', {
    id_estado_destino: DataTypes.INTEGER,
    asunto: DataTypes.STRING,
    cuerpo_correo: DataTypes.TEXT
  }, {
    tableName: 'estado_notificacion',
    timestamps: false
  });
  return EstadoNotificacion;
};