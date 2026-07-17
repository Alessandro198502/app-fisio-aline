import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Certifique-se de que o nome do arquivo CSS seja esse mesmo

// Criamos uma referência ao elemento root de forma segura
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <div style={{ padding: '20px', backgroundColor: '#faf3f0', color: 'black', minHeight: '100vh' }}>
        <h1>Olá, Fisio Aline!</h1>
        <p>O app está funcionando!</p>
      </div>
    </React.StrictMode>
  );
} else {
  console.error("Elemento 'root' não encontrado no index.html");
}
