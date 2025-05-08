import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import './css/DownloadZip.css';

export default function DownloadZip() {
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token no encontrado');
        }

        // Obtener tablas de inscripción
        const inscriptionResponse = await axios.get(config.urls.inscriptions.primaryTables, {
          headers: { Authorization: `Bearer ${token}` },
          params: { tableType: 'inscription' }
        });

        // Obtener tablas de proveedores
        const providerResponse = await axios.get(config.urls.inscriptions.primaryTables, {
          headers: { Authorization: `Bearer ${token}` },
          params: { tableType: 'provider' }
        });

        setTables([...inscriptionResponse.data, ...providerResponse.data]);
        setLoading(false);
      } catch (error) {
        setError('Error cargando las tablas');
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableSelect = (tableName) => {
    setSelectedTables(prev => 
      prev.includes(tableName)
        ? prev.filter(name => name !== tableName)
        : [...prev, tableName]
    );
  };

  const handleDownload = async () => {
    if (selectedTables.length === 0) {
      alert('Por favor selecciona al menos una tabla');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        config.urls.inscriptions.downloadZip,
        { tables: selectedTables },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'datos.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Error descargando los datos');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="download-zip-container">
      <h2>Descargar Datos</h2>
      <div className="tables-list">
        {tables.map(table => (
          <div key={table.table_name} className="table-item">
            <label>
              <input
                type="checkbox"
                checked={selectedTables.includes(table.table_name)}
                onChange={() => handleTableSelect(table.table_name)}
              />
              {table.table_name}
            </label>
          </div>
        ))}
      </div>
      <button 
        onClick={handleDownload}
        disabled={selectedTables.length === 0}
        className="download-button"
      >
        Descargar Seleccionados
      </button>
    </div>
  );
}


