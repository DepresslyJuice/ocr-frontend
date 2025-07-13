import React, { useState } from "react";

const API_BASE = "https://juanocrflaskocr123.azurewebsites.net/api";

const LANGUAGES = [
  { code: "es", name: "🇪🇸 Español" },
  { code: "en", name: "🇺🇸 Inglés" },
  { code: "fr", name: "🇫🇷 Francés" },
  { code: "de", name: "🇩🇪 Alemán" },
  { code: "it", name: "🇮🇹 Italiano" },
  { code: "pt", name: "🇵🇹 Portugués" }
];

function OCRUploader() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [traduccion, setTraduccion] = useState("");
  const [idiomaDetectado, setIdiomaDetectado] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [inputType, setInputType] = useState("file");
  const [targetLanguage, setTargetLanguage] = useState("es");

  const resetResults = () => {
    setTexto("");
    setTraduccion("");
    setIdiomaDetectado("");
    setError("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    resetResults();
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    resetResults();
  };

  const validateInput = () => {
    if (inputType === "file" && !file) {
      setError("Selecciona una imagen primero.");
      return false;
    }
    if (inputType === "url" && !imageUrl) {
      setError("Ingresa una URL de imagen.");
      return false;
    }
    return true;
  };

  const createRequestOptions = (isTranslate = false) => {
    if (inputType === "file") {
      const formData = new FormData();
      formData.append("image", file);
      if (isTranslate) formData.append("to", targetLanguage);
      return { method: "POST", body: formData, credentials: "omit" };
    } else {
      const body = isTranslate 
        ? { url: imageUrl, to: targetLanguage }
        : { url: imageUrl };
      return {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "omit"
      };
    }
  };

  const handleAPICall = async (endpoint, isTranslate = false) => {
    if (!validateInput()) return;

    setCargando(true);
    resetResults();

    try {
      const requestOptions = createRequestOptions(isTranslate);
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        ...requestOptions,
        mode: 'cors'
      });

      const data = await response.json();
      
      if (response.ok) {
        if (isTranslate) {
          const textoResult = Array.isArray(data.texto_extraido) 
            ? data.texto_extraido.join("\n") 
            : data.texto_extraido || "No se pudo extraer texto";
          setTexto(textoResult);
          setTraduccion(data.texto_traducido || "No se pudo traducir");
          setIdiomaDetectado(data.idioma_detectado || "");
        } else {
          const textoResult = Array.isArray(data.texto) 
            ? data.texto.join("\n") 
            : data.texto || "No se pudo extraer texto";
          setTexto(textoResult);
        }
      } else {
        setError(data.error || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error(`Error en ${endpoint}:`, err);
      setError(`Error de red: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  const handleUpload = () => handleAPICall("ocr");
  const handleOCRTranslate = () => handleAPICall("ocr-translate", true);

  const styles = {
    container: {
      maxWidth: "700px",
      margin: "2rem auto",
      padding: "2rem",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    },
    title: {
      textAlign: "center",
      color: "#2c3e50",
      marginBottom: "2rem",
      fontSize: "2rem"
    },
    toggleContainer: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "1.5rem",
      gap: "1rem"
    },
    toggleButton: {
      padding: "0.5rem 1rem",
      border: "2px solid #3498db",
      backgroundColor: "transparent",
      color: "#3498db",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    toggleButtonActive: {
      backgroundColor: "#3498db",
      color: "white"
    },
    inputContainer: {
      marginBottom: "1.5rem"
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      border: "2px solid #ddd",
      borderRadius: "6px",
      fontSize: "1rem",
      boxSizing: "border-box"
    },
    buttonContainer: {
      display: "flex", 
      gap: "1rem", 
      marginBottom: "1rem"
    },
    button: {
      flex: 1,
      padding: "0.75rem",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background-color 0.3s ease"
    },
    buttonPrimary: {
      backgroundColor: "#27ae60"
    },
    buttonSecondary: {
      backgroundColor: "#e74c3c"
    },
    buttonDisabled: {
      backgroundColor: "#95a5a6",
      cursor: "not-allowed"
    },
    resultContainer: {
      marginTop: "2rem",
      padding: "1.5rem",
      backgroundColor: "white",
      borderRadius: "8px",
      border: "1px solid #ddd",
      whiteSpace: "pre-wrap",
      lineHeight: "1.6"
    },
    errorContainer: {
      marginTop: "1rem",
      padding: "1rem",
      backgroundColor: "#fee",
      color: "#c0392b",
      borderRadius: "6px",
      border: "1px solid #e74c3c"
    },
    footer: {
      marginTop: "3rem",
      padding: "1.5rem",
      textAlign: "center",
      backgroundColor: "#2c3e50",
      color: "white",
      borderRadius: "8px",
      fontSize: "0.9rem",
      lineHeight: "1.5"
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔍 OCR con Azure</h2>
      
      <div style={styles.toggleContainer}>
        <button 
          style={{
            ...styles.toggleButton,
            ...(inputType === "file" ? styles.toggleButtonActive : {})
          }}
          onClick={() => setInputType("file")}
        >
          📁 Subir archivo
        </button>
        <button 
          style={{
            ...styles.toggleButton,
            ...(inputType === "url" ? styles.toggleButtonActive : {})
          }}
          onClick={() => setInputType("url")}
        >
          🔗 URL de imagen
        </button>
      </div>

      <div style={styles.inputContainer}>
        {inputType === "file" ? (
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={styles.input}
          />
        ) : (
          <input 
            type="url" 
            placeholder="https://ejemplo.com/imagen.jpg"
            value={imageUrl}
            onChange={handleUrlChange}
            style={styles.input}
          />
        )}
      </div>

      <div style={styles.inputContainer}>
        <select 
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={styles.input}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.buttonContainer}>
        <button 
          onClick={handleUpload} 
          disabled={cargando}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(cargando ? styles.buttonDisabled : {})
          }}
        >
          {cargando ? "🔄 Procesando..." : "🔍 Solo OCR"}
        </button>
        <button 
          onClick={handleOCRTranslate} 
          disabled={cargando}
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            ...(cargando ? styles.buttonDisabled : {})
          }}
        >
          {cargando ? "🔄 Procesando..." : "🌐 OCR + Traducir"}
        </button>
      </div>

      {texto && (
        <div style={styles.resultContainer}>
          <strong style={{ color: "#27ae60", fontSize: "1.1rem" }}>✅ Texto reconocido:</strong>
          <p style={{ marginTop: "1rem", margin: 0 }}>{texto}</p>
        </div>
      )}

      {traduccion && (
        <div style={styles.resultContainer}>
          <strong style={{ color: "#e74c3c", fontSize: "1.1rem" }}>🌐 Traducción:</strong>
          {idiomaDetectado && (
            <p style={{ fontSize: "0.9rem", color: "#666", margin: "0.5rem 0" }}>
              🔍 Idioma detectado: {idiomaDetectado}
            </p>
          )}
          <p style={{ marginTop: "1rem", margin: 0 }}>{traduccion}</p>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      <div style={styles.footer}>
        <div>👨‍🎓 <strong>Estudiante:</strong> Juan Varela</div>
        <div>🏛️ <strong>Universidad:</strong> Universidad Técnica del Norte</div>
        <div>☁️ <strong>Materia:</strong> Cloud Computing</div>
      </div>
    </div>
  );
}

export default OCRUploader;