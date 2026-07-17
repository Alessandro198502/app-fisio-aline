import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Isso importa o seu código profissional!

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App /> {/* Aqui o App.tsx será carregado no lugar daquele texto simples */}
    </React.StrictMode>
  );
} else {
  console.error("Elemento 'root' não encontrado no index.html");
}
