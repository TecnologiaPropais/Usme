import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import config from '../../config';

export default function AnexosV2Tab({ id }) {
  const [data, setData] = useState({});
  const [tableName] = useState('pi_anexosv2');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // Verificar el rol del usuario
  const userRole = localStorage.getItem('role_id');
  const isConsultaRole = userRole === '3';

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Cache de caracterización (evita refetch en cada subida de archivo)
  const [caracterizacionRecord, setCaracterizacionRecord] = useState(null);

  // Nombres de los documentos para mostrar - basados en la estructura real de la tabla
  const documentNames = {
    // Documentos Visita 1
    acta_visita_verificacion: 'Acta de visita de verificación',
    autorizacion_imagen: 'Autorización de uso de imagen y datos personales',
    autorizacion_firma: 'Autorización firma digital',
    registro_fotografico_1: 'Registro fotográfico',
    plan_inversion: 'Plan de inversión firmado',
    carta_compromiso: 'Carta de compromiso',
    
    // Documentos Visita 2
    verificacion_entrega: 'Verificación de entrega',
    acta_segunda_visita: 'Acta de segunda visita',
    registro_fotografico: 'Registro fotográfico',
    encuesta_satisfaccion: 'Encuesta de satisfacción'
  };

  // Código de etiquetado por campo (numeroDoc_Nombres Apellidos_CODIGO.ext)
  const documentCodes = {
    acta_visita_verificacion: 'AV1',
    autorizacion_imagen: 'AID',
    autorizacion_firma: 'FD',
    registro_fotografico_1: 'RF1',
    plan_inversion: 'PI',
    carta_compromiso: 'CC',
    verificacion_entrega: 'VE',
    acta_segunda_visita: 'AV2',
    registro_fotografico: 'RF2',
    encuesta_satisfaccion: 'ES',
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró el token de autenticación");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${config.urls.inscriptions.pi}/tables/${tableName}/records?caracterizacion_id=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const recordData = response.data[0] || null;

      if (recordData) {
        setData(recordData);
        setOriginalData({ ...recordData });
      } else {
        const userId = localStorage.getItem('id');
        const createResponse = await axios.post(
          `${config.urls.inscriptions.pi}/tables/${tableName}/record`,
          { caracterizacion_id: id, user_id: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newRecord = createResponse.data.record || createResponse.data; 
        setData({ ...newRecord });
        setOriginalData({ ...newRecord });
      }

      setLoading(false);
      } catch (err) {
        // Mostrar mensaje de error más específico
        const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error obteniendo datos";
        setError(`Error: ${errorMessage}`);
        setLoading(false);
      }
  };

  const fetchCaracterizacion = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(
        `${config.urls.inscriptions.tables}/inscription_caracterizacion/record/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const record = res.data.record || res.data;
      setCaracterizacionRecord(record);
    } catch {
      setCaracterizacionRecord(null);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCaracterizacion();
  }, [id]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const openUploadModal = (fieldName) => {
    setCurrentField(fieldName);
    setSelectedFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentField(null);
    setSelectedFile(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecciona un archivo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      
      const extension = selectedFile.name.split('.').pop();
      let fileNameWithPrefix;
      const code = documentCodes[currentField];

      if (code) {
        let car = caracterizacionRecord;
        if (!car) {
          const carResponse = await axios.get(
            `${config.urls.inscriptions.tables}/inscription_caracterizacion/record/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          car = carResponse.data.record || carResponse.data;
          setCaracterizacionRecord(car);
        }
        const numeroDoc = (car['Numero de identificacion'] ?? '').toString().trim();
        const nombres = (car['Nombres'] ?? '').toString().trim();
        const apellidos = (car['Apellidos'] ?? '').toString().trim();
        const nombresApellidos = [nombres, apellidos].filter(Boolean).join(' ');
        fileNameWithPrefix = `${numeroDoc}_${nombresApellidos}_${code}.${extension}`;
      } else {
        const uniqueSuffix = Date.now();
        fileNameWithPrefix = `${currentField}_${uniqueSuffix}.${extension}`;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', fileNameWithPrefix);
      formData.append('caracterizacion_id', id);
      formData.append('user_id', userId);
      formData.append('fieldName', currentField);

      const uploadResponse = await axios.post(
        `${config.baseUrl}/inscriptions/tables/${tableName}/record/${data.id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const fileUrl = uploadResponse.data.url;

      // Actualizar el campo en la base de datos con la URL del archivo
      const updateData = {
        [currentField]: fileUrl
      };

      // Usar la ruta correcta para tablas pi_
      const updateUrl = tableName.startsWith('pi_') 
        ? `${config.urls.inscriptions.tables.replace('/tables', '/pi/tables')}/${tableName}/record/${data.id}`
        : `${config.urls.inscriptions.tables}/${tableName}/record/${data.id}`;

      await axios.put(
        updateUrl,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await fetchData();

      alert("Archivo subido exitosamente");
      closeModal();
    } catch (error) {
      setError('Error subiendo el archivo');
    }
  };

  const handleFileView = async (filePath) => {
    try {
      if (filePath.startsWith('https://') && filePath.includes('X-Goog-Signature')) {
        window.open(filePath, '_blank');
        return;
      }
      
      // Si es una URL pública de GCS, generar una nueva URL firmada
      if (filePath.startsWith('https://storage.googleapis.com/')) {
        const urlParts = filePath.split('/');
        const filePathInBucket = urlParts.slice(4).join('/');
        const token = localStorage.getItem('token');
        
        // Obtener URL firmada del backend
        const response = await axios.get(
          `${config.baseUrl}/inscriptions/files/signed-url/${encodeURIComponent(filePathInBucket)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        window.open(response.data.signedUrl, '_blank');
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${config.baseUrl}/inscriptions/files/signed-url/${encodeURIComponent(filePath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.open(response.data.signedUrl, '_blank');
    } catch (error) {
      alert('Error al abrir el archivo');
    }
  };

  const handleFileDelete = async (fieldName) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('id');
        if (data[fieldName]) {
          const fileName = data[fieldName].split('/').pop();
          const deleteUrl = `${config.baseUrl}/inscriptions/pi/tables/${tableName}/record/${data.id}/file/${fileName}`;
          const response = await axios.delete(
            deleteUrl,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              data: { 
                user_id: userId,
                field_name: fieldName,
                record_id: data.id // ID del registro en pi_anexosv2
              }
            }
          );
        }
        await fetchData();
        alert("Archivo eliminado exitosamente");
      } catch (error) {
        setError('Error eliminando el archivo');
      }
    }
  };

  const renderDocumentItem = (fieldName) => {
    const hasFile = data[fieldName] && data[fieldName].trim() !== '';
    
    return (
      <div key={fieldName} className="document-item mb-3">
        <h6 className="document-title mb-1">{documentNames[fieldName]}</h6>
        
        {hasFile ? (
          <div className="document-status">
            <i className="fas fa-paperclip text-primary me-2"></i>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleFileView(data[fieldName]);
              }}
              className="text-primary text-decoration-none"
            >
              Ver archivo adjunto
            </a>
            <button
              className="btn btn-link text-danger btn-sm ms-2 p-0"
              onClick={() => handleFileDelete(fieldName)}
              title={isConsultaRole ? "No tienes permisos para eliminar archivos" : "Eliminar archivo"}
              disabled={isConsultaRole}
              style={{ 
                opacity: isConsultaRole ? 0.5 : 1,
                cursor: isConsultaRole ? 'not-allowed' : 'pointer'
              }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ) : (
          <div className="document-status">
            <span 
              className="text-muted cursor-pointer"
              onClick={() => openUploadModal(fieldName)}
              style={{ cursor: 'pointer' }}
            >
              Sin archivo adjunto
            </span>
          </div>
        )}
      </div>
    );
  };

  // Separar los campos por secciones según la estructura real de la tabla
  const visita1Fields = [
    'acta_visita_verificacion',
    'autorizacion_imagen',
    'autorizacion_firma',
    'registro_fotografico_1',
    'plan_inversion',
    'carta_compromiso'
  ];

  const visita2Fields = [
    'verificacion_entrega',
    'acta_segunda_visita',
    'registro_fotografico',
    'encuesta_satisfaccion'
  ];

  return (
    <div>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div style={{ maxWidth: '800px' }}>
          {/* Sección Documentos Visita 1 */}
          <div className="card p-4 mb-4">
            <h5 className="mb-4" style={{ fontWeight: 'bold' }}>Documentos Visita 1</h5>
            
            {visita1Fields.map(fieldName => 
              renderDocumentItem(fieldName)
            )}
          </div>

          {/* Sección Documentos Visita 2 */}
          <div className="card p-4">
            <h5 className="mb-4" style={{ fontWeight: 'bold' }}>Documentos Visita 2</h5>
            
            {visita2Fields.map(fieldName => 
              renderDocumentItem(fieldName)
            )}
          </div>
        </div>
      )}

      {/* Modal para subir archivo */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div 
            className="modal-backdrop fade show" 
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040
            }}
            onClick={closeModal}
          ></div>
          
          {/* Modal */}
          <div 
            className="modal fade show" 
            style={{ 
              display: 'block', 
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1050
            }} 
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #e9ecef', borderRadius: '15px 15px 0 0' }}>
                  <h6 className="modal-title" style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    Subir {documentNames[currentField]}
                  </h6>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                    aria-label="Cerrar"
                    style={{ 
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#070024',
                      cursor: 'pointer',
                      padding: '0',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Seleccionar archivo:</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      id="fileInput"
                    />
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <small className="text-success">
                          <i className="fas fa-check me-1"></i>
                          Archivo seleccionado: {selectedFile.name}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e9ecef', borderRadius: '0 0 15px 15px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeModal}
                    style={{ borderRadius: '8px' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={handleFileUpload}
                    disabled={!selectedFile}
                    style={{ 
                      backgroundColor: '#070024',
                      borderColor: '#070024',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontWeight: '500'
                    }}
                  >
                    {selectedFile ? 'Cargar' : 'Selecciona un archivo primero'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

AnexosV2Tab.propTypes = {
  id: PropTypes.string.isRequired,
};
