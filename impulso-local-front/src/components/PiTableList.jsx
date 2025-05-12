// PiTableList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/UsersList.css';
import './css/DynamicTableList.css'; // Importar los nuevos estilos
import config from '../config';

export default function PiTableList() {
  const [records, setRecords] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fieldsData, setFieldsData] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const [multiSelectFields, setMultiSelectFields] = useState([]);
  const [relatedData, setRelatedData] = useState({}); // Para datos relacionados de claves foráneas

  const [localidades, setLocalidades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  const tableName = 'inscription_caracterizacion';

  // Estado para la cantidad de registros por página
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Funciones para obtener el ID y el role_id del usuario logueado desde el localStorage
  const getLoggedUserId = () => {
    return localStorage.getItem('id') || null;
  };

  const getLoggedUserRoleId = () => {
    return localStorage.getItem('role_id') || null;
  };

  // Función para obtener columnas y registros de la tabla
  const fetchTableData = async (savedVisibleColumns = null) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const loggedUserId = getLoggedUserId();
      const loggedUserRoleId = getLoggedUserRoleId();

      if (!token) {
        navigate('/login');
        return;
      }

      // Obtener campos con información completa
      const fieldsResponse = await axios.get(
        `${config.urls.tables}/${tableName}/fields`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedColumns = fieldsResponse.data.map((column) => column.column_name);
      setColumns(fetchedColumns);
      setFieldsData(fieldsResponse.data);

      // Identificar campos de selección múltiple (claves foráneas)
      const multiSelectFieldsArray = fieldsResponse.data
        .filter((column) => column.constraint_type === 'FOREIGN KEY')
        .map((column) => column.column_name);

      setMultiSelectFields(multiSelectFieldsArray);

      // Si hay columnas visibles guardadas en localStorage, úsalas; si no, muestra todas las columnas por defecto
      const localVisibleColumns =
        savedVisibleColumns || JSON.parse(localStorage.getItem('piVisibleColumns')) || [];
      if (localVisibleColumns.length > 0) {
        setVisibleColumns(localVisibleColumns);
      } else {
        setVisibleColumns(fetchedColumns);
      }

      // Obtener registros
      const recordsResponse = await axios.get(
        `${config.urls.tables}/${tableName}/records`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let filteredRecords = recordsResponse.data;

      // Filtrar los registros con Estado == 7
      filteredRecords = filteredRecords.filter((record) => {
        const estadoValue = record.Estado;
        if (estadoValue === undefined || estadoValue === null) {
          return false;
        }
        // Convertir a número o comparar como cadena después de eliminar espacios
        const estadoTrimmed = estadoValue.toString().trim();
        return estadoTrimmed === '7' || parseInt(estadoTrimmed, 10) === 7;
      });

      // === MODIFICACIÓN PRINCIPAL ===
      // Filtrar los registros según el role_id y el asesor (solo si role_id === '4')
      if (loggedUserRoleId === '4' && loggedUserId) {
        filteredRecords = filteredRecords.filter(
          (record) => String(record.Asesor) === String(loggedUserId)
        );
      }

      // Obtener datos relacionados para claves foráneas
      const relatedDataResponse = await axios.get(
        `${config.urls.tables}/${tableName}/related-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRelatedData(relatedDataResponse.data.relatedData || {});
      setRecords(filteredRecords);
      setLoading(false);
    } catch (error) {
      console.error('Error obteniendo los registros:', error);

      if (error.response && error.response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Error obteniendo los registros');
      }

      setLoading(false);
    }
  };

  // Cargar los datos al montar el componente
  useEffect(() => {
    fetchTableData();
    // Cargar localidades y estados
    const fetchRelatedData = async () => {
      try {
        const token = localStorage.getItem('token');
        const localidadesRes = await axios.get(
          `${config.urls.tables}/inscription_localidad_de_la_unidad_de_negocio/records`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLocalidades(localidadesRes.data);
        const estadosRes = await axios.get(
          `${config.urls.tables}/inscription_estado/records`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEstados(estadosRes.data);
        const usersRes = await axios.get(
          `${config.urls.users}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(usersRes.data);
      } catch (err) {
        // No romper si falla
      }
    };
    fetchRelatedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Manejar Select2 con persistencia
  useEffect(() => {
    if (window.$) {
      window.$('.select2').select2({
        closeOnSelect: false,
        width: '100%',
      });

      window.$('.select2').on('change', (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions || []).map(
          (option) => option.value
        );
        setVisibleColumns(selectedOptions);
        localStorage.setItem('piVisibleColumns', JSON.stringify(selectedOptions));
      });

      const savedVisibleColumns = JSON.parse(localStorage.getItem('piVisibleColumns'));
      if (savedVisibleColumns && savedVisibleColumns.length > 0) {
        window.$('.select2').val(savedVisibleColumns).trigger('change');
      }
    }

    const savedSearch = localStorage.getItem('piSearchQuery');
    if (savedSearch) {
      setSearch(savedSearch);
    }
  }, [columns]);

  // Función para obtener el valor a mostrar en una columna
  const getColumnDisplayValue = (record, column) => {
    if (multiSelectFields.includes(column)) {
      // Es un campo de llave foránea
      const foreignKeyValue = record[column];

      if (relatedData[column]) {
        const relatedRecord = relatedData[column].find(
          (item) => String(item.id) === String(foreignKeyValue)
        );
        if (relatedRecord) {
          return relatedRecord.displayValue || `ID: ${relatedRecord.id}`;
        } else {
          return `ID: ${foreignKeyValue}`;
        }
      } else {
        return `ID: ${foreignKeyValue}`;
      }
    } else {
      return record[column];
    }
  };

  // Aplicar el filtro de búsqueda y ordenar por id ascendente
  const displayedRecords = (search
    ? records.filter((record) => {
        return visibleColumns.some((column) => {
          const value = getColumnDisplayValue(record, column);
          return value?.toString()?.toLowerCase().includes(search.toLowerCase());
        });
      })
    : records
  ).sort((a, b) => Number(a.id) - Number(b.id));

  // Obtener los IDs de estado presentes en los registros
  const estadosPresentesIds = Array.from(new Set(displayedRecords.map(r => String(r.Estado))));
  const estadosFiltrados = estados.filter(e => estadosPresentesIds.includes(String(e.id)));

  // Obtener los IDs de asesores presentes en los registros
  const asesoresPresentesIds = Array.from(new Set(displayedRecords.map(r => String(r.Asesor))));
  const asesoresFiltrados = users.filter(
    u => String(u.role_id) === "4" && asesoresPresentesIds.includes(String(u.id))
  );

  // Columnas fijas para Listado Final
  const fixedColumns = [
    'id',
    'Nombre',
    'Empresa',
    'Localidad',
    'Asesor',
    'Estado',
  ];

  // Filtros
  const [localidadFilter, setLocalidadFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [asesorFilter, setAsesorFilter] = useState('');
  const [asignacionFilter, setAsignacionFilter] = useState('');

  // Lógica de filtrado
  const filteredRecords = displayedRecords.filter((record) => {
    const matchesLocalidad = !localidadFilter || String(record["Localidad de la unidad de negocio"]) === String(localidadFilter);
    const matchesEstado = !estadoFilter || String(record.Estado) === String(estadoFilter);
    const matchesAsesor = !asesorFilter || String(record.Asesor) === String(asesorFilter);
    const matchesAsignacion = asignacionFilter === "si" ? record.Asesor : asignacionFilter === "no" ? !record.Asesor : true;
    return matchesLocalidad && matchesEstado && matchesAsesor && matchesAsignacion;
  });

  // Al final del filtrado, limitar los registros a mostrar
  const paginatedRecords = filteredRecords.slice(0, rowsPerPage);

  return (
    <div className="content-wrapper">
      {/* Cabecera */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Listado Final</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="content">
        <div className="container-fluid">
          {/* Otros contenidos */}
          <div className="row">
            <div className="col-12">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="card">
                <div className="card-body">
                  {/* Barra de búsqueda */}
                  <div className="row mb-3">
                    <div className="col-md-6" style={{ position: 'relative' }}>
                      <i className="fas fa-search" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#6c757d', fontSize: 16 }}></i>
                      <input
                        type="text"
                        className="form-control buscador-input"
                        style={{ color: '#000', paddingLeft: 40, width: '538px' }}
                        placeholder="Buscador..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <style>{`.buscador-input::placeholder { color: #6c757d !important; opacity: 1; }`}</style>
                    </div>
                    <div className="col-md-6 d-flex justify-content-end align-items-center">
                      <span style={{ marginRight: 8, color: '#6c757d', fontWeight: 500 }}>Mostrando</span>
                      <select
                        className="form-control"
                        style={{ width: 80, display: 'inline-block', marginRight: 8 }}
                        value={rowsPerPage}
                        onChange={e => setRowsPerPage(Number(e.target.value))}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span style={{ color: '#6c757d', fontWeight: 500 }}>Registros</span>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <select className="form-control" onChange={(e) => setLocalidadFilter(e.target.value)}>
                        <option value="">Todas las Localidades</option>
                        {localidades.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc["Localidad de la unidad de negocio"]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-3">
                      <select className="form-control" onChange={(e) => setEstadoFilter(e.target.value)}>
                        <option value="">Todos los Estados</option>
                        {estadosFiltrados.map((estado) => (
                          <option key={estado.id} value={estado.id}>{estado.Estado}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-3">
                      <select className="form-control" onChange={(e) => setAsesorFilter(e.target.value)}>
                        <option value="">Todos los Asesores</option>
                        {asesoresFiltrados.map((user) => (
                          <option key={user.id} value={user.id}>{user.username}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-3">
                      <select className="form-control" onChange={(e) => setAsignacionFilter(e.target.value)}>
                        <option value="">Asignación Asesor</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  {/* Tabla con columnas fijas */}
                  <div className="table-responsive">
                    {loading ? (
                      <div className="d-flex justify-content-center p-3">Cargando...</div>
                    ) : (
                      <table className="table table-hover text-nowrap minimal-table">
                        <thead>
                          <tr>
                            {fixedColumns.map((column) => (
                              <th key={column} style={{ textAlign: column === 'Nombre' || column === 'Empresa' ? 'left' : 'center', verticalAlign: 'middle' }}>{column.charAt(0).toUpperCase() + column.slice(1)}</th>
                            ))}
                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRecords.length > 0 ? (
                            paginatedRecords.map((record) => (
                              <tr key={record.id}>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{record.id}</td>
                                <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>
                                  <div style={{fontWeight: 500}}>
                                    {(record.Nombres || '') + ' ' + (record.Apellidos || '')}
                                  </div>
                                  <div style={{fontSize: '0.9em', color: '#888'}}>
                                    <i className="fas fa-envelope" style={{marginRight: 4}}></i>
                                    {record["Correo electronico"] || ''}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'left', verticalAlign: 'middle', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <div>{record["Nombre del emprendimiento"]}</div>
                                  <div style={{fontSize: '0.9em', color: '#888'}}>
                                    CC: {record["Numero de documento de identificacion ciudadano"] || record["Numero de identificacion"] || ''}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{(localidades.find(l => String(l.id) === String(record["Localidad de la unidad de negocio"]))?.["Localidad de la unidad de negocio"] || record["Localidad de la unidad de negocio"] || '' )}</td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{(users.find(u => String(u.id) === String(record.Asesor))?.username || record.Asesor || '')}</td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{(estados.find(e => String(e.id) === String(record.Estado))?.Estado || record.Estado || '')}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    className="btn btn-sm btn-primary mb-1"
                                    style={{ width: '140px', height: '32px', fontSize: '15px', padding: '4px 0', fontWeight: 'normal' }}
                                    onClick={() => navigate(`/plan-inversion/${record.id}`)}
                                  >
                                    Plan de Inversión
                                  </button>
                                  <br />
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    style={{ width: '140px', height: '30px', fontSize: '14px', padding: '4px 0' }}
                                    onClick={() =>
                                      navigate(`/table/${tableName}/record/${record.id}`)
                                    }
                                  >
                                    Editar
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={fixedColumns.length + 1} className="text-center">
                                No hay registros para mostrar.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Botón para limpiar filtros */}
                  <div className="mt-3">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSearch('');
                        fetchTableData();
                      }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Fin de otros contenidos */}
        </div>
      </section>
    </div>
  );
}

