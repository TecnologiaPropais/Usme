import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import config from '../../config';

export default function DiagnosticoTab({ id, onDiagnosticoSaved }) {
  const initialQuestions = [
    {
      component: "Conectándome con mi mercado",
      questions: [
        {
          text: "¿Ha desarrollado estrategias para conseguir nuevos clientes?",
          field: "estrategias_nuevos_clientes",
        },
        {
          text: "¿Ha analizado sus productos/servicios con relación a su competencia?",
          field: "productos_vs_competencia",
        },
        {
          text: "¿Mis productos/servicios tienen ventas permanentes?",
          field: "ventas_permanentes",
        },
        {
          text: "¿Ha perdido alguna oportunidad de negocio o venta a causa del servicio al cliente?",
          field: "oportunidades_perdidas",
        },
      ],
    },
    {
      component: "Conexiones digitales",
      questions: [
        { text: "¿Ha realizado ventas por internet?", field: "ventas_internet" },
        { text: "¿Utiliza Whatsapp Business?", field: "whatsapp_business" },
        { text: "¿Cuenta con Red social Facebook?", field: "facebook" },
        { text: "¿Cuenta con Red social Instagram?", field: "instagram" },
        { text: "¿Cuenta con Red social TiKToK?", field: "tiktok" },
      ],
    },
    {
      component: "Tu empresa, tu apuesta verde",
      questions: [
        {
          text: "¿Su empresa aplica medidas con enfoque ambiental: ejemplo ahorro de agua, energía, recuperación de residuos, reutilización de desechos, etc.?",
          field: "enfoque_ambiental",
        },
      ],
    },
    {
      component: "Transición a la sostenibilidad",
      questions: [
        {
          text: "¿Su negocio aplica acciones concretas para reducir la generación de residuos en sus procesos productivos o comerciales?",
          field: "reduccion_residuos",
        },
        {
          text: "¿Ha evaluado oportunidades para transformar residuos en nuevos productos o fuentes de ingreso?",
          field: "transformacion_residuos",
        },
      ],
    },
    {
      component: "Alístate para crecer: formalizando mi negocio",
      questions: [
        {
          text: "¿Su negocio cuenta con  registros empresariales obligatorios vigentes (Cámara de Comercio, RUT, etc.)?",
          field: "registros_empresariales",
        },
        {
          text: "¿Conoce los beneficios concretos que la formalización puede traerle para acceder a créditos, programas o alianzas?",
          field: "beneficios_formalizacion",
        },
      ],
    },
    {
      component: "Conectándome con mis finanzas",
      questions: [
        {
          text: "¿Registra de manera organizada todas las ventas, gastos e ingresos de su negocio?",
          field: "registro_ventas_gastos",
        },
        {
          text: "¿Realiza control periódico de inventarios para evitar pérdidas o sobrecostos?",
          field: "control_inventarios",
        },
        {
          text: "¿Conserva y organiza facturas, recibos y soportes contables de su negocio?",
          field: "soportes_contables",
        },
      ],
    },
    {
      component: "Vitrinas que venden solas",
      questions: [
        {
          text: "¿Organiza los productos estratégicamente para estimular la compra?",
          field: "organizacion_productos",
        },
      ],
    },
    {
      component: "Fortaleciendo mis capacidades como líder 4.0",
      questions: [
        {
          text: "¿Aplica habilidades de comunicación, motivación y toma de decisiones con su equipo?",
          field: "habilidades_liderazgo",
        },
        {
          text: "¿Considera que fortalecer su liderazgo puede mejorar los resultados de su negocio?",
          field: "fortalecer_liderazgo",
        },
      ],
    },
  ];


  const questionToCodesMapping = {
    "¿Ha desarrollado estrategias para conseguir nuevos clientes?": ["343"],
    "¿Ha analizado sus productos/servicios con relación a su competencia?": ["343"],
    "¿Mis productos/servicios tienen ventas permanentes?": ["343"],
    "¿Ha perdido alguna oportunidad de negocio o venta a causa del servicio al cliente?": ["343"],
    "¿Ha realizado ventas por internet?": ["344"],
    "¿Utiliza Whatsapp Business?": ["344"],
    "¿Cuenta con Red social Facebook?": ["344"],
    "¿Cuenta con Red social Instagram?": ["344"],
    "¿Cuenta con Red social TiKToK?": ["344"],
    "¿Su empresa aplica medidas con enfoque ambiental: ejemplo ahorro de agua, energía, recuperación de residuos, reutilización de desechos, etc.?": ["345"],
    "¿Su negocio aplica acciones concretas para reducir la generación de residuos en sus procesos productivos o comerciales?": ["346"],
    "¿Ha evaluado oportunidades para transformar residuos en nuevos productos o fuentes de ingreso?": ["346"],
    "¿Su negocio cuenta con  registros empresariales obligatorios vigentes (Cámara de Comercio, RUT, etc.)?": ["347"],
    "¿Conoce los beneficios concretos que la formalización puede traerle para acceder a créditos, programas o alianzas?": ["347"],
    "¿Registra de manera organizada todas las ventas, gastos e ingresos de su negocio?": ["348"],
    "¿Realiza control periódico de inventarios para evitar pérdidas o sobrecostos?": ["348"],
    "¿Conserva y organiza facturas, recibos y soportes contables de su negocio?": ["348"],
    "¿Organiza los productos estratégicamente para estimular la compra?": ["349"],
    "¿Aplica habilidades de comunicación, motivación y toma de decisiones con su equipo?": ["350"],
    "¿Considera que fortalecer su liderazgo puede mejorar los resultados de su negocio?": ["350"],
  };

  const [answers, setAnswers] = useState({});
  const [recordIds, setRecordIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Historial
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Lógica invertida
  // Las preguntas invertidas son aquellas donde responder "Sí" indica un problema
  // y debe activar la cápsula (puntaje = 0 cuando se responde "Sí")
  const isInvertedQuestion = (questionText) => {
    const trimmed = questionText.trim();
    return (
      trimmed ===
        "¿Ha perdido alguna oportunidad de negocio o venta a causa del servicio al cliente?" ||
      trimmed ===
        "¿Considera que fortalecer su liderazgo puede mejorar los resultados de su negocio?"
    );
  };

  // Puntaje
  const getScoreFromState = (question) => {
    const trimmed = question.text.trim();
    const currentValue = answers[trimmed];
    if (isInvertedQuestion(trimmed)) {
      // Invertida: true => 0, false => 1
      return currentValue ? 0 : 1;
    } else {
      // Normal: true => 1, false => 0
      return currentValue ? 1 : 0;
    }
  };

  // Fetch Diagnóstico
  useEffect(() => {
    const fetchExistingRecords = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No se encontró el token de autenticación");
          return;
        }

        // Ajustado a microempresa-local-back
        const response = await axios.get(
          `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/records?caracterizacion_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const records = response.data.reduce(
          (acc, record) => {
            acc.answers[record.Pregunta.trim()] = record.Respuesta;
            acc.recordIds[record.Pregunta.trim()] = record.id;
            return acc;
          },
          { answers: {}, recordIds: {} }
        );

        setAnswers(records.answers);
        setRecordIds(records.recordIds);
      } catch (error) {
        console.error("Error obteniendo registros existentes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingRecords();
  }, [id]);

  const handleAnswerChange = (questionText, value) => {
    setAnswers((prev) => ({ ...prev, [questionText.trim()]: value }));
  };

  // Calcula el promedio de cada componente
  const calculateAverage = (questions) => {
    const totalScore = questions.reduce((sum, q) => sum + getScoreFromState(q), 0);
    return (totalScore / questions.length).toFixed(2);
  };

  // Guardar Diagnóstico y recommended_codes
  const handleSubmit = async () => {
    if (saving) {
      return;
    }

    // Validar que todas las preguntas tengan respuesta
    const unansweredQuestions = [];
    for (const section of initialQuestions) {
      for (const question of section.questions) {
        const questionText = question.text.trim();
        if (answers[questionText] === undefined) {
          unansweredQuestions.push(questionText);
        }
      }
    }

    if (unansweredQuestions.length > 0) {
      const message = `Por favor responde todas las preguntas antes de guardar.\n\nPreguntas sin responder (${unansweredQuestions.length}):\n${unansweredQuestions.slice(0, 5).join('\n')}${unansweredQuestions.length > 5 ? `\n... y ${unansweredQuestions.length - 5} más` : ''}`;
      alert(message);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró el token de autenticación");
        setSaving(false);
        return;
      }
      const userId = localStorage.getItem("id");
      if (!userId) {
        alert("No se encontró el ID de usuario");
        setSaving(false);
        return;
      }
      if (!id) {
        alert("No se encontró el ID de caracterización");
        setSaving(false);
        return;
      }

      const newRecordIds = { ...recordIds };
      const errors = [];
      const savedResults = [];

      // 1) Primero, obtener todos los registros existentes para esta caracterización
      let existingRecords = [];
      try {
        const existingResponse = await axios.get(
          `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/records?caracterizacion_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        existingRecords = existingResponse.data || [];
        
        // Mapear registros existentes por pregunta
        existingRecords.forEach(record => {
          const pregunta = record.Pregunta?.trim();
          if (pregunta && record.id) {
            newRecordIds[pregunta] = record.id;
          }
        });
      } catch (error) {
        // Error obteniendo registros existentes, continuar con creación
      }

      // 2) Guardar/actualizar Diagnóstico (pi_diagnostico_cap) - EN PARALELO
      // Preparar todas las peticiones
      const requestPromises = [];
      const questionsToSave = [];
      
      for (const section of initialQuestions) {
        for (const question of section.questions) {
          const questionText = question.text.trim();
          const currentAnswer = answers[questionText];

          const requestData = {
            caracterizacion_id: id,
            Componente: section.component,
            Pregunta: question.text.trim(),
            Respuesta: currentAnswer,
            Puntaje: isInvertedQuestion(question.text.trim())
              ? currentAnswer
                ? 0
                : 1
              : currentAnswer
              ? 1
              : 0,
            user_id: userId,
          };

          const questionKey = question.text.trim();
          const recordId = newRecordIds[questionKey];
          const isUpdate = !!recordId;
          const url = isUpdate
            ? `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/record/${recordId}`
            : `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/record`;

          questionsToSave.push({ questionKey, isUpdate, recordId, url, requestData });
        }
      }

      // Crear todas las peticiones en paralelo
      requestPromises.push(...questionsToSave.map(({ questionKey, isUpdate, recordId, url, requestData }) => {
        return (async () => {
          try {
            let response;
            if (isUpdate) {
              response = await axios.put(url, requestData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
              response = await axios.post(url, requestData, { headers: { Authorization: `Bearer ${token}` } });
            }

            const responseId = response.data?.record?.id || response.data?.id;
            if (responseId) {
              return { success: true, question: questionKey, data: response.data, id: responseId };
            } else {
              throw new Error('No se recibió ID en la respuesta');
            }
          } catch (error) {
            throw { question: questionKey, error: error.response?.data || error.message, type: isUpdate ? 'update' : 'create' };
          }
        })();
      }));

      // Ejecutar todas las peticiones en paralelo
      const results = await Promise.allSettled(requestPromises);
      
      // Procesar resultados
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const { questionKey } = questionsToSave[i];
        
        if (result.status === 'fulfilled') {
          const responseId = result.value.id;
          newRecordIds[questionKey] = responseId;
          savedResults.push(result.value);
        } else {
          errors.push(result.reason);
        }
      }
      
      // Verificar si hubo errores
      const failedRequests = results.filter(r => r.status === 'rejected');
      if (failedRequests.length > 0) {
        const errorMessages = failedRequests.map(r => r.reason?.response?.data?.message || r.reason?.message || 'Error desconocido').join('\n');
        alert(`Error al guardar algunos registros:\n${errorMessages}`);
        setSaving(false);
        return;
      }

      // Verificar en el servidor qué se guardó realmente
      const totalQuestions = initialQuestions.reduce((sum, section) => sum + section.questions.length, 0);
      let serverRecordsCount = 0;
      try {
        const verifyResponse = await axios.get(
          `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/records?caracterizacion_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const savedRecords = verifyResponse.data || [];
        serverRecordsCount = savedRecords.length;
        
        if (serverRecordsCount < totalQuestions) {
          alert(`⚠️ Advertencia: Solo se guardaron ${serverRecordsCount} de ${totalQuestions} preguntas en la base de datos.\n\nPor favor, intenta guardar nuevamente. Si el problema persiste, contacta al administrador.`);
          setSaving(false);
          return;
        }
      } catch (verifyError) {
        // Error verificando, continuar
      }

      setRecordIds(newRecordIds);

      // 2) Calcular los códigos recomendados (puntaje = 0)
      const triggeredCodes = [];
      for (const section of initialQuestions) {
        for (const question of section.questions) {
          const score = getScoreFromState(question);
          if (score === 0) {
            const questionText = question.text.trim();
            if (questionToCodesMapping[questionText]) {
              questionToCodesMapping[questionText].forEach((code) => {
                if (!triggeredCodes.includes(code)) {
                  triggeredCodes.push(code);
                }
              });
            }
          }
        }
      }

      // Agregar cápsulas obligatorias (341, 342, 351)
      const mandatoryCodes = ["341", "342", "351"];
      mandatoryCodes.forEach((code) => {
        if (!triggeredCodes.includes(code)) {
          triggeredCodes.push(code);
        }
      });

      // 3) Guardar recommended_codes en pi_capacitacion (como texto JSON)
      try {
        await upsertRecommendedCodes(token, id, userId, triggeredCodes);
      } catch (error) {
        // Error guardando códigos recomendados (no crítico), continuar
      }

      alert("Diagnóstico guardado exitosamente");
      
      // Llamar callback si existe para notificar que se guardó el diagnóstico
      if (onDiagnosticoSaved) {
        onDiagnosticoSaved();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Error desconocido al guardar el diagnóstico";
      
      alert(`Error al guardar el diagnóstico:\n${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // upsert recommended_codes
  const upsertRecommendedCodes = async (token, caracterizacion_id, userId, codesArray) => {
    try {
      const url = `${config.urls.inscriptions.pi}/tables/pi_capacitacion/records?caracterizacion_id=${caracterizacion_id}`;
      
      // Buscar si hay registro en pi_capacitacion
      const resGet = await axios.get(
        url,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const codesString = JSON.stringify(codesArray);

      if (!resGet.data || resGet.data.length === 0) {
        // crear
        const newRecord = {
          caracterizacion_id,
          user_id: userId,
          recommended_codes: codesString,
        };
        const createUrl = `${config.urls.inscriptions.pi}/tables/pi_capacitacion/record`;
        
        await axios.post(
          createUrl,
          newRecord,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // actualizar
        const existing = resGet.data[0];
        const recordId = existing.id;
        
        const updatedRecord = {
          ...existing,
          user_id: userId,
          recommended_codes: codesString,
        };
        const updateUrl = `${config.urls.inscriptions.pi}/tables/pi_capacitacion/record/${recordId}`;
        
        await axios.put(
          updateUrl,
          updatedRecord,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      throw error;
    }
  };

  // Historial de TODOS los records del Diagnóstico
  const fetchAllRecordsHistory = async () => {
    if (Object.keys(recordIds).length === 0) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const token = localStorage.getItem("token");
      const recordIdValues = Object.values(recordIds);

      const historyPromises = recordIdValues.map((rid) =>
        axios.get(
          `${config.urls.inscriptions.pi}/tables/pi_diagnostico_cap/record/${rid}/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      );

      const historyResponses = await Promise.all(historyPromises);
      let combinedHistory = [];
      historyResponses.forEach((response) => {
        if (response.data.history && Array.isArray(response.data.history)) {
          combinedHistory = combinedHistory.concat(response.data.history);
        }
      });

      combinedHistory.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setHistory(combinedHistory);
      setHistoryLoading(false);
    } catch (error) {
      console.error("Error obteniendo el historial:", error);
      setHistoryError("Error obteniendo el historial");
      setHistoryLoading(false);
    }
  };

  const handleOpenHistoryModal = async () => {
    await fetchAllRecordsHistory();
    setShowHistoryModal(true);
  };

  // Render
  return (
    <div>
      {/* <h3>Diagnóstico</h3> */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table className="table table-bordered rounded-table">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Pregunta</th>
                <th>Sí</th>
                <th>No</th>
                <th>Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {initialQuestions.map((section) => (
                <React.Fragment key={section.component}>
                  {section.questions.map((question, index) => {
                    const questionText = question.text.trim();
                    const isAnswered = answers[questionText] !== undefined;
                    return (
                      <tr 
                        key={question.text}
                        style={!isAnswered ? { backgroundColor: '#fff3cd' } : {}}
                      >
                        {index === 0 && (
                          <td rowSpan={section.questions.length}>
                            {section.component}
                          </td>
                        )}
                        <td>
                          {question.text}
                          {!isAnswered && (
                            <span style={{ color: '#856404', marginLeft: '8px', fontSize: '0.9em' }}>
                              ⚠️ Sin responder
                            </span>
                          )}
                        </td>
                        <td className="td-radio">
                          <input
                            type="radio"
                            name={question.text}
                            checked={answers[questionText] === true}
                            onChange={() => handleAnswerChange(question.text, true)}
                            disabled={localStorage.getItem('role_id') === '3'}
                          />
                        </td>
                        <td className="td-radio">
                          <input
                            type="radio"
                            name={question.text}
                            checked={answers[questionText] === false}
                            onChange={() => handleAnswerChange(question.text, false)}
                            disabled={localStorage.getItem('role_id') === '3'}
                          />
                        </td>
                        <td className="td-puntaje">{getScoreFromState(question)}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan="4" className="text-end">
                      Promedio del componente:
                    </td>
                    <td className="td-puntaje">{calculateAverage(section.questions)}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {localStorage.getItem('role_id') !== '3' && (
            <button 
              className="btn btn-primary btn-diagnostico" 
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          )}

          {Object.keys(recordIds).length > 0 && (
            <button
              type="button"
              className="btn btn-info btn-sm mt-3 ml-2 btn-historial-right"
              onClick={handleOpenHistoryModal}
            >
              Ver Historial de Cambios
            </button>
          )}
        </>
      )}

      {/* Modal de Historial */}
      {showHistoryModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-lg"
            style={{ maxWidth: "90%" }}
            role="document"
          >
            <div
              className="modal-content"
              style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Historial de Cambios</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowHistoryModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ overflowY: "auto" }}>
                {historyError && (
                  <div className="alert alert-danger">{historyError}</div>
                )}
                {historyLoading ? (
                  <div>Cargando historial...</div>
                ) : history.length > 0 ? (
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    <table className="table table-striped table-bordered table-sm">
                      <thead className="thead-light">
                        <tr>
                          <th>ID Usuario</th>
                          <th>Usuario</th>
                          <th>Fecha del Cambio</th>
                          <th>Tipo de Cambio</th>
                          <th>Campo</th>
                          <th>Valor Antiguo</th>
                          <th>Valor Nuevo</th>
                          <th>Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item.id}>
                            <td>{item.user_id}</td>
                            <td>{item.username}</td>
                            <td>{new Date(item.created_at).toLocaleString()}</td>
                            <td>{item.change_type}</td>
                            <td>{item.field_name || "-"}</td>
                            <td>{item.old_value || "-"}</td>
                            <td>{item.new_value || "-"}</td>
                            <td>{item.description || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No hay historial de cambios.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowHistoryModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showHistoryModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

DiagnosticoTab.propTypes = {
  id: PropTypes.string.isRequired,
  onDiagnosticoSaved: PropTypes.func,
};

