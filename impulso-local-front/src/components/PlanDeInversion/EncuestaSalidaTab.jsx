import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import config from '../../config';
import './EncuestaSalidaTab.modern.css';

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

  // Consolidar estados relacionados
  const [appState, setAppState] = useState({
    loading: true,
    error: null,
    recordsMap: {},
    caracterizacionData: {},
    tipoIdentificaciones: [],
    asesorData: {
      nombre: "No asignado",
      documento: "No disponible"
    }
  });

  const [history, setHistory] = useState({
    data: [],
    loading: false,
    error: null,
    showModal: false
  });

  // Memoizar la función de fetch para evitar recreaciones innecesarias
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAppState(prev => ({ ...prev, error: "No se encontró el token de autenticación", loading: false }));
      return;
    }

    try {
      // Realizar todas las llamadas API en paralelo
      const [recordsResponse, tipoIdResponse, carResponse] = await Promise.all([
        axios.get(
          `${config.urls.inscriptions.pi}/tables/pi_encuesta_salida/records?caracterizacion_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${config.urls.inscriptions.tables}/inscription_caracterizacion/field-options/Tipo de identificacion`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${config.urls.inscriptions.tables}/inscription_caracterizacion/record/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      // Procesar registros de la encuesta
      const newMap = {};
      recordsResponse.data.forEach((rec) => {
        const comp = rec.componente ? rec.componente.trim() : "";
        const preg = rec.pregunta ? rec.pregunta.trim() : "";
        const resp = rec.respuesta ? rec.respuesta.trim() : "";
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

      // Obtener datos del asesor si existe
      let asesorData = { nombre: "No asignado", documento: "No disponible" };
      const asesorId = carResponse.data.record?.Asesor;
      if (asesorId) {
        try {
          const asesorResponse = await axios.get(
            `${config.urls.inscriptions.tables}/users/record/${asesorId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const asesor = asesorResponse.data.record;
          asesorData = {
            nombre: asesor.username || "No asignado",
            documento: asesor.documento || "No disponible"
          };
        } catch (err) {
          console.error("Error obteniendo datos del asesor:", err);
        }
      }

      // Actualizar estado con todos los datos
      setAppState({
        loading: false,
        error: null,
        recordsMap: newMap,
        caracterizacionData: carResponse.data.record || {},
        tipoIdentificaciones: tipoIdResponse.data || [],
        asesorData
      });
    } catch (error) {
      console.error("Error obteniendo datos:", error);
      setAppState(prev => ({
        ...prev,
        loading: false,
        error: "Error obteniendo los datos de la encuesta."
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoizar handlers para evitar recreaciones innecesarias
  const handleOptionChange = useCallback((component, question, optionLabel, value) => {
    setAppState(prev => {
      const newMap = { ...prev.recordsMap };
      Object.keys(newMap).forEach((k) => {
        if (k.startsWith(component + "|" + question + "|")) {
          newMap[k] = { ...newMap[k], seleccion: false };
        }
      });
      const key = component + "|" + question + "|" + optionLabel;
      newMap[key] = { 
        ...newMap[key], 
        respuesta: optionLabel, 
        seleccion: value, 
        record_id: prev.recordsMap[key]?.record_id 
      };
      return { ...prev, recordsMap: newMap };
    });
  }, []);

  const handleOpenEndedChange = useCallback((component, question, value, optionLabel = null) => {
    setAppState(prev => {
      const newMap = { ...prev.recordsMap };
      let key;
      if (optionLabel) {
        // Es una opción abierta dentro de un grupo de opciones
        key = component + '|' + question + '|' + optionLabel;
        // Asegurarse de que la opción esté seleccionada
        newMap[key] = {
          ...newMap[key],
          respuesta: value || '',
          seleccion: true,
          record_id: newMap[key]?.record_id
        };
      } else {
        // Es una pregunta completamente abierta
        key = component + '|' + question;
        newMap[key] = {
          ...newMap[key],
          respuesta: value || '',
          seleccion: false,
          record_id: newMap[key]?.record_id
        };
      }
      return { ...prev, recordsMap: newMap };
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No se encontró el token de autenticación");
        return;
      }

      const userId = localStorage.getItem('id');
      const batchRequests = [];
      const updates = [];
      const creates = [];

      // Preparar todas las solicitudes primero
      for (const section of initialQuestions) {
        for (const q of section.questions) {
          if (q.options && q.options.length > 0) {
            // Buscar la opción seleccionada
            const selectedOpt = q.options.find(opt => {
              const key = section.component + "|" + q.text + "|" + opt.label;
              const rec = appState.recordsMap[key] || {};
              return rec.seleccion === true;
            });

            if (selectedOpt) {
              const key = section.component + "|" + q.text + "|" + selectedOpt.label;
              const rec = appState.recordsMap[key] || { respuesta: selectedOpt.label, seleccion: true };
              
              // Asegurarse de que la respuesta incluya el texto de la opción abierta si existe
              const respuesta = selectedOpt.openEnded ? rec.respuesta : selectedOpt.label;
              
              const requestData = {
                caracterizacion_id: id,
                componente: section.component,
                pregunta: q.text,
                respuesta: respuesta || selectedOpt.label || "",
                seleccion: true,
                user_id: userId
              };

              if (rec.record_id) {
                updates.push({ id: rec.record_id, data: requestData });
              } else {
                creates.push(requestData);
              }
            }

            // Manejar campo abierto si aplica (openEndedIfNo)
            if (q.openEndedIfNo) {
              const noOption = q.options.find(o => o.label.toLowerCase() === 'no');
              if (noOption) {
                const noKey = section.component + "|" + q.text + "|" + noOption.label;
                const noRec = appState.recordsMap[noKey] || {};
                if (noRec.seleccion) {
                  const openKey = section.component + "|" + q.text + "|RazónNo";
                  const openRec = appState.recordsMap[openKey] || {};
                  const requestData = {
                    caracterizacion_id: id,
                    componente: section.component,
                    pregunta: q.text + " - RazónNo",
                    respuesta: openRec.respuesta || "",
                    seleccion: false,
                    user_id: userId
                  };

                  if (openRec.record_id) {
                    updates.push({ id: openRec.record_id, data: requestData });
                  } else {
                    creates.push(requestData);
                  }
                }
              }
            }
          } else if (q.openEnded) {
            // Pregunta abierta sin opciones
            const key = section.component + "|" + q.text;
            const rec = appState.recordsMap[key] || { respuesta: "", seleccion: false };
            // Solo guardar si hay respuesta no vacía
            if (rec.respuesta && rec.respuesta.trim() !== "") {
              const requestData = {
                caracterizacion_id: id,
                componente: section.component,
                pregunta: q.text,
                respuesta: rec.respuesta,
                seleccion: false,
                user_id: userId
              };
              if (rec.record_id) {
                updates.push({ id: rec.record_id, data: requestData });
              } else {
                creates.push(requestData);
              }
            }
          }
        }
      }

      // Procesar actualizaciones en lotes
      if (updates.length > 0) {
        const updatePromises = updates.map(update => 
          axios.put(
            `${config.urls.inscriptions.pi}/tables/pi_encuesta_salida/record/${update.id}`,
            update.data,
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(error => {
            if (error.response && error.response.status === 404) {
              // Si el registro no existe, crear uno nuevo
              return axios.post(
                `${config.urls.inscriptions.pi}/tables/pi_encuesta_salida/record`,
                update.data,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
            throw error;
          })
        );
        batchRequests.push(...updatePromises);
      }

      // Procesar creaciones en lotes
      if (creates.length > 0) {
        const createPromises = creates.map(data =>
          axios.post(
            `${config.urls.inscriptions.pi}/tables/pi_encuesta_salida/record`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );
        batchRequests.push(...createPromises);
      }

      // Ejecutar todas las solicitudes en paralelo
      const results = await Promise.all(batchRequests);

      // Actualizar el estado con los nuevos IDs
      const newRecordsMap = { ...appState.recordsMap };
      results.forEach((result, index) => {
        const request = [...updates, ...creates][index];
        const key = Object.keys(newRecordsMap).find(k => 
          newRecordsMap[k].respuesta === request.data.respuesta &&
          newRecordsMap[k].seleccion === request.data.seleccion
        );
        if (key) {
          newRecordsMap[key] = {
            ...newRecordsMap[key],
            record_id: result.data.id
          };
        }
      });

      setAppState(prev => ({
        ...prev,
        recordsMap: newRecordsMap
      }));

      alert("Encuesta guardada exitosamente");
    } catch (error) {
      console.error("Error guardando la encuesta:", error);
      alert("Error al guardar la encuesta. Por favor, intente nuevamente.");
    }
  };

  const handleOpenHistoryModal = async () => {
    await fetchAllRecordsHistory();
    setHistory(prev => ({ ...prev, showModal: true }));
  };

  const fetchAllRecordsHistory = async () => {
    const recordIds = Object.values(appState.recordsMap).map(r => r.record_id).filter(Boolean);
    if (recordIds.length === 0) {
      setHistory(prev => ({ ...prev, data: [] }));
      return;
    }

    setHistory(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = localStorage.getItem('token');
      const historyPromises = recordIds.map((rid) =>
        axios.get(
          `${config.urls.inscriptions.tables}/pi_encuesta_salida/record/${rid}/history`,
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
      setHistory(prev => ({ ...prev, data: combinedHistory, loading: false }));
    } catch (error) {
      console.error('Error obteniendo el historial:', error);
      setHistory(prev => ({ ...prev, error: 'Error obteniendo el historial', loading: false }));
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
    const c = appState.caracterizacionData || {};
    // Mapeo manual de ids a descripciones de tipo de documento
    const tipoIdMap = {
      1: "Cédula de Ciudadanía",
      2: "Tarjeta de Identidad",
      3: "Cédula de Extranjería",
      4: "NIT",
      5: "Pasaporte",
      6: "Permiso Especial"
    };
    const tipoIdValue = c["Tipo de identificacion"];
    let tipoIdDesc = tipoIdMap[tipoIdValue] || tipoIdValue;
    // Mapeo manual de ids a nombres de localidad
    // Modifica este objeto si cambian los ids o nombres de localidad
    const localidadMap = {
      10: "Los Mártires",
      16: "Teusaquillo",
      17: "Tunjuelito",
      18: "Usaquén",
      22: "Suba",
      23: "Engativá",
      25: "Barrios Unidos",
      26: "San Cristóbal",
      27: "Rafael Uribe Uribe",
      28: "Kennedy"
    };
    const localidadValue = c["Localidad de la unidad de negocio"];
    const localidadDesc = localidadMap[localidadValue] || localidadValue;
    const fechaDiligenciamiento = new Date();
    const fechaFormateada = `${fechaDiligenciamiento.getDate().toString().padStart(2, '0')}/${(fechaDiligenciamiento.getMonth() + 1).toString().padStart(2, '0')}/${fechaDiligenciamiento.getFullYear()}`;
    const infoData = [
      ["Nombre del emprendimiento", c["Nombre del emprendimiento"] || ""],
      ["Tipo de documento", tipoIdDesc || ""],
      ["Documento de identidad", c["Numero de identificacion"] || ""],
      ["Dirección del emprendimiento", c["Direccion de la unidad de negocio"] || ""],
      ["Localidad donde se encuentra ubicado la microempresa", localidadDesc],
      ["Valor entregado como capitalización", ""],
      ["Fecha de diligenciamiento", fechaFormateada]
    ];
    autoTable(doc, {
      startY: y,
      body: infoData,
      theme: 'grid',
      styles: { fontSize: fontSizes.normal },
      tableWidth: 'auto',
      margin: { left: marginLeft, right: marginRight },
    });
    y = doc.lastAutoTable.finalY + 40;

    doc.setFontSize(fontSizes.title);
    doc.setFont(undefined, 'bold');
    doc.text("Encuesta", pageWidth/2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(fontSizes.normal);
    doc.setFont(undefined, 'normal');

    // Mostrar encuesta completa
    initialQuestions.forEach((section, sectionIdx) => {
      // Verificar espacio antes de la sección
      if (y + 60 > doc.internal.pageSize.getHeight() - pageMarginBottom) {
        doc.addPage();
        y = 40;
      }
      // Título de sección con fondo azul y texto blanco
      const sectionTitleHeight = 28;
      doc.setFillColor(25, 118, 210); // Azul institucional
      doc.rect(marginLeft, y, maxLineWidth, sectionTitleHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(fontSizes.title + 2);
      doc.setFont(undefined, 'bold');
      doc.text(section.component, marginLeft + 10, y + sectionTitleHeight / 2 + 5);
      y += sectionTitleHeight + 6;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(fontSizes.normal);
      doc.setFont(undefined, 'normal');

      section.questions.forEach((q, qIdx) => {
        // Calcular altura estimada de la tarjeta
        let qLines = doc.splitTextToSize((qIdx + 1) + '. ' + q.text, maxLineWidth - 20);
        let cardH = qLines.length * (lineHeight + 1) + 10;
        let optionsToShow = (q.options && q.options.length > 0) ? q.options.filter(opt => !opt.label.startsWith('Otro')) : [];
        if (optionsToShow.length > 0) {
          cardH += optionsToShow.length * (lineHeight + 6);
        }
        // Campo abierto dependiente de la opción 'No'
        let showNoReason = false;
        let noReasonText = '';
        if (q.openEndedIfNo) {
          const noOption = q.options.find(o => o.label.toLowerCase() === 'no');
          if (noOption) {
            const noKey = section.component + '|' + q.text + '|' + noOption.label;
            const noRec = appState.recordsMap[noKey];
            if (noRec && noRec.seleccion) {
              const openKey = section.component + '|' + q.text + '|RazónNo';
              const openRec = appState.recordsMap[openKey] || {};
              if (openRec && openRec.respuesta) {
                showNoReason = true;
                noReasonText = openRec.respuesta;
                cardH += lineHeight + 14;
              }
            }
          }
        }
        // Pregunta abierta
        let showOpen = false;
        let openText = '';
        if (q.openEnded) {
          const key = section.component + '|' + q.text;
          const rec = appState.recordsMap[key];
          if (rec && rec.respuesta) {
            showOpen = true;
            openText = rec.respuesta;
            cardH += lineHeight + 14;
          }
        }
        // Verificar espacio antes de la tarjeta
        if (y + cardH + 24 > doc.internal.pageSize.getHeight() - pageMarginBottom) {
          doc.addPage();
          y = 40;
        }
        // Dibuja la tarjeta
        const cardX = marginLeft;
        const cardY = y;
        const cardW = maxLineWidth;
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(245, 247, 250); // Gris muy claro
        doc.roundedRect(cardX, cardY, cardW, cardH + 10, 8, 8, 'FD');
        let yCard = y + 18;
        // Pregunta
        doc.setFont(undefined, 'bold');
        qLines.forEach((line, i) => {
          doc.text(line, cardX + 14, yCard);
          yCard += lineHeight + 1;
        });
        doc.setFont(undefined, 'normal');
        // Opciones tipo checklist
        optionsToShow.forEach((opt) => {
          const key = section.component + '|' + q.text + '|' + opt.label;
          const rec = appState.recordsMap[key];
          // Círculo
          const circleX = cardX + 18;
          const circleY = yCard - 4;
          if (rec && rec.seleccion) {
            doc.setFillColor(25, 118, 210); // Azul
            doc.circle(circleX, circleY, 5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.text('✓', circleX - 3, circleY + 4);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(fontSizes.normal);
          } else {
            doc.setDrawColor(180, 180, 180);
            doc.setFillColor(240, 240, 240);
            doc.circle(circleX, circleY, 5, 'FD');
          }
          // Texto de la opción
          let optText = opt.label;
          if (opt.openEnded && rec && rec.respuesta) {
            optText = opt.label + ': ' + rec.respuesta;
          }
          doc.text(optText, cardX + 32, yCard);
          yCard += lineHeight + 6;
        });
        // Campo abierto dependiente de la opción 'No'
        if (showNoReason) {
          doc.setFillColor(230, 236, 245);
          doc.roundedRect(cardX + 12, yCard - 10, cardW - 24, lineHeight + 10, 4, 4, 'F');
          doc.setFont('helvetica', 'italic');
          doc.text('Razón No: ' + noReasonText, cardX + 18, yCard + 4);
          doc.setFont('helvetica', 'normal');
          yCard += lineHeight + 14;
        }
        // Pregunta abierta
        if (showOpen) {
          doc.setFillColor(230, 236, 245);
          doc.roundedRect(cardX + 12, yCard - 10, cardW - 24, lineHeight + 10, 4, 4, 'F');
          doc.setFont('helvetica', 'italic');
          doc.text('Respuesta: ' + openText, cardX + 18, yCard + 4);
          doc.setFont('helvetica', 'normal');
          yCard += lineHeight + 14;
        }
        y += cardH + 24;
      });
      y += 10;
    });

    // Antes de las tablas finales, verificar si hay espacio suficiente
    // Aproximadamente 2 tablas de 4 filas, 2*60px de alto + margen
    const tablasFinalesAltura = 140;
    if (y + tablasFinalesAltura > doc.internal.pageSize.getHeight() - pageMarginBottom) {
      doc.addPage();
      y = 60;
    }
    // Nueva página para datos finales (ahora solo si es necesario)
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
      ["Firma:", "\n\n\n"],
    ];
    // Calcular el ancho de la columna 2 dinámicamente para que la tabla ocupe el mismo ancho que la encuesta
    const col1Width = 180;
    const col2Width = maxLineWidth - col1Width;
    autoTable(doc, {
      startY: y,
      body: finalData1,
      theme: 'grid',
      styles: { fontSize: fontSizes.normal },
      margin: { left: marginLeft, right: marginRight },
      tableWidth: maxLineWidth,
      columnStyles: {
        0: { cellWidth: col1Width },
        1: { cellWidth: col2Width }
      }
    });

    y = doc.lastAutoTable.finalY + 10;
    const finalData2 = [
      ["Nombre del Aliado:", "Propais"],
      ["Nombre del Asesor empresarial:", appState.asesorData.nombre || ""],
      ["Documento de identidad:", appState.asesorData.documento || ""],
      ["Firma:", "\n\n\n"],
    ];
    autoTable(doc, {
      startY: y,
      body: finalData2,
      theme: 'grid',
      styles: { fontSize: fontSizes.normal },
      margin: { left: marginLeft, right: marginRight },
      tableWidth: maxLineWidth,
      columnStyles: {
        0: { cellWidth: col1Width },
        1: { cellWidth: col2Width }
      }
    });

    doc.save("EncuestaSalida.pdf");
  };

  return (
    <div className="encuesta-modern-container">
      {/* <h3>Encuesta de Salida y Satisfacción</h3> */}
      {appState.loading ? (
        <p>Cargando...</p>
      ) : appState.error ? (
        <div className="alert alert-danger">{appState.error}</div>
      ) : (
        <>
          {initialQuestions.map((section, sectionIdx) => (
            <div key={section.component} className="encuesta-modern-section-card">
              <h2 className="encuesta-modern-section-title">{section.component}</h2>
              {section.questions.map((q, qIdx) => (
                <div key={q.text} className="encuesta-modern-question-block">
                  <div className="encuesta-modern-question-text">{q.text}</div>
                  {q.options && (
                    <div className="encuesta-modern-options-row">
                      {q.options.map((opt) => {
                        const key = section.component + "|" + q.text + "|" + opt.label;
                        const record = appState.recordsMap[key] || {};
                        // Usar índices para el name del radio
                        const radioName = `radio-${sectionIdx}-${qIdx}`;
                        return (
                          <label key={opt.label} className={`encuesta-modern-option-label${record.seleccion ? ' selected' : ''}${opt.label.startsWith('Otro') ? ' hide-option' : ''}`}>
                            <input
                              type="radio"
                              name={radioName}
                              checked={!!record.seleccion}
                              onChange={() => handleOptionChange(section.component, q.text, opt.label, true)}
                              disabled={localStorage.getItem('role_id') === '3'}
                            />
                            <span className="encuesta-modern-option-text">{opt.label}</span>
                            {opt.openEnded && record.seleccion && (
                              <input
                                className="encuesta-modern-open-input"
                                type="text"
                                value={record.respuesta || ''}
                                onChange={e => handleOpenEndedChange(section.component, q.text, e.target.value, opt.label)}
                                placeholder="Escribe tu respuesta..."
                                readOnly={localStorage.getItem('role_id') === '3'}
                              />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {/* Campo abierto para preguntas sin opciones */}
                  {!q.options && q.openEnded && (
                    <input
                      className="encuesta-modern-open-input"
                      type="text"
                      value={appState.recordsMap[section.component + '|' + q.text]?.respuesta || ''}
                      onChange={e => handleOpenEndedChange(section.component, q.text, e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      readOnly={localStorage.getItem('role_id') === '3'}
                    />
                  )}
                  {/* Campo abierto dependiente de la opción 'No' */}
                  {q.openEndedIfNo && (() => {
                    const noOption = q.options.find(o => o.label.toLowerCase() === 'no');
                    if (!noOption) return null;
                    const noKey = section.component + '|' + q.text + '|' + noOption.label;
                    const noRecord = appState.recordsMap[noKey] || {};
                    if (noRecord.seleccion) {
                      const openKey = section.component + '|' + q.text + '|RazónNo';
                      return (
                        <input
                          className="encuesta-modern-open-input"
                          type="text"
                          value={appState.recordsMap[openKey]?.respuesta || ''}
                          onChange={e => handleOpenEndedChange(section.component, q.text + '|RazónNo', e.target.value)}
                          placeholder="¿Por qué no participó?"
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
              ))}
            </div>
          ))}
          <div className="encuesta-modern-bottom-bar">
            {localStorage.getItem('role_id') !== '3' && (
              <button className="encuesta-modern-btn encuesta-modern-btn-primary" onClick={handleSubmit}>Guardar</button>
            )}
            <button className="encuesta-modern-btn encuesta-modern-btn-secondary" onClick={handleCancel}>Cancelar</button>
            <button className="encuesta-modern-btn encuesta-modern-btn-pdf" onClick={handleGeneratePDF}>Descargar PDF</button>
          </div>
        </>
      )}

      {history.showModal && (
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
                  onClick={() => setHistory(prev => ({ ...prev, showModal: false }))}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ overflowY: 'auto' }}>
                {history.error && (
                  <div className="alert alert-danger">{history.error}</div>
                )}
                {history.loading ? (
                  <div>Cargando historial...</div>
                ) : history.data.length > 0 ? (
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
                        {history.data.map((item) => (
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
                  onClick={() => setHistory(prev => ({ ...prev, showModal: false }))}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

EncuestaSalidaTab.propTypes = {
  id: PropTypes.string.isRequired,
};
