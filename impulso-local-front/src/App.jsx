import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Aside from './components/Aside';
import Content from './components/Content';
import Footer from './components/Footer';
import Login from './components/Login';
import UsersList from './components/UsersList';
import UserAdd from './components/UserAdd';
import UserView from './components/UserView';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Inscription from './components/Inscription';
import ListTables from './components/ListTables';
import UserAddTable from './components/UserAddTable';
import DynamicTableList from './components/DynamicTableList';
import DynamicRecordEdit from './components/DynamicRecordEdit';
import DownloadZip from './components/DownloadZip';
import ProviderTableList from './components/ProviderTableList';
import PiTableList from './components/PiTableList';
import PlanDeInversion from './components/PlanDeInversion';
import PublicRecordCreate from './components/PublicRecordCreate'; // Importar el componente PublicRecordCreate
import SubsanacionPage from './components/SubsanacionPage'; // Importar el componente SubsanacionPage
import DescargaMasiva from './components/DescargaMasiva';

const REVISOR_DOCUMENTAL_ROLE_ID = '7';
const RUTAS_SOLO_EMPRESAS = ['/escritorio', '/dynamic-tables', '/plan-inversion'];

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/** Para rol 7 (Revisor documental) solo permite Escritorio y módulo Empresas. Redirige al resto a /dynamic-tables. */
function RestrictRevisorDocumental({ children }) {
  const location = useLocation();
  const roleId = localStorage.getItem('role_id');
  if (roleId !== REVISOR_DOCUMENTAL_ROLE_ID) {
    return children;
  }
  const pathname = location.pathname || '';
  const permitido = RUTAS_SOLO_EMPRESAS.some((r) => pathname === r || pathname.startsWith(r + '/'))
    || pathname.startsWith('/table/');
  if (permitido) {
    return children;
  }
  return <Navigate to="/dynamic-tables" replace />;
}

RestrictRevisorDocumental.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Ruta para /uploads que permite que el navegador maneje la solicitud */}
        <Route path="/uploads/*" element={null} />

        {/* Ruta pública para crear un registro */}
        <Route path="/table/:tableName/create-record" element={<PublicRecordCreate />} />

        {/* Ruta pública para subsanación de documentos */}
        <Route path="/subsanar/:id" element={<SubsanacionPage />} />

        {/* Rutas privadas */}
        <Route
          path="/escritorio"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <Content />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <UsersList />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios/agregar"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <UserAdd />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios/:id"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <UserView />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta para el Módulo de Inscripción */}
        <Route
          path="/inscription"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <Inscription />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta para Listar Tablas */}
        <Route
          path="/list-tables"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <ListTables />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta para agregar tablas */}
        <Route
          path="/inscriptions/create-table"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <UserAddTable />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta para listar las tablas dinámicas (módulo Empresas) */}
        <Route
          path="/dynamic-tables"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <DynamicTableList />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta para ver registros de una tabla específica */}
        <Route
          path="/table/:tableName"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <DynamicTableList />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta para editar un registro específico */}
        <Route
          path="/table/:tableName/record/:recordId"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <DynamicRecordEdit />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Nueva Ruta para las tablas de proveedores */}
        <Route
          path="/provider-tables"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <ProviderTableList />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Nueva Ruta para las tablas de Plan de Inversión */}
        <Route
          path="/pi-tables"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <PiTableList />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta para Plan de Inversión con pestañas */}
        <Route
          path="/plan-inversion/:id"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <PlanDeInversion />
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Nueva Ruta para la Descarga Masiva */}
        <Route
          path="/descarga-masiva"
          element={
            <PrivateRoute>
              <RestrictRevisorDocumental>
                <div className="wrapper">
                  <Header />
                  <Aside />
                  <div className="content-wrapper">
                    <DescargaMasiva />
                  </div>
                  <Footer />
                </div>
              </RestrictRevisorDocumental>
            </PrivateRoute>
          }
        />

        {/* Ruta catch-all para redirigir al login si no se encuentra la ruta */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}


