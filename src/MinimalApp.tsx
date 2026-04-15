import React from "react";

// Sistema completamente minimal - SEM HOOKS, SEM LOOPS
export const MinimalApp = () => {
  console.log("[MINIMAL] App renderizada - SEM HOOKS");
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 LYB Controle Financeiro</h1>
      <p>Sistema minimal funcionando - SEM LOOPS!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Status:</h3>
        <ul>
          <li>✅ Sem hooks React</li>
          <li>✅ Sem useEffect</li>
          <li>✅ Sem useState</li>
          <li>✅ Sem loops infinitos</li>
        </ul>
      </div>
    </div>
  );
};

export default MinimalApp;
