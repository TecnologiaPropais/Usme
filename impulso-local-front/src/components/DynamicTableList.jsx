// DynamicTableList.jsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/UsersList.css'; // Asegúrate de ajustar la ruta si es necesario
import './css/DynamicTableList.css'; // Importar los nuevos estilos
import config from '../config';

export default function DynamicTableList() {
  // -----------------------------
  // Estados y variables
  // -----------------------------
  const [tables, setTables] = useState([]); // Tablas disponibles
  const [selectedTable, setSelectedTable] = useState(''); // Tabla seleccionada
  const [isPrimaryTable, setIsPrimaryTable] = useState(false); // Si la tabla es principal
  const [records, setRecords] = useState([]); // Registros de la tabla
  const [columns, setColumns] = useState([]); // Columnas de la tabla
  const [fieldsData, setFieldsData] = useState([]); // Información completa de los campos
  const [visibleColumns, setVisibleColumns] = useState([]); // Columnas a mostrar
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado de error
  const [search, setSearch] = useState(''); // Búsqueda
  const [showSearchBar, setShowSearchBar] = useState(false); // Mostrar barra de búsqueda

  const [selectedRecords, setSelectedRecords] = useState([]); // Registros seleccionados
  const [multiSelectFields, setMultiSelectFields] = useState([]); // Campos de llave foránea
  const [bulkUpdateData, setBulkUpdateData] = useState({}); // Datos para actualización masiva
  const [fieldOptionsLoaded, setFieldOptionsLoaded] = useState(false); // Estado de carga de opciones
  const [relatedData, setRelatedData] = useState({}); // Datos relacionados para claves foráneas

  // -----------------------------
  // Paginación: cambiamos a 50 registros por página
  // -----------------------------
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const recordsPerPage = 50; // Número de registros por página
  // Máximo de tabs a mostrar
  const maxPageTabs = 10;

  const navigate = useNavigate();

  // -----------------------------
  // Claves únicas para evitar conflictos entre módulos
  // -----------------------------
  const LOCAL_STORAGE_TABLE_KEY = 'dynamicSelectedTable'; // Clave única para tablas en dynamic
  const LOCAL_STORAGE_COLUMNS_KEY = 'dynamicVisibleColumns'; // Clave única para columnas visibles
  const LOCAL_STORAGE_SEARCH_KEY = 'dynamicSearchQuery'; // Clave única para búsqueda

  // -----------------------------
  // Referencia para el select de columnas
  // -----------------------------
  const selectRef = useRef(null);

  // -----------------------------
  // Funciones auxiliares para localStorage
  // -----------------------------
  const getLoggedUserId = () => {
    return localStorage.getItem('id') || null;
  };

  const getLoggedUserRoleId = () => {
    return localStorage.getItem('role_id') || null;
  };

  // Obtener el role_id del usuario
  const roleId = getLoggedUserRoleId();

  // -----------------------------
  // Estados para filtros adicionales
  // -----------------------------
  const [selectedLocalidad, setSelectedLocalidad] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [localidadOptions, setLocalidadOptions] = useState([]);
  const [estadoOptions, setEstadoOptions] = useState([]);

  // -----------------------------
  // Función para obtener columnas y registros de la tabla
  // -----------------------------
  const fetchTableData = async (tableName, savedVisibleColumns = null) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const loggedUserId = getLoggedUserId();
      const loggedUserRoleId = getLoggedUserRoleId();

      // Obtener campos con información completa
      const fieldsResponse = await axios.get(
        `${config.urls.inscriptions}/tables/${tableName}/fields`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Fields response:', fieldsResponse.data);
      const fetchedColumns = Array.isArray(fieldsResponse.data) ? fieldsResponse.data.map((column) => column.column_name) : [];
      setColumns(fetchedColumns);
      setFieldsData(Array.isArray(fieldsResponse.data) ? fieldsResponse.data : []);

      // Identificar campos de selección múltiple (llaves foráneas)
      const multiSelectFieldsArray = fieldsResponse.data
        .filter((column) => column.constraint_type === 'FOREIGN KEY')
        .map((column) => column.column_name);

      setMultiSelectFields(multiSelectFieldsArray);

      // Si hay columnas visibles guardadas en localStorage, úsalas
      const localVisibleColumns =
        savedVisibleColumns || JSON.parse(localStorage.getItem(LOCAL_STORAGE_COLUMNS_KEY)) || [];
      if (localVisibleColumns.length > 0) {
        setVisibleColumns(localVisibleColumns);
      } else {
        setVisibleColumns(fetchedColumns);
      }

      // Obtener registros
      const recordsResponse = await axios.get(
        `${config.urls.inscriptions}/tables/${tableName}/records`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Records response:', recordsResponse.data);

      let filteredRecords = Array.isArray(recordsResponse.data) ? recordsResponse.data : [];

      // Filtrar registros si es necesario
      if (tableName === 'inscription_caracterizacion') {
        if (loggedUserRoleId === '4' && loggedUserId) {
          filteredRecords = filteredRecords.filter(
            (record) => String(record.Asesor) === String(loggedUserId)
          );
        }
      }

      // Ordenar registros
      filteredRecords.sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : parseInt(a.id, 10);
        const idB = typeof b.id === 'number' ? b.id : parseInt(b.id, 10);
        return idA - idB;
      });

      // Obtener datos relacionados
      const relatedDataResponse = await axios.get(
        `${config.urls.inscriptions}/tables/${tableName}/related-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRelatedData(relatedDataResponse.data.relatedData || {});
      setRecords(filteredRecords);
      setLoading(false);
      setFieldOptionsLoaded(true);
    } catch (error) {
      console.error('Error obteniendo los registros:', error);
      setError('Error obteniendo los registros');
      setLoading(false);
    }
  };

  // -----------------------------
  // Efecto para cargar tablas al montar
  // -----------------------------
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        console.log('Fetching tables from:', config.urls.tables);
        const response = await axios.get(
          config.urls.tables,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data) {
          throw new Error('No se recibieron datos de tablas');
        }

        console.log('Tables response:', response.data);
        setTables(response.data || []);

        // Determinar tabla inicial
        let initialTable = 'inscription_caracterizacion'; // por defecto

        if (roleId === '1') {
          // Si es rol 1, cargar la tabla seleccionada desde localStorage o usar la primera
          const savedTable = localStorage.getItem(LOCAL_STORAGE_TABLE_KEY);
          initialTable = savedTable || response.data[0]?.table_name || initialTable;
        }

        setSelectedTable(initialTable);

        const selectedTableObj = response.data.find(
          (table) => table.table_name === initialTable
        );
        setIsPrimaryTable(selectedTableObj?.is_primary || false);

        // Cargar datos de la tabla inicial
        fetchTableData(initialTable);
      } catch (error) {
        console.error('Error obteniendo las tablas:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        setError('Error obteniendo las tablas: ' + (error.message || 'Error desconocido'));
      }
    };

    fetchTables();
  }, [roleId]);

  // -----------------------------
  // Manejo de Select2 con persistencia
  // -----------------------------
  useEffect(() => {
    if (window.$ && selectedTable && selectRef.current) {
      const $select = window.$(selectRef.current);

      // Inicializar Select2
      $select.select2({
        closeOnSelect: false,
        theme: 'bootstrap4',
        width: '100%',
      });

      // Evitar duplicidades de eventos
      $select.off('change').on('change', (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions || []).map(
          (option) => option.value
        );

        if (selectedOptions.length === 0 && columns.length > 0) {
          // Si no hay seleccionados, forzar al primero
          const firstColumn = columns[0];
          $select.val([firstColumn]).trigger('change');
          setVisibleColumns([firstColumn]);
          localStorage.setItem(LOCAL_STORAGE_COLUMNS_KEY, JSON.stringify([firstColumn]));
          return;
        }

        setVisibleColumns(selectedOptions);
        localStorage.setItem(LOCAL_STORAGE_COLUMNS_KEY, JSON.stringify(selectedOptions));
      });

      // Cargar columnas visibles guardadas
      const savedVisibleColumns = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COLUMNS_KEY));
      if (savedVisibleColumns && savedVisibleColumns.length > 0) {
        $select.val(savedVisibleColumns).trigger('change');
      } else if (columns.length > 0) {
        $select.val([columns[0]]).trigger('change');
      }

      // Cleanup
      return () => {
        if ($select.hasClass('select2-hidden-accessible')) {
          $select.select2('destroy');
        }
      };
    }

    // Cargar búsqueda persistente
    const savedSearch = localStorage.getItem(LOCAL_STORAGE_SEARCH_KEY);
    if (savedSearch) {
      setSearch(savedSearch);
    }
  }, [columns, selectedTable]);

  // -----------------------------
  // Manejar la selección de tabla
  // (solo rol 1)
  // -----------------------------
  const handleTableSelect = (e) => {
    const tableName = e.target.value;
    setSelectedTable(tableName);
    localStorage.setItem(LOCAL_STORAGE_TABLE_KEY, tableName);
    setCurrentPage(1);

    if (tableName) {
      const selectedTableObj = tables.find((t) => t.table_name === tableName);
      setIsPrimaryTable(selectedTableObj?.is_primary || false);

      const savedVisibleColumns = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COLUMNS_KEY));
      fetchTableData(tableName, savedVisibleColumns);
    } else {
      setRecords([]);
      setIsPrimaryTable(false);
      setVisibleColumns([]);
    }
  };

  // -----------------------------
  // Valor a mostrar en c/columna
  // -----------------------------
  const getColumnDisplayValue = (record, column) => {
    if (multiSelectFields.includes(column)) {
      // Es llave foránea
      const foreignKeyValue = record[column];

      if (relatedData[column]) {
        const relatedRecord = relatedData[column].find(
          (item) => String(item.id) === String(foreignKeyValue)
        );
        if (relatedRecord) {
          return relatedRecord.displayValue || `ID: ${relatedRecord.id}`;
        }
      }
      return foreignKeyValue || 'No asignado';
    } else {
      return record[column];
    }
  };

  // -----------------------------
  // Actualizar opciones de filtro
  // -----------------------------
  useEffect(() => {
    if (records.length > 0) {
      const localidadMap = new Map();
      const estadoMap = new Map();

      records.forEach((record) => {
        const localidadId = record['Localidad de la unidad de negocio'];
        const localidadDisplayValue = getColumnDisplayValue(
          record,
          'Localidad de la unidad de negocio'
        );
        if (localidadId && localidadDisplayValue) {
          localidadMap.set(localidadId, localidadDisplayValue);
        }

        const estadoId = record['Estado'];
        const estadoDisplayValue = getColumnDisplayValue(record, 'Estado');
        if (estadoId && estadoDisplayValue) {
          estadoMap.set(estadoId, estadoDisplayValue);
        }
      });

      const localidadOptionsArray = Array.from(localidadMap.entries()).map(
        ([id, displayValue]) => ({ id, displayValue })
      );

      const estadoOptionsArray = Array.from(estadoMap.entries()).map(([id, displayValue]) => ({
        id,
        displayValue,
      }));

      setLocalidadOptions(localidadOptionsArray);
      setEstadoOptions(estadoOptionsArray);
    } else {
      setLocalidadOptions([]);
      setEstadoOptions([]);
    }
  }, [records, relatedData]);

  // -----------------------------
  // Filtrado (búsqueda + dropdowns)
  // -----------------------------
  const filteredRecords = records.filter((record) => {
    // Búsqueda
    if (search) {
      const matchesSearch = visibleColumns.some((column) => {
        const value = getColumnDisplayValue(record, column);
        return value?.toString()?.toLowerCase().includes(search.toLowerCase());
      });
      if (!matchesSearch) return false;
    }

    // Localidad
    if (selectedLocalidad) {
      if (String(record['Localidad de la unidad de negocio']) !== selectedLocalidad) {
        return false;
      }
    }
    // Estado
    if (selectedEstado) {
      if (String(record['Estado']) !== selectedEstado) {
        return false;
      }
    }

    return true;
  });

  // -----------------------------
  // Resetear página al cambiar filtros
  // -----------------------------
  useEffect(() => {
    setCurrentPage(1);
  }, [search, records, selectedLocalidad, selectedEstado]);

  // -----------------------------
  // Lógica de paginación (10 tabs)
  // -----------------------------
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Función para obtener los números de página limitados a maxPageTabs
  const getPageNumbers = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxPageTabs / 2));
    let endPage = startPage + maxPageTabs - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageTabs + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  // -----------------------------
  // Limpiar filtros
  // -----------------------------
  const clearFilters = () => {
    setVisibleColumns(columns);
    setSearch('');
    localStorage.removeItem(LOCAL_STORAGE_COLUMNS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SEARCH_KEY);
    setCurrentPage(1);
    setSelectedLocalidad('');
    setSelectedEstado('');
    fetchTableData(selectedTable); // recargar todo sin filtros
  };

  // -----------------------------
  // Manejo de búsqueda
  // -----------------------------
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    localStorage.setItem(LOCAL_STORAGE_SEARCH_KEY, e.target.value);
    setCurrentPage(1);
  };

  // -----------------------------
  // Manejo de selección de registros (checkbox)
  // -----------------------------
  const handleCheckboxChange = (recordId) => {
    setSelectedRecords((prevSelected) => {
      if (prevSelected.includes(recordId)) {
        return prevSelected.filter((id) => id !== recordId);
      } else {
        return [...prevSelected, recordId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allRecordIds = currentRecords.map((record) => record.id);
      setSelectedRecords(allRecordIds);
    } else {
      setSelectedRecords([]);
    }
  };

  // -----------------------------
  // Manejo de actualización masiva
  // -----------------------------
  const handleBulkUpdateChange = (field, value) => {
    setBulkUpdateData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const applyBulkUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${config.urls.inscriptions}/tables/${selectedTable}/bulk-update`,
        {
          recordIds: selectedRecords,
          updates: bulkUpdateData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Registros actualizados con éxito');
      // Recargar
      fetchTableData(selectedTable);
      // Limpiar selección
      setSelectedRecords([]);
      setBulkUpdateData({});
    } catch (error) {
      console.error('Error actualizando los registros:', error);
      setError('Error actualizando los registros');
    }
  };

  // -----------------------------
  // Render principal
  // -----------------------------
  return (
    <div className="content-wrapper">
      {/* Cabecera */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Gestionar Tablas Dinámicas</h1>
            </div>
            <div className="col-sm-6 d-flex justify-content-end">
              <button
                className="btn btn-light mr-2"
                onClick={() => setShowSearchBar(!showSearchBar)}
              >
                {showSearchBar ? 'Ocultar búsqueda' : 'Mostrar búsqueda'}
              </button>
              {roleId === '1' && (
                <select
                  id="tableSelect"
                  className="form-control"
                  value={selectedTable}
                  onChange={handleTableSelect}
                  style={{ maxWidth: '250px' }}
                >
                  <option value="">-- Selecciona una tabla --</option>
                  {tables.length > 0 &&
                    tables.map((table) => (
                      <option key={table.table_name} value={table.table_name}>
                        {table.table_name}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="content">
        <div className="container-fluid">
          {/* Mostrar errores */}
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
                        placeholder="Buscar en columnas visibles..."
                        value={search}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dropdowns de filtros adicionales */}
              {columns.length > 0 && (
                <>
                  <div className="form-group mb-3 d-flex">
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <label>Filtrar por Localidad de la unidad de negocio:</label>
                      <select
                        className="form-control"
                        value={selectedLocalidad}
                        onChange={(e) => setSelectedLocalidad(e.target.value)}
                      >
                        <option value="">-- Todas --</option>
                        {localidadOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.displayValue}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Filtrar por Estado:</label>
                      <select
                        className="form-control"
                        value={selectedEstado}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                      >
                        <option value="">-- Todos --</option>
                        {estadoOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.displayValue}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select de columnas */}
                  <div className="form-group mb-3">
                    <label>Selecciona las columnas a mostrar:</label>
                    <select
                      ref={selectRef}
                      className="select2 form-control"
                      multiple="multiple"
                      style={{ width: '100%' }}
                    >
                      {columns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Tabla con scroll horizontal fijo */}
              <div className="table-responsive">
                {loading ? (
                  <div className="d-flex justify-content-center p-3">Cargando...</div>
                ) : (
                  <table className="table table-hover text-nowrap minimal-table">
                    <thead>
                      <tr>
                        {isPrimaryTable && (
                          <th>
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={
                                selectedRecords.length === currentRecords.length &&
                                currentRecords.length > 0
                              }
                            />
                          </th>
                        )}
                        {visibleColumns.length > 0 &&
                          visibleColumns.map((column) => (
                            <th key={column}>{column}</th>
                          ))}
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.length > 0 ? (
                        currentRecords.map((record) => (
                          <tr key={record.id}>
                            {isPrimaryTable && (
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedRecords.includes(record.id)}
                                  onChange={() => handleCheckboxChange(record.id)}
                                />
                              </td>
                            )}
                            {visibleColumns.map((column) => (
                              <td key={column}>{getColumnDisplayValue(record, column)}</td>
                            ))}
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  navigate(`/table/${selectedTable}/record/${record.id}`)
                                }
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={visibleColumns.length + 2} className="text-center">
                            No hay registros disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}