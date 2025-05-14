import { useState } from 'react';
import axios from 'axios';

export default function DescargaMasiva() {
  const [idsText, setIdsText] = useState('');
  const [progress, setProgress] = useState([]);
  const [downloading, setDownloading] = useState(false);

  // Extrae IDs únicos, limpios, uno por línea
  const ids = Array.from(
    new Set(
      idsText
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0)
    )
  );

  const handleDownload = async () => {
    setDownloading(true);
    setProgress([]);
    for (const id of ids) {
      try {
        // Llama a tu API real para descargar los documentos de ese ID
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `/api/descarga-documentos/${id}`, // <-- Cambia esto por tu endpoint real
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }
        );
        // Descarga el archivo ZIP para ese ID
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `documentos_empresa_${id}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        setProgress(prev => [...prev, `ID ${id}: descarga realizada`]);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setProgress(prev => [...prev, `ID ${id}: no se encontraron archivos`]);
        } else {
          setProgress(prev => [...prev, `ID ${id}: error en la descarga`]);
        }
      }
    }
    setDownloading(false);
  };

  const handleClear = () => {
    setIdsText('');
    setProgress([]);
  };

  return (
    <div className="descarga-masiva-container" style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2>Descarga masiva</h2>
      <div className="card p-3 mb-3">
        <div style={{ marginBottom: 8 }}>
          Esta función permite realizar una descarga masiva pasándole un listado de los ID de las empresas que se desean descargar.
        </div>
        <textarea
          className="form-control"
          rows={4}
          placeholder="Coloca aquí los ID, uno por línea"
          value={idsText}
          onChange={e => setIdsText(e.target.value)}
          disabled={downloading}
        />
      </div>
      <div className="card p-3 mb-3">
        <div className="alert alert-info mb-3">
          Se han detectado <b>{ids.length}</b> ID{ids.length !== 1 ? 's' : ''} de empresas, si desea continuar <b>haga click</b> en el botón de abajo para iniciar el proceso de descarga.
        </div>
        <button
          className="btn btn-success mr-2"
          onClick={handleDownload}
          disabled={downloading || ids.length === 0}
        >
          {downloading ? 'Descargando...' : 'Iniciar descarga'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={downloading}
        >
          Limpiar datos
        </button>
      </div>
      <div className="card p-3">
        <div style={{ minHeight: 80 }}>
          {progress.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
