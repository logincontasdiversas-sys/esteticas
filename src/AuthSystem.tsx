import React, { useState } from "react";

// Sistema de autenticação simples - SEM LOOPS
const AuthSystem = ({ onLoginSuccess }: { onLoginSuccess: (user: { email: string, nome: string }) => void }) => {
  console.log("[AUTH] Sistema de autenticação simples iniciado");
  
  // Estado local simples
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[AUTH] Tentativa de login:", { email, password: "***" });
    
    // Simulação de login simples
    if (email && password) {
      const user = {
        email: email,
        nome: email.split('@')[0] // Usa parte do email como nome
      };
      
      setIsLoggedIn(true);
      setMessage("Login realizado com sucesso!");
      console.log("[AUTH] Login bem-sucedido:", user);
      
      // Callback para o componente pai
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } else {
      setMessage("Por favor, preencha email e senha");
    }
  };
  
  const handleLogout = () => {
    console.log("[AUTH] Logout realizado");
    setIsLoggedIn(false);
    setMessage("Deslogado com sucesso.");
  };

  if (isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '10px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{ color: '#28a745', marginBottom: '20px' }}>✅ Login Realizado!</h2>
          <p style={{ marginBottom: '20px' }}>Bem-vindo ao sistema LYB!</p>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          🔐 Login LYB
        </h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Senha:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
              placeholder="Sua senha"
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            Entrar
          </button>
        </form>
        
        {message && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: message.includes('sucesso') ? '#d4edda' : '#f8d7da',
            color: message.includes('sucesso') ? '#155724' : '#721c24',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '5px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <strong>💡 Dica:</strong> Use qualquer email e senha para testar
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;