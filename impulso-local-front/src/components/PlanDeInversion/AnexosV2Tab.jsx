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

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró el token de autenticación");
        setLoading(false);
        return;
      }

      console.log("🔍 DEBUG: Intentando obtener datos de la tabla:", tableName);
      console.log("🔍 DEBUG: URL GET:", `${config.urls.inscriptions.pi}/tables/${tableName}/records?caracterizacion_id=${id}`);
      console.log("🔍 DEBUG: ID de caracterización:", id);

      const response = await axios.get(
        `${config.urls.inscriptions.pi}/tables/${tableName}/records?caracterizacion_id=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🔍 DEBUG: Respuesta GET exitosa:", response.data);

      const recordData = response.data[0] || null;

      if (recordData) {
        console.log("🔍 DEBUG: Registro encontrado:", recordData);
        setData(recordData);
        setOriginalData({ ...recordData });
      } else {
        console.log("🔍 DEBUG: No se encontró registro, creando uno nuevo...");
        // Crear registro con user_id si el backend lo necesita
        const userId = localStorage.getItem('id');
        console.log("🔍 DEBUG: User ID:", userId);
        console.log("🔍 DEBUG: URL POST:", `${config.urls.inscriptions.pi}/tables/${tableName}/record`);
        console.log("🔍 DEBUG: Datos a enviar:", { caracterizacion_id: id, user_id: userId });
        console.log("🔍 DEBUG: Token (primeros 20 chars):", token.substring(0, 20) + "...");
        
        const createResponse = await axios.post(
          `${config.urls.inscriptions.pi}/tables/${tableName}/record`,
          { caracterizacion_id: id, user_id: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("🔍 DEBUG: Respuesta POST exitosa:", createResponse.data);
        const newRecord = createResponse.data.record || createResponse.data; 
        setData({ ...newRecord });
        setOriginalData({ ...newRecord });
      }

      setLoading(false);
      } catch (err) {
        console.error("❌ ERROR: Error obteniendo datos de Anexos V2:", err);
        console.error("❌ ERROR: Status:", err.response?.status);
        console.error("❌ ERROR: Status Text:", err.response?.statusText);
        console.error("❌ ERROR: Response Data:", err.response?.data);
        console.error("❌ ERROR: Request URL:", err.config?.url);
        console.error("❌ ERROR: Request Method:", err.config?.method);
        console.error("❌ ERROR: Request Data:", err.config?.data);
        
        // Mostrar mensaje de error más específico
        const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error obteniendo datos";
        setError(`Error: ${errorMessage}`);
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
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
      
      const uniqueSuffix = Date.now();
      const extension = selectedFile.name.split('.').pop();
      const fileNameWithPrefix = `${currentField}_${uniqueSuffix}.${extension}`;

      console.log("🔍 DEBUG: Iniciando subida de archivo...");
      console.log("🔍 DEBUG: Archivo seleccionado:", selectedFile.name);
      console.log("🔍 DEBUG: Nombre final:", fileNameWithPrefix);
      console.log("🔍 DEBUG: Campo actual:", currentField);
      console.log("🔍 DEBUG: ID del registro:", data.id);
      console.log("🔍 DEBUG: ID de caracterización:", id);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', fileNameWithPrefix);
      formData.append('caracterizacion_id', id);
      formData.append('user_id', userId);
      formData.append('fieldName', currentField);

      console.log("🔍 DEBUG: URL de upload:", `${config.baseUrl}/inscriptions/tables/${tableName}/record/${data.id}/upload`);

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

      console.log("🔍 DEBUG: Respuesta de upload:", uploadResponse.data);

      // Obtener la URL del archivo desde la respuesta del backend
      const fileUrl = uploadResponse.data.url;
      console.log("🔍 DEBUG: URL del archivo obtenida:", fileUrl);

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

      alert("Archivo subido exitosamente");
      await fetchData();
      closeModal();
    } catch (error) {
      console.error('Error subiendo el archivo:', error);
      setError('Error subiendo el archivo');
    }
  };

  const handleFileView = async (filePath) => {
    try {
      console.log("🔍 DEBUG: Intentando abrir archivo:", filePath);
      
      // Si filePath ya es una URL firmada, usarla directamente
      if (filePath.startsWith('https://') && filePath.includes('X-Goog-Signature')) {
        console.log("🔍 DEBUG: URL firmada detectada, abriendo...");
        window.open(filePath, '_blank');
        return;
      }
      
      // Si es una URL pública de GCS, generar una nueva URL firmada
      if (filePath.startsWith('https://storage.googleapis.com/')) {
        console.log("🔍 DEBUG: URL pública de GCS detectada, generando URL firmada...");
        
        // Extraer el path del archivo de la URL pública
        const urlParts = filePath.split('/');
        const filePathInBucket = urlParts.slice(4).join('/');
        
        console.log("🔍 DEBUG: Path del archivo en bucket:", filePathInBucket);
        
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

        console.log("🔍 DEBUG: URL firmada obtenida:", response.data.signedUrl);
        
        // Abrir el archivo en una nueva pestaña
        window.open(response.data.signedUrl, '_blank');
        return;
      }
      
      // Si no es una URL, generar una nueva URL firmada
      const token = localStorage.getItem('token');
      console.log("🔍 DEBUG: Generando URL firmada para:", filePath);
      
      // Obtener URL firmada del backend
      const response = await axios.get(
        `${config.baseUrl}/inscriptions/files/signed-url/${encodeURIComponent(filePath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔍 DEBUG: URL firmada obtenida:", response.data.signedUrl);
      
      // Abrir el archivo en una nueva pestaña
      window.open(response.data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error obteniendo URL firmada:', error);
      console.error('Error details:', error.response?.data);
      alert('Error al abrir el archivo');
    }
  };

  const handleFileDelete = async (fieldName) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('id');
        
        console.log("🔍 DEBUG: Eliminando archivo del campo:", fieldName);
        console.log("🔍 DEBUG: URL del archivo:", data[fieldName]);
        
        // Eliminar archivo de GCS y limpiar campo en tabla pi_
        if (data[fieldName]) {
          // Extraer el nombre del archivo de la ruta de GCS
          const fileName = data[fieldName].split('/').pop();
          console.log("🔍 DEBUG: Nombre del archivo a eliminar:", fileName);
          
          // Usar la ruta específica para tablas pi_
          const deleteUrl = `${config.baseUrl}/inscriptions/pi/tables/${tableName}/record/${data.id}/file/${fileName}`;
          console.log("🔍 DEBUG: URL de eliminación:", deleteUrl);
          
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
          
          console.log("🔍 DEBUG: Respuesta de eliminación:", response.data);
        }

        await fetchData();
        alert("Archivo eliminado exitosamente");
      } catch (error) {
        console.error('Error eliminando el archivo:', error);
        console.error('Error details:', error.response?.data);
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
