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

      // Imprimir registros obtenidos
      console.log('Registros obtenidos:', filteredRecords);

      // Verificar los valores de 'Estado'
      const estadoValues = filteredRecords.map((record) => record.Estado);
      console.log('Valores de Estado:', estadoValues);

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

      console.log('Registros con Estado == 7:', filteredRecords);

      // === MODIFICACIÓN PRINCIPAL ===
      // Filtrar los registros según el role_id y el asesor (solo si role_id === '4')
      if (loggedUserRoleId === '4' && loggedUserId) {
        filteredRecords = filteredRecords.filter(
          (record) => String(record.Asesor) === String(loggedUserId)
        );
      }
      // Si el usuario es 'SuperAdmin' (role_id '1'), no se aplica el filtro y se muestran todos los registros con Estado == 7

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
          `${config.urls.api}/users`,
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

  // Columnas fijas para Listado Final
  const fixedColumns = [
    'id',
    'Nombre',
    'Empresa',
    'Localidad',
    'Asesor',
    'Estado',
  ];

  return (
    <div className="content-wrapper">
      {/* Cabecera */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Listado Final</h1>
            </div>
            <div className="col-sm-6 d-flex justify-content-end">
              <button
                className="btn btn-light mr-2"
                onClick={() => setShowSearchBar(!showSearchBar)}
              >
                {showSearchBar ? 'Ocultar búsqueda' : 'Mostrar búsqueda'}
              </button>
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
                  {showSearchBar && (
                    <div className="row mb-3">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              localStorage.setItem('piSearchQuery', e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabla con columnas fijas */}
                  <div className="table-responsive">
                    {loading ? (
                      <div className="d-flex justify-content-center p-3">Cargando...</div>
                    ) : (
                      <table className="table table-hover text-nowrap minimal-table">
                        <thead>
                          <tr>
                            {fixedColumns.map((column) => (
                              <th key={column}>{column.charAt(0).toUpperCase() + column.slice(1)}</th>
                            ))}
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedRecords.length > 0 ? (
                            displayedRecords.map((record) => (
                              <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{(record.Nombres || '') + ' ' + (record.Apellidos || '')}</td>
                                <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {record["Nombre del emprendimiento"]}
                                </td>
                                <td>{(localidades.find(l => String(l.id) === String(record["Localidad de la unidad de negocio"]))?.["Localidad de la unidad de negocio"] || record["Localidad de la unidad de negocio"] || '' )}</td>
                                {console.log('USERS:', users)}
                                {console.log('RECORD.ASESOR:', record.Asesor)}
                                <td>{(users.find(u => String(u.id) === String(record.Asesor))?.username || record.Asesor || '')}</td>
                                <td>{(estados.find(e => String(e.id) === String(record.Estado))?.Estado || record.Estado || '')}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-primary mb-1"
                                    onClick={() => navigate(`/plan-inversion/${record.id}`)}
                                  >
                                    Plan de Inversión
                                  </button>
                                  <br />
                                  <button
                                    className="btn btn-sm btn-secondary"
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

