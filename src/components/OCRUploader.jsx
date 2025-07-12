import React, { useState } from "react";

function OCRUploader() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [inputType, setInputType] = useState("file");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTexto("");
    setError("");
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setTexto("");
    setError("");
  };

  const handleUpload = async () => {
    if (inputType === "file" && !file) {
      setError("Selecciona una imagen primero.");
      return;
    }
    if (inputType === "url" && !imageUrl) {
      setError("Ingresa una URL de imagen.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      let requestOptions;
      
      if (inputType === "file") {
        const formData = new FormData();
        formData.append("image", file);
        requestOptions = {
          method: "POST",
          body: formData,
          credentials: "omit"
        };
      } else {
        requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: imageUrl }),
          credentials: "omit"
        };
      }

      const response = await fetch("https://juanocrflaskocr123.azurewebsites.net/api/ocr", {
        ...requestOptions,
        mode: 'cors'
      });

      const data = await response.json();
      if (response.ok) {
        setTexto(data.texto.join("\n"));
      } else {
        setError(data.error || "Error al procesar la imagen.");
      }
    } catch (err) {
      setError("Error de red o del servidor.");
    } finally {
      setCargando(false);
    }
  };

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
    button: {
      width: "100%",
      padding: "0.75rem",
      backgroundColor: "#27ae60",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background-color 0.3s ease"
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

      <button 
        onClick={handleUpload} 
        disabled={cargando}
        style={{
          ...styles.button,
          ...(cargando ? styles.buttonDisabled : {})
        }}
      >
        {cargando ? "🔄 Procesando..." : "🚀 Analizar imagen"}
      </button>

      {texto && (
        <div style={styles.resultContainer}>
          <strong style={{ color: "#27ae60", fontSize: "1.1rem" }}>✅ Texto reconocido:</strong>
          <p style={{ marginTop: "1rem", margin: 0 }}>{texto}</p>
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
