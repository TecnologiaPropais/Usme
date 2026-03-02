const express = require('express');
const archiver = require('archiver');
const { Readable } = require('stream');
const { Storage } = require('@google-cloud/storage');
const { GoogleAuth } = require('google-auth-library');
const { Pool } = require('pg');
const router = express.Router();

// Configuración de la base de datos PostgreSQL
// Render (y la mayoría de hosts en la nube) exigen SSL; en desarrollo con Render hay que usarlo también
const useSSL = process.env.NODE_ENV === 'production' ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com'));
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GCP_PROJECT_ID,
});
const bucket = storage.bucket(process.env.GCS_BUCKET);

/** Cache del token de GCS para evitar llamadas repetidas (evita ruta OpenSSL problemática en algunas versiones de Node). */
let _gcsTokenPromise = null;
async function getGcsAccessToken() {
  if (!_gcsTokenPromise) {
    _gcsTokenPromise = (async () => {
      const auth = new GoogleAuth({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/devstorage.read_only']
      });
      const client = await auth.getClient();
      const { token } = await client.getAccessToken();
      return token;
    })();
  }
  return _gcsTokenPromise;
}

/**
 * Descarga un objeto de GCS como stream usando la API REST (evita DECODER/OpenSSL del cliente @google-cloud/storage).
 * @param {string} objectPath - Ruta del objeto dentro del bucket (sin URL)
 * @returns {Promise<import('stream').Readable|null>} - Stream del contenido o null si falla
 */
async function getGcsFileStreamViaRest(objectPath) {
  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName || !objectPath) return null;
  const encodedPath = objectPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
  const url = `https://storage.googleapis.com/${bucketName}/${encodedPath}`;
  try {
    console.log('[descarga] REST GCS URL:', url);
    const token = await getGcsAccessToken();
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      console.warn('[descarga] REST GCS no OK:', res.status, objectPath, 'body:', bodyText?.slice(0, 200));
      return null;
    }
    if (!res.body) return null;
    return Readable.fromWeb(res.body);
  } catch (err) {
    console.warn('[descarga] getGcsFileStreamViaRest error:', objectPath, err.message);
    return null;
  }
}

/**
 * Convierte una ruta que puede ser URL completa de GCS a la ruta del objeto dentro del bucket.
 * @param {string} path - Ruta o URL (ej. https://storage.googleapis.com/bucket/path o path/dentro/bucket)
 * @returns {string} - Ruta del objeto dentro del bucket
 */
