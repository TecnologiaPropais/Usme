import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EncuestaSalidaTab({ id }) {
  const initialQuestions = [
    {
      component: "1. PROCESO DE INSCRIPCIÓN Y SELECCIÓN",
      questions: [
        {
          text: "Se enteró del programa por:",
          options: [
            { label: "Divulgación realizada por la alcaldía local" },
            { label: "Divulgación realizada por el aliado" },
            { label: "Por un amigo / familiar / vecino" },
            { label: "Por un medio de comunicación (Radio, Tv. Canales virtuales)" },
            { label: "Otro. ¿Cuál?", openEnded: true }
          ]
        },
        {
          text: "Se inscribió de manera:",
          options: [
            { label: "Virtual" },
            { label: "Presencial en la alcaldía" }
          ]
        },
        {
          text: "El proceso de ingreso a la plataforma para el proceso de inscripción fue:",
          options: [
            { label: "Fácil" },
            { label: "Difícil ¿Por qué?", openEnded: true }
          ]
        },
        {
          text: "El proceso de inscripción para Ud. fue",
          options: [
            { label: "Gratuito, lo hice yo mismo" },
            { label: "Tuve que pagar para que me ayudaran a realizarlo." }
          ]
        },
        {
          text: "Los documentos que solicitan en la inscripción considero que fueron:",
          options: [
            { label: "Los adecuados, fáciles de conseguir" },
            { label: "Fueron excesivos, casi no pude conseguirlos" }
          ]
        },
        {
          text: "Una vez terminó el proceso de inscripción la comunicación virtual para iniciar el proceso fue:",
          options: [
            { label: "Inmediata" },
            { label: "A la semana de haberme inscrito" },
            { label: "A las 2-3 semanas de haberme inscrito" },
            { label: "Fue mayor a 3 semanas" }
          ]
        },
        {
          text: "Respecto al proceso de inscripción en que considera que podemos mejorar?",
          openEnded: true
        }
      ]
    },
    {
      component: "2. PROCESO DE FORMACION",
      questions: [
        {
          text: "Considero que el proceso de formación:",
          options: [
            { label: "Me fue útil y práctico" },
            { label: "Me fue indiferente" },
            { label: "No me generó ningún valor" }
          ]
        },
        {
          text: "Cuál es su percepción sobre los contenidos de las capsulas de formación:",
          options: [
            { label: "Muy buenos" },
            { label: "Buenos" },
            { label: "Regulares" },
            { label: "Malos" },
            { label: "Muy Malos" }
          ]
        },
        {
          text: "¿Considera que los módulos que le indicó el asesor eran los indicados para el crecimiento de su empresa?",
          options: [
            { label: "Si" },
            { label: "No" }
          ]
        },
        {
          text: "En que considera que el proceso de formación puede mejorar?",
          openEnded: true
        }
      ]
    },
    {
      component: "3. ACOMPAÑAMIENTO EN LA FORMULACIÓN DEL PLAN DE INVERSIÓN Y DE SU IMPLEMENTACIÓN",
      questions: [
        {
          text: "¿Cómo fue el acompañamiento y la resolución de inquietudes que le brindó su asesor experto?",
          options: [
            { label: "Muy bueno" },
            { label: "Bueno" },
            { label: "Regular" },
            { label: "Malo" },
            { label: "Muy Malo" }
          ]
        },
        {
          text: "Considera que el asesor aportó a la idea que usted tenia del plan de inversión?",
          options: [
            { label: "Si" },
            { label: "No" }
          ]
        }
      ]
    },
    {
      component: "4. PROCESO DE CAPITALIZACIÓN",
      questions: [
        {
          text: "Cómo califica la asesoría y el acompañamiento brindado en el proceso de capitalización del programa:",
          options: [
            { label: "Muy bueno" },
            { label: "Bueno" },
            { label: "Regular" },
            { label: "Malo" },
            { label: "Muy Malo" }
          ]
        },
        {
          text: "El trámite de expedición de la póliza con la aseguradora le pareció:",
          options: [
            { label: "Muy bueno" },
            { label: "Bueno" },
            { label: "Regular" },
            { label: "Malo" },
            { label: "Muy malo" }
          ]
        },
        {
          text: "Respecto a la entrega de los soportes con los cuales Ud. demostró el uso de la capitalización, le pareció:",
          options: [
            { label: "Muy difícil" },
            { label: "Difícil" },
            { label: "Normal" },
            { label: "Fácil" },
            { label: "Muy fácil" }
          ]
        }
      ]
    },
    {
      component: "5. ENCUENTROS COMERCIALES",
      questions: [
        {
          text: "Participó usted de las ferias o encuentros comerciales de la ruta?",
          options: [
            { label: "Si" },
            { label: "No" }
          ],
          openEndedIfNo: true
        },
        {
          text: "Como le pareció la experiencia de participar en el encuentro comercial?",
          options: [
            { label: "Muy buena" },
            { label: "Buena" },
            { label: "Regular" },
            { label: "Mala" },
            { label: "Muy mala" }
          ]
        },
        {
          text: "Piensa que la experiencia de la feria le permitió conocer un escenario nuevo de ventas?",
          options: [
            { label: "Si" },
            { label: "No" }
          ]
        },
        {
          text: "¿Aproximadamente cuanto vendió en la feria?",
          openEnded: true
        }
      ]
    },
    {
      component: "6. VARIOS",
      questions: [
        {
          text: "¿Adicional al recurso otorgado para el cumplimiento del programa por parte de la alcaldía, conoció usted al profesional encargado por parte de la alcaldía para el seguimiento de su proceso?",
          options: [
            { label: "Si" },
            { label: "No" }
          ]
        },
        {
          text: "¿Conoce la oferta de programas beneficios que tiene para usted su alcaldía?",
          options: [
            { label: "Si" },
            { label: "No" }
          ]
        },
        {
          text: "¿Le gustaría que este tipo de programas continuara?",
          options: [
            { label: "Si" },
            { label: "No" }
          ]
        },
        {
          text: "¿Con cuántos empleos (Incluyéndose) cerró su participación en el programa?",
          openEnded: true
        },
        {
          text: "En general que le mejoraría",
          openEnded: true
        }
      ]
    }
  ];

  const [recordsMap, setRecordsMap] = useState({});
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [caracterizacionData, setCaracterizacionData] = useState({});

  useEffect(() => {
    const fetchExistingRecords = async () => {
      setLoadingState(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No se encontró el token de autenticación");
          setLoadingState(false);
          return;
        }

        // Obtener registros existentes de la encuesta
        const response = await axios.get(
          `https://impulso-local-back.onrender.com/api/inscriptions/pi/tables/pi_encuesta_salida/records?caracterizacion_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newMap = {};
        response.data.forEach((rec) => {
          const comp = rec.componente ? rec.componente.trim() : "";
          const preg = rec.pregunta ? rec.pregunta.trim() : "";
          const resp = rec.respuesta ? rec.respuesta.trim() : "";
          // Para preguntas abiertas sin opción, la clave es comp|preg
          // Para preguntas con opción, la clave es comp|preg|resp (si seleccionada)
          // Pero si es openEnded (dentro de una opción), también guardamos su respuesta
          // ya se hace: const key = resp ? comp + "|" + preg + "|" + resp : comp + "|" + preg;

          // Ajuste: para mostrar siempre la respuesta en openEnded:
          // Si es una pregunta abierta sin opciones, resp debería tener su texto.
          // Si es una opción openEnded, ya se imprime line + ": " + rec.respuesta
          const key = rec.seleccion === false && resp && !initialQuestions
            .find(s => s.component === comp)?.questions
            .find(qq => qq.text === preg)?.options 
            ? comp + "|" + preg
            : (resp ? comp + "|" + preg + "|" + resp : comp + "|" + preg);

          newMap[key] = {
            respuesta: resp,
            seleccion: rec.seleccion,
            record_id: rec.id
          };
        });
        setRecordsMap(newMap);

        // Ahora obtener datos de inscription_caracterizacion
        const carResponse = await axios.get(
          `https://impulso-local-back.onrender.com/api/inscriptions/tables/inscription_caracterizacion/record/${id}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCaracterizacionData(carResponse.data.record || {});
      } catch (error) {
        console.error("Error obteniendo registros existentes:", error);
        setErrorState("Error obteniendo los datos de la encuesta.");
      } finally {
        setLoadingState(false);
      }
    };

    fetchExistingRecords();
  }, [id]);

  const handleOptionChange = (component, question, optionLabel, value) => {
    const key = component + "|" + question + "|" + (optionLabel || "");
    setRecordsMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], respuesta: prev[key]?.respuesta || optionLabel || "", seleccion: value, record_id: prev[key]?.record_id }
    }));
  };

  const handleOpenEndedChange = (component, question, value) => {
    const key = component + "|" + question;
    setRecordsMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], respuesta: value || "", seleccion: false, record_id: prev[key]?.record_id }
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró el token de autenticación");
        return;
      }

      const userId = localStorage.getItem('id');
      const requests = [];

      for (const section of initialQuestions) {
        for (const q of section.questions) {
          if (q.options && q.options.length > 0) {
            for (const opt of q.options) {
              const key = section.component + "|" + q.text + "|" + opt.label;
              const rec = recordsMap[key] || { respuesta: opt.label, seleccion: false };
              const requestData = {
                caracterizacion_id: id,
                componente: section.component,
                pregunta: q.text,
                respuesta: rec.respuesta || opt.label || "",
                seleccion: rec.seleccion === true,
                user_id: userId
              };

              if (rec.record_id) {
                const updatePromise = axios.put(
                  `https://impulso-local-back.onrender.com/api/inscriptions/pi/tables/pi_encuesta_salida/record/${rec.record_id}`,
                  requestData,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                requests.push(updatePromise);
              } else {
                const createPromise = axios.post(
                  `https://impulso-local-back.onrender.com/api/inscriptions/pi/tables/pi_encuesta_salida/record`,
                  requestData,
                  { headers: { Authorization: `Bearer ${token}` } }
                ).then(res => {
                  setRecordsMap(prev => ({
                    ...prev,
                    [key]: { ...prev[key], record_id: res.data.id }
                  }));
                });
                requests.push(createPromise);
              }
            }

            if (q.openEndedIfNo) {
              const noOption = q.options.find(o => o.label.toLowerCase() === 'no');
              if (noOption) {
                const noKey = section.component + "|" + q.text + "|" + noOption.label;
                const noRec = recordsMap[noKey] || {};
                if (noRec.seleccion) {
                  const openKey = section.component + "|" + q.text + "|RazónNo";
                  const openRec = recordsMap[openKey] || { respuesta: "", seleccion: false };
                  const requestData = {
                    caracterizacion_id: id,
                    componente: section.component,
                    pregunta: q.text + " - RazónNo",
                    respuesta: openRec.respuesta || "",
                    seleccion: false,
                    user_id: userId
                  };
                  if (openRec.record_id) {
                    const updatePromise = axios.put(
                      `https://impulso-local-back.onrender.com/api/inscriptions/pi/tables/pi_encuesta_salida/record/${openRec.record_id}`,
                      requestData,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    requests.push(updatePromise);
                  } else {
                    const createPromise = axios.post(
                      `https://impulso-local-back.onrender.com/api/inscriptions/pi/tables/pi_encuesta_salida/record`,
                      requestData,
                      { headers: { Authorization: `Bearer ${token}` } }
                    ).then(res => {
                      setRecordsMap(prev => ({
                        ...prev,
                        [openKey]: { ...prev[openKey], record_id: res.data.id }
                      }));
                    });
                    requests.push(createPromise);
                  }
                }
              }
            }

          } else if (q.openEnded) {
            const key = section.component + "|" + q.text;
            const rec = recordsMap[key] || { respuesta: "", seleccion: false };
            const requestData = {
              caracterizacion_id: id,
              componente: section.component,
              pregunta: q.text,
              respuesta: rec.respuesta || "",
              seleccion: false,
              user_id: userId
            };

            if (rec.record_id) {
              const updatePromise = axios.put(
                `https://impulso-local-back.onrender.com/api/inscriptions/pi/tables/pi_encuesta_salida/record/${rec.record_id}`,
                requestData,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              requests.push(updatePromise);
            } else {
              const createPromise = axios.post(
                `https://impulso-local-back.onrender.com/api/inscriptions/pi/tables/pi_encuesta_salida/record`,
                requestData,
                { headers: { Authorization: `Bearer ${token}` } }
              ).then(res => {
                setRecordsMap(prev => ({
                  ...prev,
                  [key]: { ...prev[key], record_id: res.data.id }
                }));
              });
              requests.push(createPromise);
            }
          }
        }
      }

      await Promise.all(requests);
      alert("Encuesta guardada exitosamente");
    } catch (error) {
      console.error("Error guardando la encuesta:", error);
      alert("Hubo un error al guardar la encuesta");
    }
  };

  const handleOpenHistoryModal = async () => {
    await fetchAllRecordsHistory();
    setShowHistoryModal(true);
  };

  const fetchAllRecordsHistory = async () => {
    const recordIds = Object.values(recordsMap).map(r => r.record_id).filter(Boolean);
    if (recordIds.length === 0) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const token = localStorage.getItem('token');
      const historyPromises = recordIds.map((rid) =>
        axios.get(
          `https://impulso-local-back.onrender.com/api/inscriptions/tables/pi_encuesta_salida/record/${rid}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      const historyResponses = await Promise.all(historyPromises);
      let combinedHistory = [];

      historyResponses.forEach((response) => {
        if (response.data.history && Array.isArray(response.data.history)) {
          combinedHistory = combinedHistory.concat(response.data.history);
        }
      });

      combinedHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(combinedHistory);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Error obteniendo el historial:', error);
      setHistoryError('Error obteniendo el historial');
      setHistoryLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  const handleSave = async () => {
    await handleSubmit();
  };

  // Función para agregar texto y gestionar saltos de página
  const addTextWithPageBreak = (doc, textLines, x, y, lineHeight, marginBottom, pageMarginBottom) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    textLines.forEach(line => {
      if (y + lineHeight > pageHeight - pageMarginBottom) {
        doc.addPage();
        y = 20; // margen superior en la nueva página
      }
      doc.text(line, x, y);
      y += lineHeight;
    });
    return y + marginBottom;
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const marginLeft = 40;
    const marginRight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - marginLeft - marginRight;
    const fontSizes = { title: 14, normal: 10 };
    const lineHeight = 14;
    const pageMarginBottom = 40;
    let y = 40; // posición inicial vertical

    doc.setFontSize(fontSizes.title);
    doc.setFont(undefined, 'bold');
    doc.text("ENCUESTA DE SALIDA Y SATISFACCIÓN", pageWidth/2, y, { align: 'center' });
    y += 30;

    // Tabla superior con datos del emprendimiento
    const c = caracterizacionData || {};
    const infoData = [
      ["Nombre del emprendimiento", c["Nombre del emprendimiento"] || ""],
      ["Tipo de documento", c["Tipo de identificacion"] || ""],
      ["Documento de identidad", c["Numero de identificacion"] || ""],
      ["Dirección del emprendimiento", c["Direccion de la unidad de negocio"] || ""],
      ["Localidad donde se encuentra ubicado la microempresa", c["Localidad de la unidad de negocio"] || ""],
      ["Actividad económica", ""],
      ["Valor entregado como capitalización", ""],
      ["Fecha de diligenciamiento", ""]
    ];
    autoTable(doc, {
      startY: y,
      body: infoData,
      theme: 'grid',
      styles: { fontSize: fontSizes.normal },
      tableWidth: 'auto',
      margin: { left: marginLeft, right: marginRight },
    });
    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(fontSizes.title);
    doc.setFont(undefined, 'bold');
    doc.text("Encuesta", pageWidth/2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(fontSizes.normal);
    doc.setFont(undefined, 'normal');

    // Mostrar encuesta completa
    for (const section of initialQuestions) {
      // Título de sección
      doc.setFont(undefined, 'bold');
      let sectionLines = doc.splitTextToSize(section.component, maxLineWidth);
      y = addTextWithPageBreak(doc, sectionLines, marginLeft, y, lineHeight, 10, pageMarginBottom);

      doc.setFont(undefined, 'normal');

      for (const q of section.questions) {
        let qLines = doc.splitTextToSize(q.text, maxLineWidth);
        y = addTextWithPageBreak(doc, qLines, marginLeft, y, lineHeight, 5, pageMarginBottom);

        if (q.options && q.options.length > 0) {
          for (const opt of q.options) {
            const key = section.component + "|" + q.text + "|" + opt.label;
            const rec = recordsMap[key];

            let prefix = "[ ]";
            let line = opt.label;

            if (rec && rec.seleccion) {
              prefix = "[X]";
              // Si es openEnded dentro de una opción y hay rec.respuesta
              // la mostramos directamente
              if (opt.openEnded && rec.respuesta) {
                line = opt.label + ": " + rec.respuesta;
              }
            } else {
              // Si es openEnded pero no seleccionada, o no hay respuesta, solo muestra la etiqueta
              if (opt.openEnded && rec && rec.respuesta) {
                line = opt.label + ": " + rec.respuesta;
              }
            }

            let optLine = prefix + " " + line;
            let optLines = doc.splitTextToSize(optLine, maxLineWidth - 20);
            // Indentar opciones
            optLines = optLines.map(l => "   " + l);
            y = addTextWithPageBreak(doc, optLines, marginLeft, y, lineHeight, 5, pageMarginBottom);
          }

          // Campo adicional si se respondió "No"
          if (q.openEndedIfNo) {
            const noOption = q.options.find(o => o.label.toLowerCase() === 'no');
            if (noOption) {
              const noKey = section.component + "|" + q.text + "|" + noOption.label;
              const noRec = recordsMap[noKey];
              if (noRec && noRec.seleccion) {
                const openKey = section.component + "|" + q.text + "|RazónNo";
                const openRec = recordsMap[openKey];
                if (openRec && openRec.respuesta) {
                  let noLine = "[X] Razón No: " + openRec.respuesta;
                  let noLines = doc.splitTextToSize(noLine, maxLineWidth - 20);
                  noLines = noLines.map(l => "   " + l);
                  y = addTextWithPageBreak(doc, noLines, marginLeft, y, lineHeight, 5, pageMarginBottom);
                }
              }
            }
          }

        } else if (q.openEnded) {
          const key = section.component + "|" + q.text;
          const rec = recordsMap[key];
          const respText = (rec && rec.respuesta) ? rec.respuesta : "";
          let respLines = doc.splitTextToSize(respText, maxLineWidth - 20);
          respLines = respLines.map(l => "   " + l);
          y = addTextWithPageBreak(doc, respLines, marginLeft, y, lineHeight, 10, pageMarginBottom);
        } else {
          y += 10;
        }

        y += 5;
      }

      y += 10;
    }

    // Nueva página para datos finales
    doc.addPage();
    y = 60;
    doc.setFontSize(fontSizes.title);
    doc.setFont(undefined, 'bold');
    doc.text("Datos finales:", doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(fontSizes.normal);
    doc.setFont(undefined, 'normal');
    const nombresCompleto = ((c["Nombres"] || "") + " " + (c["Apellidos"] || "")).trim();

    const finalData1 = [
      ["Nombre del Empresario:", nombresCompleto || "No disponible"],
      ["Nombre del Micronegocio:", c["Nombre del emprendimiento"] || ""],
      ["Documento de identidad:", c["Numero de identificacion"] || ""],
      ["Firma:", ""]
    ];
    autoTable(doc, {
      startY: y,
      body: finalData1,
      theme: 'grid',
      styles: { fontSize: fontSizes.normal },
      margin: { left: marginLeft, right: marginRight },
    });

    y = doc.lastAutoTable.finalY + 10;
    const finalData2 = [
      ["Nombre del Aliado:", ""],
      ["Nombre del Asesor empresarial:", ""],
      ["Documento de identidad:", ""],
      ["Firma:", ""]
    ];
    autoTable(doc, {
      startY: y,
      body: finalData2,
      theme: 'grid',
      styles: { fontSize: fontSizes.normal },
      margin: { left: marginLeft, right: marginRight },
    });

    doc.save("EncuestaSalida.pdf");
  };

  return (
    <div>
      <h3>Encuesta de Salida y Satisfacción</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {initialQuestions.map((section) => (
            <div key={section.component} className="card mb-3 p-3">
              <h5>{section.component}</h5>
              {section.questions.map((q) => {
                if (q.options && q.options.length > 0) {
                  return (
                    <div key={q.text} className="mb-3">
                      <label><strong>{q.text}</strong></label>
                      <div>
                        {q.options.map((opt) => {
                          const key = section.component + "|" + q.text + "|" + opt.label;
                          const record = recordsMap[key] || {};
                          return (
                            <div key={opt.label} style={{ marginLeft: '20px' }}>
                              <input
                                type="checkbox"
                                checked={!!record.seleccion}
                                onChange={(e) => handleOptionChange(section.component, q.text, opt.label, e.target.checked)}
                              />
                              {" "}{opt.label}
                              {opt.openEnded && record.seleccion && (
                                <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={record.respuesta || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setRecordsMap((prev) => ({
                                        ...prev,
                                        [key]: { ...prev[key], respuesta: val }
                                      }));
                                    }}
                                    placeholder="Especifique..."
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {q.openEndedIfNo && (() => {
                          const noOption = q.options.find(o => o.label.toLowerCase() === 'no');
                          if (noOption) {
                            const noKey = section.component + "|" + q.text + "|" + noOption.label;
                            const noRec = recordsMap[noKey] || {};
                            if (noRec.seleccion) {
                              const openKey = section.component + "|" + q.text + "|RazónNo";
                              const openRec = recordsMap[openKey] || {};
                              return (
                                <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                                  <label>¿Por qué no participó?</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={openRec.respuesta || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setRecordsMap((prev) => ({
                                        ...prev,
                                        [openKey]: { respuesta: val, seleccion: false, record_id: prev[openKey]?.record_id }
                                      }));
                                    }}
                                  />
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  );
                } else if (q.openEnded) {
                  const key = section.component + "|" + q.text;
                  const record = recordsMap[key] || {};
                  return (
                    <div key={q.text} className="mb-3">
                      <label><strong>{q.text}</strong></label>
                      <input
                        type="text"
                        className="form-control"
                        value={record.respuesta || ""}
                        onChange={(e) => handleOpenEndedChange(section.component, q.text, e.target.value)}
                      />
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          ))}

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
              Cancelar
            </button>
            <div>
              {Object.values(recordsMap).some(r => r.record_id) && (
                <button
                  type="button"
                  className="btn btn-info btn-sm me-2"
                  onClick={handleOpenHistoryModal}
                >
                  Ver Historial de Cambios
                </button>
              )}
              <button className="btn btn-primary btn-sm me-2" onClick={handleSave}>
                Guardar
              </button>
              <button className="btn btn-success btn-sm" onClick={handleGeneratePDF}>
                Generar PDF
              </button>
            </div>
          </div>
        </>
      )}

      {showHistoryModal && (
        <div
          className="modal fade show"
          style={{ display: 'block' }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-lg" role="document" style={{ maxWidth: '90%' }}>
            <div
              className="modal-content"
              style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
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
              <div className="modal-body" style={{ overflowY: 'auto' }}>
                {historyError && (
                  <div className="alert alert-danger">{historyError}</div>
                )}
                {historyLoading ? (
                  <div>Cargando historial...</div>
                ) : history.length > 0 ? (
                  <div
                    className="table-responsive"
                    style={{ maxHeight: '400px', overflowY: 'auto' }}
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
                            <td>{item.username || 'Usuario'}</td>
                            <td>{new Date(item.created_at).toLocaleString()}</td>
                            <td>{item.change_type}</td>
                            <td>{item.field_name || '-'}</td>
                            <td>{item.old_value || '-'}</td>
                            <td>{item.new_value || '-'}</td>
                            <td>{item.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3">No hay historial de cambios.</p>
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

EncuestaSalidaTab.propTypes = {
  id: PropTypes.string.isRequired,
};
