import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DatosTab from './PlanDeInversion/DatosTab';
import DiagnosticoTab from './PlanDeInversion/DiagnosticoTab';
import PropuestaMejoraTab from './PlanDeInversion/PropuestaMejoraTab'; // Nuevo componente
import CapacitacionTab from './PlanDeInversion/CapacitacionTab';
import ValidacionesTab from './PlanDeInversion/ValidacionesTab';
import FormulacionTab from './PlanDeInversion/FormulacionTab';
import FormulacionProvTab from './PlanDeInversion/FormulacionProvTab';
import InfoBancariaTab from './PlanDeInversion/InfoBancariaTab';
import AnexosTab from './PlanDeInversion/AnexosTab';
import EjecucionTab from './PlanDeInversion/EjecucionTab'; // Nuevo componente
import EncuestaSalidaTab from './PlanDeInversion/EncuestaSalidaTab';
import GenerarFichaTab from './PlanDeInversion/GenerarFichaTab';

export default function PlanDeInversion() {
  const { id } = useParams(); // ID del registro de caracterización
  const [activeTab, setActiveTab] = useState('Datos');

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <h1>Plan de Inversión - Registro {id}</h1>
      </section>
      <section className="content">
        {/* Pestañas */}
        <ul className="nav nav-tabs">
          <li className={`nav-item ${activeTab === 'Datos' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('Datos');
              }}
            >
              Datos
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
              Propuesta de Mejora
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
              Diagnóstico
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'Capacitacion' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('Capacitacion');
              }}
            >
              Capacitación
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
              Validaciones
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'Formulacion' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('Formulacion');
              }}
            >
              Formulación
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'FormulacionProv' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('FormulacionProv');
              }}
            >
              Formulación con Proveedores
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'InfoBancaria' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('InfoBancaria');
              }}
            >
              Información Bancaria
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'Anexos' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('Anexos');
              }}
            >
              Anexos
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'Ejecucion' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('Ejecucion');
              }}
            >
              Ejecución
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'EncuestaSalida' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('EncuestaSalida');
              }}
            >
              Encuesta de Salida
            </a>
          </li>
          <li className={`nav-item ${activeTab === 'GenerarFicha' ? 'active' : ''}`}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('GenerarFicha');
              }}
            >
              Generar Ficha en PDF
            </a>
          </li>
        </ul>

        {/* Contenido de las pestañas */}
        <div className="tab-content">
          {activeTab === 'Datos' && <DatosTab id={id} />}
          {activeTab === 'PropuestaMejora' && <PropuestaMejoraTab id={id} />}
          {activeTab === 'Diagnostico' && <DiagnosticoTab id={id} />}
          {activeTab === 'Capacitacion' && <CapacitacionTab id={id} />}
          {activeTab === 'Validaciones' && <ValidacionesTab id={id} />}
          {activeTab === 'Formulacion' && <FormulacionTab id={id} />}
          {activeTab === 'FormulacionProv' && <FormulacionProvTab id={id} />}
          {activeTab === 'InfoBancaria' && <InfoBancariaTab id={id} />}
          {activeTab === 'Anexos' && <AnexosTab id={id} />}
          {activeTab === 'Ejecucion' && <EjecucionTab id={id} />}
          {activeTab === 'EncuestaSalida' && <EncuestaSalidaTab id={id} />}
          {activeTab === 'GenerarFicha' && <GenerarFichaTab id={id} />}
        </div>
      </section>
    </div>
  );
}