function toBucketObjectPath(path) {
  if (!path || typeof path !== 'string') return path;
  const trimmed = path.trim();
  const bucketName = process.env.GCS_BUCKET || '';
  const urlPrefix = `https://storage.googleapis.com/${bucketName}/`;
  let objectPath = trimmed;
  if (trimmed.startsWith(urlPrefix)) {
    objectPath = trimmed.slice(urlPrefix.length);
  } else if (trimmed.startsWith('gs://') && trimmed.includes('/')) {
    const withoutGs = trimmed.replace(/^gs:\/\//, '');
    const firstSlash = withoutGs.indexOf('/');
    objectPath = firstSlash >= 0 ? withoutGs.slice(firstSlash + 1) : withoutGs;
  }
  try {
    return decodeURIComponent(objectPath);
  } catch (_) {
    return objectPath;
  }
}

/**
 * Obtiene todos los archivos de una empresa desde GCS bajo inscription_caracterizacion/{empresaId}/
 * @param {string} empresaId
 * @returns {Promise<Array<{gcsPath: string, name: string}>>}
 */
async function getDocumentPathsForEmpresa(empresaId) {
  const files = [];
  try {
    console.log('[descarga] getDocumentPathsForEmpresa: buscando archivos para empresaId', empresaId);
    const [empresaFiles] = await bucket.getFiles({ prefix: `inscription_caracterizacion/${empresaId}/` });
    empresaFiles.forEach(file => {
      if (!file.name.endsWith('/')) {
        files.push({ gcsPath: file.name, name: file.name.split('/').pop() });
      }
    });
    console.log('[descarga] getDocumentPathsForEmpresa: encontrados', files.length, 'archivos');
  } catch (err) {
    console.error('[descarga] getDocumentPathsForEmpresa error:', empresaId, err.message);
    throw err;
  }
  return files;
}

/**
 * Obtiene los archivos registrados en pi_anexosv2 y files para una cédula
 * @param {string} cedula
 * @returns {Promise<{files: Array<{gcsPath: string, name: string, relativePath: string, size: string}>, folderName: string}>}
 */
async function getDocumentPathsForCedula(cedula) {
  const files = [];

  try {
    console.log('[descarga] getDocumentPathsForCedula: consultando cédula', cedula);
    console.log('[descarga] DATABASE_URL definido:', !!process.env.DATABASE_URL);
    console.log('[descarga] NODE_ENV:', process.env.NODE_ENV);

    console.log('[descarga] Paso 1: obteniendo cliente del pool...');
    const client = await pool.connect();
    console.log('[descarga] Paso 1 OK: pool.connect() exitoso');

    console.log('[descarga] Paso 2: query inscription_caracterizacion...');
    const result = await client.query(
      'SELECT id, "Nombres", "Apellidos" FROM inscription_caracterizacion WHERE "Numero de identificacion" = $1',
      [cedula]
    );
    console.log('[descarga] Paso 2 OK: inscription_caracterizacion rows=', result.rows.length);

    if (result.rows.length === 0) {
      client.release();
      console.warn('[descarga] getDocumentPathsForCedula: cédula no encontrada en BD', cedula);
      throw new Error('Cédula no encontrada en la base de datos');
    }

    const caracterizacionId = result.rows[0].id;
    const nombres = result.rows[0].Nombres || '';
    const apellidos = result.rows[0].Apellidos || '';
    const nombreCompleto = `${nombres} ${apellidos}`.trim();
    const folderName = `${cedula}_${nombreCompleto}`;
    console.log('[descarga] getDocumentPathsForCedula: caracterizacionId', caracterizacionId, 'folderName', folderName);

    console.log('[descarga] Paso 3: query pi_anexosv2...');
    const anexosResult = await client.query(
      'SELECT * FROM pi_anexosv2 WHERE caracterizacion_id = $1',
      [caracterizacionId]
    );
    console.log('[descarga] Paso 3 OK: pi_anexosv2 rows=', anexosResult.rows.length);

    if (anexosResult.rows.length > 0) {
      const anexosRecord = anexosResult.rows[0];
      const documentFields = Object.keys(anexosRecord).filter(key => {
        const value = anexosRecord[key];
        return value !== null && value !== undefined && value !== '' && typeof value === 'string';
      });

      for (const fieldName of documentFields) {
        if (['id', 'caracterizacion_id', 'created_at', 'updated_at', 'user_id'].includes(fieldName)) {
          continue;
        }

        const filePath = anexosRecord[fieldName];
        if (filePath && typeof filePath === 'string' && filePath.trim() !== '') {
          const gcsPath = toBucketObjectPath(filePath);
          console.log('[descarga] GCS objeto (ruta normalizada):', gcsPath);
          const fileName = gcsPath.split('/').pop();
          let relativePath = gcsPath;
          if (gcsPath.startsWith(`${folderName}/`)) {
            relativePath = gcsPath.replace(`${folderName}/`, '');
          }
          files.push({
            gcsPath: gcsPath,
            name: fileName,
            relativePath: relativePath,
            size: 'unknown',
            fieldName: fieldName
          });
        }
      }
    }

    // files: record_id = caracterizacion_id, solo documentos con cumple = true
    console.log('[descarga] Paso 4: query files (documentos_iniciales, cumple = true)...');
    const inicialesResult = await client.query(
      `SELECT file_path, name FROM files 
       WHERE record_id = $1 
       AND table_name = 'inscription_caracterizacion' 
       AND source = 'documentos_iniciales'
       AND cumple = true`,
      [caracterizacionId]
    );
    console.log('[descarga] Paso 4 OK: files (documentos_iniciales, cumple=true) rows=', inicialesResult.rows.length);

    client.release();
    console.log('[descarga] Paso 5: cliente liberado, procesando rutas GCS...');

    for (const row of inicialesResult.rows) {
      const filePath = row.file_path;

      if (filePath && typeof filePath === 'string' && filePath.trim() !== '') {
        const gcsPath = toBucketObjectPath(filePath);
        const fileName = row.name || gcsPath.split('/').pop();
        let relativePath = gcsPath;
        if (gcsPath.startsWith(`${folderName}/`)) {
          relativePath = gcsPath.replace(`${folderName}/`, '');
        }
        files.push({
          gcsPath: gcsPath,
          name: fileName,
          relativePath: relativePath,
          size: 'unknown',
          fieldName: 'documentos_iniciales'
        });
      }
    }

    console.log('[descarga] getDocumentPathsForCedula: total archivos para', cedula, '=', files.length);
    return { files, folderName };
  } catch (error) {
    console.error('[descarga] getDocumentPathsForCedula ERROR:', cedula);
    console.error('[descarga]   - code:', error.code);
    console.error('[descarga]   - message:', error.message);
    console.error('[descarga]   - stack:', error.stack);
    if (error.code === 'ECONNRESET') {
      console.error('[descarga]   - ECONNRESET: la conexión fue cerrada por el otro lado. Revisar: 1) PostgreSQL accesible, 2) DATABASE_URL correcta, 3) SSL si es producción.');
    }
    throw error;
  }
}

router.get('/descarga-documentos/:id', async (req, res) => {
  const empresaId = req.params.id;
  try {
    console.log('[descarga] GET /descarga-documentos/:id', empresaId);
    const documentPaths = await getDocumentPathsForEmpresa(empresaId);

    if (documentPaths.length === 0) {
      console.warn('[descarga] /descarga-documentos/:id sin archivos', empresaId);
      return res.status(404).json({ message: 'No se encontraron archivos para este ID' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=documentos_empresa_${empresaId}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', err => {
      console.error('[descarga] archiver error /descarga-documentos:', err.message);
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });

    archive.on('end', () => {
      console.log('[descarga] ZIP generado correctamente para empresa', empresaId);
    });

    archive.pipe(res);

    for (const doc of documentPaths) {
      const file = bucket.file(doc.gcsPath);
      const fileStream = file.createReadStream();
      fileStream.on('error', err => {
        console.error('[descarga] Error leyendo archivo GCS:', doc.gcsPath, err.message);
        archive.abort();
        if (!res.headersSent) {
          res.status(500).end();
        } else {
          res.end();
        }
      });
      archive.append(fileStream, { name: doc.name });
    }

    archive.finalize();
  } catch (error) {
    console.error('[descarga] Error /descarga-documentos/:id', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generando el ZIP' });
    } else {
      res.status(500).end();
    }
  }
});

// Descarga por cédula (ZIP con nombre cedula_nombreCompleto.zip)
router.get('/descarga-documentos-cedula/:cedula', async (req, res) => {
  const cedula = req.params.cedula;

  try {
    console.log('[descarga] GET /descarga-documentos-cedula/:cedula', cedula);
    const result = await getDocumentPathsForCedula(cedula);
    const documentPaths = result.files;
    const folderName = result.folderName;

    if (documentPaths.length === 0) {
      console.warn('[descarga] /descarga-documentos-cedula sin archivos para cédula', cedula);
      return res.status(404).json({ message: 'No se encontraron archivos para esta cédula' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${folderName}.zip`);

    const archive = archiver('zip', {
      zlib: { level: 1 }
    });

    archive.on('error', (err) => {
      console.error('[descarga] archiver error /descarga-documentos-cedula:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generando el archivo ZIP' });
      }
    });

    archive.on('end', () => {
      console.log('[descarga] ZIP por cédula generado correctamente', cedula, folderName);
    });

    archive.on('warning', (err) => {
      console.warn('[descarga] archiver warning /descarga-documentos-cedula:', err.message);
    });

    archive.pipe(res);

    for (let i = 0; i < documentPaths.length; i++) {
      const doc = documentPaths[i];
      try {
        const file = bucket.file(doc.gcsPath);
        const fileStream = file.createReadStream();

        fileStream.on('error', (err) => {
          console.error('[descarga] stream error archivo:', doc.gcsPath, err.message);
        });

        console.log('[descarga] Añadiendo archivo al ZIP:', doc.relativePath);
        archive.append(fileStream, { name: doc.relativePath });
      } catch (fileError) {
        console.warn('[descarga] error agregando archivo al ZIP:', doc.gcsPath, fileError.message);
        continue;
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('[descarga] Error /descarga-documentos-cedula/:cedula', cedula, error.message);
    if (!res.headersSent) {
      if (error.message === 'Cédula no encontrada en la base de datos') {
        res.status(404).json({ message: 'Cédula no encontrada en la base de datos' });
      } else {
        res.status(500).json({ message: 'Error generando el ZIP' });
      }
    }
  }
});

// Prueba: devuelve info de la cédula (folderName, cantidad de archivos) sin generar ZIP
router.get('/test-cedula/:cedula', async (req, res) => {
  const cedula = req.params.cedula;

  try {
    console.log('[descarga] GET /test-cedula/:cedula', cedula);
    const result = await getDocumentPathsForCedula(cedula);
    const documentPaths = result.files;
    const folderName = result.folderName;

    res.json({
      success: true,
      cedula: cedula,
      folderName: folderName,
      archivosEncontrados: documentPaths.length,
      archivos: documentPaths
    });
  } catch (error) {
    console.error('[descarga] Error /test-cedula/:cedula', cedula);
    console.error('[descarga]   - code:', error.code, 'message:', error.message);
    if (error.code === 'ECONNRESET') {
      console.error('[descarga]   - Posible causa: conexión a PostgreSQL cerrada (revisar DATABASE_URL, red, firewall, SSL).');
    }
    if (error.message === 'Cédula no encontrada en la base de datos') {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

module.exports = router;
