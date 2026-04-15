import React from "react";

// Sistema de autenticação completamente minimal - SEM HOOKS
export const MinimalAuth = () => {
  console.log("[MINIMAL AUTH] Sistema minimal de auth");
  
  const handleLogin = () => {
    console.log("[MINIMAL AUTH] Login clicado");
    alert("Sistema minimal - Login funcionando!");
  };
  
  const handleLogout = () => {
    console.log("[MINIMAL AUTH] Logout clicado");
    alert("Sistema minimal - Logout funcionando!");
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔐 LYB Controle Financeiro - Auth</h1>
      <p>Sistema de autenticação minimal funcionando!</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={handleLogin}
          style={{ 
            padding: '10px 20px', 
            margin: '10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            margin: '10px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
        <h3>✅ Sistema Minimal Funcionando:</h3>
        <ul>
          <li>Sem hooks React</li>
          <li>Sem useEffect</li>
          <li>Sem useState</li>
          <li>Sem loops infinitos</li>
          <li>Sem Supabase</li>
          <li>Sem complexidade</li>
        </ul>
      </div>
    </div>
  );
};

export default MinimalAuth;
