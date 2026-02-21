import React, { useState } from 'react';

function App() {
  const [targetLang, setTargetLang] = useState("hi");

  const handleTranslateClick = async () => {
    // 1. Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. Send a message to the Content Script in that tab
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_TRANSLATION", targetLang });
  };

  return (
    <div style={{ width: '200px', padding: '16px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>LingoFlow</h2>
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
      >
        <option value="hi">Hindi</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="ja">Japanese</option>
      </select>
      <button 
        onClick={handleTranslateClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Translate
      </button>
    </div>
  );
}

export default App;