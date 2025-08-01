// SubsanacionPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/PublicRecordCreate.css';
import config from '../config';

function Modal({ show, onClose, message, type }) {
  if (!show) return null;

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: type === 'success' ? 'green' : 'red',
    color: 'white',
    padding: '20px',
    zIndex: 1000,
    borderRadius: '5px',
    maxWidth: '80%',
    maxHeight: '80%',
    overflowY: 'auto',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <div style={overlayStyle}></div>
      <div style={modalStyle}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
        <button onClick={handleClose} className="btn btn-light">
          Cerrar
        </button>
      </div>
    </>
  );
}

export default function SubsanacionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');

  // Lista de tipos de documentos (se puede expandir después)
  const documentTypes = [
    'Cédula de Ciudadanía',
    'RUT',
    'Certificado de Cámara de Comercio',
    'Certificado de Tradición y Libertad',
    'Certificado de Paz y Salvo',
    'Certificado de Uso de Suelo',
    'Certificado de Estabilidad Fiscal',
    'Certificado de Retención en la Fuente',
    'Certificado de ReteIVA',
    'Certificado de ReteICA',
    'Certificado de ReteFuente',
    'Certificado de ReteCree',
    'Certificado de ReteIVA',
    'Certificado de ReteICA',
    'Certificado de ReteFuente',
    'Certificado de ReteCree',
    'Otro'
  ];

  useEffect(() => {
    const fetchRecordData = async () => {
      try {
        const response = await axios.get(
          `${config.baseUrl}/inscriptions/tables/inscription_caracterizacion/record/${id}/public`
        );
        setRecord(response.data.record);
        setLoading(false);
      } catch (error) {
        console.error('Error obteniendo los datos del registro:', error);
        const errorMessage = error.response?.status === 404 
          ? 'Registro no encontrado. Verifica que el enlace sea correcto.'
          : error.response?.status === 403
          ? 'Acceso denegado. Verifica que el enlace sea válido.'
          : 'Error obteniendo los datos del registro. Por favor, inténtalo de nuevo.';
        setModalMessage(errorMessage);
        setModalType('error');
        setShowModal(true);
        setLoading(false);
      }
    };

    fetchRecordData();
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileList([...fileList, { file: selectedFile, name: '', type: '' }]);
    }
    e.target.value = null;
  };

  const handleFileNameChange = (e, index) => {
    const updatedFileList = [...fileList];
    updatedFileList[index].name = e.target.value;
    setFileList(updatedFileList);
  };

  const handleFileTypeChange = (e, index) => {
    const updatedFileList = [...fileList];
    updatedFileList[index].type = e.target.value;
    setFileList(updatedFileList);
  };

  const handleRemoveFile = (index) => {
    const updatedFileList = [...fileList];
    updatedFileList.splice(index, 1);
    setFileList(updatedFileList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fileList.length === 0) {
      setModalMessage('Por favor, selecciona al menos un archivo para subir');
      setModalType('error');
      setShowModal(true);
      return;
    }

    // Verificar que todos los archivos tengan nombre y tipo
    const incompleteFiles = fileList.filter(file => !file.name || !file.type);
    if (incompleteFiles.length > 0) {
      setModalMessage('Por favor, completa el nombre y tipo para todos los archivos');
      setModalType('error');
      setShowModal(true);
      return;
    }

    try {
      const uploadPromises = fileList.map((fileItem) => {
        const formData = new FormData();
        const extension = fileItem.file.name.split('.').pop();
        const baseName = fileItem.name;
        const uniqueSuffix = Date.now();
        const fileNameWithExtension = `${baseName}_${uniqueSuffix}.${extension}`;
        formData.append('file', fileItem.file);
        formData.append('fileName', fileNameWithExtension);
        formData.append('fileType', fileItem.type);

        return axios.post(
          `${config.baseUrl}/inscriptions/tables/inscription_caracterizacion/record/${id}/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      });

      await Promise.all(uploadPromises);

      setModalMessage('Documentos subidos exitosamente. Su solicitud ha sido enviada para revisión.');
      setModalType('success');
      setShowModal(true);
      setFileList([]);
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      setModalMessage('Error subiendo los archivos. Por favor, inténtalo de nuevo.');
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === 'success') {
      // Redirigir a una página de confirmación o cerrar
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex">
        <aside className="sidebar-public">
          <img src="/Logo_IL.png" alt="Logo" className="sidebar-logo" />
          <div className="sidebar-text">
            <h2>Subsanación</h2>
          </div>
        </aside>
        <main className="form-wrapper">
          <div>Cargando...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex">
      <aside className="sidebar-public">
        <img src="/Logo_IL.png" alt="Logo" className="sidebar-logo" />
        <div className="sidebar-text">
          <h2>Subsanación</h2>
        </div>
      </aside>
      <main className="form-wrapper">
        <section className="form-header">
          <h1>Subsanación de Documentos</h1>
        </section>
        <section className="form-content">
          <div className="alert alert-info">
            <h5>Información del Registro</h5>
            <p><strong>Nombres:</strong> {record['Nombres'] || 'No disponible'}</p>
            <p><strong>Apellidos:</strong> {record['Apellidos'] || 'No disponible'}</p>
            <p><strong>Número de Identificación:</strong> {record['Numero de identificacion'] || 'No disponible'}</p>
            <p><strong>Correo Electrónico:</strong> {record['Correo electronico'] || 'No disponible'}</p>
          </div>

          <form onSubmit={handleSubmit} className="custom-form">
            <div className="form-group">
              <label>Seleccionar archivo para subir</label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>

            {fileList.map((fileItem, index) => {
              let displayName = fileItem.name || fileItem.file.name;
              const match = displayName.match(/^(.*)_\d{10,}(\.[^.]+)$/);
              if (match) {
                displayName = match[1] + match[2];
              }
              return (
                <div className="form-group" key={index}>
                  <label>Archivo: {displayName}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fileItem.name}
                    onChange={(e) => handleFileNameChange(e, index)}
                    placeholder="Ingresa un nombre para el archivo"
                  />
                  <select
                    className="form-control mt-2"
                    value={fileItem.type}
                    onChange={(e) => handleFileTypeChange(e, index)}
                  >
                    <option value="">-- Selecciona el tipo de documento --</option>
                    {documentTypes.map((typeOption, idx) => (
                      <option key={idx} value={typeOption}>
                        {typeOption}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-danger mt-2"
                    onClick={() => handleRemoveFile(index)}
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}

            <button type="submit" className="btn btn-primary">
              Enviar Documentos para Revisión
            </button>
          </form>
        </section>
      </main>
      <Modal
        show={showModal}
        onClose={handleModalClose}
        message={modalMessage}
        type={modalType}
      />
    </div>
  );
} 