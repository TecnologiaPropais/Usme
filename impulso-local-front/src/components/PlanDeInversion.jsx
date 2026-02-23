import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import DatosTab from './PlanDeInversion/DatosTab';
import DiagnosticoTab from './PlanDeInversion/DiagnosticoTab';
import PropuestaMejoraTab from './PlanDeInversion/PropuestaMejoraTab'; // Nuevo componente
import CapacitacionTab from './PlanDeInversion/CapacitacionTab';
import ValidacionesTab from './PlanDeInversion/ValidacionesTab';
import FormulacionTab from './PlanDeInversion/FormulacionTab';
import FormulacionProvTab from './PlanDeInversion/FormulacionProvTab';
import InfoBancariaTab from './PlanDeInversion/InfoBancariaTab';
import AnexosTab from './PlanDeInversion/AnexosTab';
import AnexosV2Tab from './PlanDeInversion/AnexosV2Tab';
import EjecucionTab from './PlanDeInversion/EjecucionTab'; // Nuevo componente
import EncuestaSalidaTab from './PlanDeInversion/EncuestaSalidaTab';
import GenerarFichaTab from './PlanDeInversion/GenerarFichaTab';
import './PlanDeInversion/PlanDeInversion.css'; // Archivo CSS para estilos personalizados

export default function PlanDeInversion() {
  const { id } = useParams(); // ID del registro de caracterización
  const [activeTab, setActiveTab] = useState('Datos');
  const [hasDiagnostico, setHasDiagnostico] = useState(false);
  const [checkingDiagnostico, setCheckingDiagnostico] = useState(true);

  // Verificar si existe un diagnóstico realizado
  useEffect(() => {
    const checkDiagnostico = async () => {
      setCheckingDiagnostico(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setCheckingDiagnostico(false);
          return;
        }

        const response = await axios.get(
          `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/records?caracterizacion_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Si hay al menos un registro, existe diagnóstico
        setHasDiagnostico(response.data && response.data.length > 0);
      } catch (error) {
        console.error("Error verificando diagnóstico:", error);
        setHasDiagnostico(false);
      } finally {
        setCheckingDiagnostico(false);
      }
    };

    if (id) {
      checkDiagnostico();
    }
  }, [id]);

  return (
    <div className="content-wrapper">
      <section className="content-header">
      </section>
      <section className="content">
        <div className="plan-de-inversion-container">
          {/* Pestañas Verticales */}
          <div className="plan-de-inversion-tabs-sidebar">
            <ul className="nav nav-pills flex-column">
              <li className={`nav-item ${activeTab === 'Datos' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('Datos');
                  }}
                >
                  <i className="fas fa-database"></i> Datos
                </a>
              </li>
              <li className={`nav-item ${activeTab === 'PropuestaMejora' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('PropuestaMejora');
                  }}
                >
                  <i className="fas fa-lightbulb"></i> Propuesta de Mejora
                </a>
              </li>
              <li className={`nav-item ${activeTab === 'Diagnostico' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('Diagnostico');
                  }}
                >
                  <i className="fas fa-stethoscope"></i> Diagnóstico
                </a>
              </li>
              <li className={`nav-item ${activeTab === 'Capacitacion' ? 'active' : ''} ${!hasDiagnostico ? 'disabled' : ''}`}>
                <a
                  href="#"
                  className={`nav-link ${!hasDiagnostico ? 'disabled-link' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (hasDiagnostico) {
                      setActiveTab('Capacitacion');
                    } else {
                      alert('Debe completar el Diagnóstico antes de acceder a Capacitación');
                    }
                  }}
                  title={!hasDiagnostico ? 'Complete el Diagnóstico para habilitar esta sección' : ''}
                >
                  <i className="fas fa-chalkboard-teacher"></i> Capacitación
                  {!hasDiagnostico && <i className="fas fa-lock ml-2" style={{ fontSize: '0.8em', marginLeft: '8px' }}></i>}
                </a>
              </li>
              <li className={`nav-item ${activeTab === 'Validaciones' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('Validaciones');
                  }}
                >
                  <i className="fas fa-check-double"></i> Validaciones
                </a>
              </li>
              {/* <li className={`nav-item ${activeTab === 'Formulacion' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('Formulacion');
                  }}
                >
                  <i className="fas fa-tasks"></i> Formulación
                </a>
              </li> */}
              <li className={`nav-item ${activeTab === 'FormulacionProv' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('FormulacionProv');
                  }}
                >
                  <i className="fas fa-handshake"></i> Formulación con Proveedores
                </a>
              </li>
              {/*<li className={`nav-item ${activeTab === 'InfoBancaria' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('InfoBancaria');
                  }}
                >
                  <i className="fas fa-credit-card"></i> Información Bancaria
                </a>
              </li>*/}
              {/*<li className={`nav-item ${activeTab === 'Anexos' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('Anexos');
                  }}
                >
                  <i className="fas fa-paperclip"></i> Anexos V1
                </a>
              </li>*/}
              <li className={`nav-item ${activeTab === 'AnexosV2' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('AnexosV2');
                  }}
                >
                  <i className="fas fa-file-upload"></i> Anexos
                </a>
              </li>
              {/*<li className={`nav-item ${activeTab === 'Ejecucion' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('Ejecucion');
                  }}
                >
                  <i className="fas fa-play-circle"></i> Ejecución
                </a>
              </li>*/}
              {/*<li className={`nav-item ${activeTab === 'EncuestaSalida' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('EncuestaSalida');
                  }}
                >
                  <i className="fas fa-poll"></i> Encuesta de Salida
                </a>
              </li>*/}
              <li className={`nav-item ${activeTab === 'GenerarFicha' ? 'active' : ''}`}>
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('GenerarFicha');
                  }}
                >
                  <i className="fas fa-file-pdf"></i> Generar Ficha en PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Contenido de las pestañas */}
          <div className="plan-de-inversion-tab-content">
            {activeTab === 'Datos' && <DatosTab id={id} />}
            {activeTab === 'PropuestaMejora' && <PropuestaMejoraTab id={id} />}
            {activeTab === 'Diagnostico' && <DiagnosticoTab id={id} onDiagnosticoSaved={() => {
              // Recargar verificación de diagnóstico cuando se guarda
              const checkDiagnostico = async () => {
                try {
                  const token = localStorage.getItem("token");
                  if (token) {
                    const response = await axios.get(
                      `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/records?caracterizacion_id=${id}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setHasDiagnostico(response.data && response.data.length > 0);
                  }
                } catch (error) {
                  console.error("Error verificando diagnóstico:", error);
                }
              };
              checkDiagnostico();
            }} />}
            {activeTab === 'Capacitacion' && hasDiagnostico && <CapacitacionTab id={id} />}
            {activeTab === 'Capacitacion' && !hasDiagnostico && (
              <div className="alert alert-warning">
                <h5>Capacitación no disponible</h5>
                <p>Debe completar el Diagnóstico antes de acceder a la sección de Capacitación.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveTab('Diagnostico')}
                >
                  Ir a Diagnóstico
                </button>
              </div>
            )}
            {activeTab === 'Validaciones' && <ValidacionesTab id={id} />}
            {/* {activeTab === 'Formulacion' && <FormulacionTab id={id} />} */}
            {activeTab === 'FormulacionProv' && <FormulacionProvTab id={id} />}
            {activeTab === 'InfoBancaria' && <InfoBancariaTab id={id} />}
            {/* {activeTab === 'Anexos' && <AnexosTab id={id} />} */}
            {activeTab === 'AnexosV2' && <AnexosV2Tab id={id} />}
            {activeTab === 'Ejecucion' && <EjecucionTab id={id} />}
            {activeTab === 'EncuestaSalida' && <EncuestaSalidaTab id={id} />}
            {activeTab === 'GenerarFicha' && <GenerarFichaTab id={id} />}
          </div>
        </div>
      </section>
    </div>
  );
}
