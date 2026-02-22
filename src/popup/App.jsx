import React, { useState, useEffect } from 'react';
import SkeletonLoader from '../background/SkeletonLoader.jsx';

function App() {
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("hi");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState("");

  // Comprehensive list of supported languages by Lingo.dev
  const languages = [
    { code: "auto", name: "Auto-detect" },
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "pa", name: "Punjabi" },
    { code: "ur", name: "Urdu" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
    { code: "mai", name: "Maithili" },
    { code: "bho", name: "Bhojpuri" },
    { code: "ne", name: "Nepali" },
    { code: "si", name: "Sinhala" },
    { code: "th", name: "Thai" },
    { code: "vi", name: "Vietnamese" },
    { code: "id", name: "Indonesian" },
    { code: "ms", name: "Malay" },
    { code: "tl", name: "Filipino" },
    { code: "sw", name: "Swahili" },
    { code: "am", name: "Amharic" },
    { code: "ha", name: "Hausa" },
    { code: "yo", name: "Yoruba" },
    { code: "ig", name: "Igbo" },
    { code: "zu", name: "Zulu" },
    { code: "xh", name: "Xhosa" },
    { code: "af", name: "Afrikaans" },
    { code: "st", name: "Sesotho" },
    { code: "tn", name: "Setswana" },
    { code: "ts", name: "Xitsonga" },
    { code: "ve", name: "Tshivenda" },
    { code: "nr", name: "isiNdebele" },
    { code: "ss", name: "siSwati" },
    { code: "nso", name: "Sepedi" },
    { code: "tr", name: "Turkish" },
    { code: "fa", name: "Persian" },
    { code: "he", name: "Hebrew" },
    { code: "el", name: "Greek" },
    { code: "pl", name: "Polish" },
    { code: "cs", name: "Czech" },
    { code: "sk", name: "Slovak" },
    { code: "hu", name: "Hungarian" },
    { code: "ro", name: "Romanian" },
    { code: "bg", name: "Bulgarian" },
    { code: "hr", name: "Croatian" },
    { code: "sl", name: "Slovenian" },
    { code: "et", name: "Estonian" },
    { code: "lv", name: "Latvian" },
    { code: "lt", name: "Lithuanian" },
    { code: "fi", name: "Finnish" },
    { code: "sv", name: "Swedish" },
    { code: "da", name: "Danish" },
    { code: "no", name: "Norwegian" },
    { code: "nl", name: "Dutch" },
    { code: "uk", name: "Ukrainian" },
    { code: "be", name: "Belarusian" },
    { code: "sr", name: "Serbian" },
    { code: "mk", name: "Macedonian" },
    { code: "sq", name: "Albanian" },
    { code: "bs", name: "Bosnian" },
    { code: "me", name: "Montenegrin" },
    { code: "ka", name: "Georgian" },
    { code: "hy", name: "Armenian" },
    { code: "az", name: "Azerbaijani" },
    { code: "kk", name: "Kazakh" },
    { code: "uz", name: "Uzbek" },
    { code: "tk", name: "Turkmen" },
    { code: "ky", name: "Kyrgyz" },
    { code: "tg", name: "Tajik" },
    { code: "mn", name: "Mongolian" },
    { code: "my", name: "Burmese" },
    { code: "lo", name: "Lao" },
    { code: "km", name: "Khmer" },
    { code: "si", name: "Sinhala" },
    { code: "dv", name: "Dhivehi" },
    { code: "ti", name: "Tigrinya" },
    { code: "om", name: "Oromo" },
    { code: "so", name: "Somali" },
    { code: "rw", name: "Kinyarwanda" },
    { code: "lg", name: "Luganda" },
    { code: "ny", name: "Chichewa" },
    { code: "mg", name: "Malagasy" },
    { code: "rn", name: "Kirundi" },
    { code: "sn", name: "Shona" },
    { code: "nd", name: "isiNdebele (North)" },
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "es-419", name: "Spanish (Latin America)" },
    { code: "fr-FR", name: "French (France)" },
    { code: "fr-CA", name: "French (Canada)" },
    { code: "pt-BR", name: "Portuguese (Brazil)" },
    { code: "pt-PT", name: "Portuguese (Portugal)" },
    { code: "zh-CN", name: "Chinese (China)" },
    { code: "zh-HK", name: "Chinese (Hong Kong)" },
    { code: "zh-SG", name: "Chinese (Singapore)" },
    { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
    { code: "ar-EG", name: "Arabic (Egypt)" },
    { code: "hi-IN", name: "Hindi (India)" },
    { code: "bn-IN", name: "Bengali (India)" },
    { code: "pa-IN", name: "Punjabi (India)" },
    { code: "ur-PK", name: "Urdu (Pakistan)" },
    { code: "ta-IN", name: "Tamil (India)" },
    { code: "te-IN", name: "Telugu (India)" },
    { code: "mr-IN", name: "Marathi (India)" },
    { code: "gu-IN", name: "Gujarati (India)" },
    { code: "kn-IN", name: "Kannada (India)" },
    { code: "ml-IN", name: "Malayalam (India)" },
    { code: "or-IN", name: "Odia (India)" },
    { code: "as-IN", name: "Assamese (India)" },
    { code: "mai-IN", name: "Maithili (India)" },
    { code: "bho-IN", name: "Bhojpuri (India)" },
    { code: "ne-NP", name: "Nepali (Nepal)" },
    { code: "si-LK", name: "Sinhala (Sri Lanka)" },
    { code: "th-TH", name: "Thai (Thailand)" },
    { code: "vi-VN", name: "Vietnamese (Vietnam)" },
    { code: "id-ID", name: "Indonesian (Indonesia)" },
    { code: "ms-MY", name: "Malay (Malaysia)" },
    { code: "tl-PH", name: "Filipino (Philippines)" },
    { code: "sw-KE", name: "Swahili (Kenya)" },
    { code: "am-ET", name: "Amharic (Ethiopia)" },
    { code: "ha-NG", name: "Hausa (Nigeria)" },
    { code: "yo-NG", name: "Yoruba (Nigeria)" },
    { code: "ig-NG", name: "Igbo (Nigeria)" },
    { code: "zu-ZA", name: "Zulu (South Africa)" },
    { code: "xh-ZA", name: "Xhosa (South Africa)" },
    { code: "af-ZA", name: "Afrikaans (South Africa)" },
    { code: "st-ZA", name: "Sesotho (South Africa)" },
    { code: "tn-ZA", name: "Setswana (South Africa)" },
    { code: "ts-ZA", name: "Xitsonga (South Africa)" },
    { code: "ve-ZA", name: "Tshivenda (South Africa)" },
    { code: "nr-ZA", name: "isiNdebele (South Africa)" },
    { code: "ss-ZA", name: "siSwati (South Africa)" },
    { code: "nso-ZA", name: "Sepedi (South Africa)" },
    { code: "tr-TR", name: "Turkish (Turkey)" },
    { code: "fa-IR", name: "Persian (Iran)" },
    { code: "he-IL", name: "Hebrew (Israel)" },
    { code: "el-GR", name: "Greek (Greece)" },
    { code: "pl-PL", name: "Polish (Poland)" },
    { code: "cs-CZ", name: "Czech (Czech Republic)" },
    { code: "sk-SK", name: "Slovak (Slovakia)" },
    { code: "hu-HU", name: "Hungarian (Hungary)" },
    { code: "ro-RO", name: "Romanian (Romania)" },
    { code: "bg-BG", name: "Bulgarian (Bulgaria)" },
    { code: "hr-HR", name: "Croatian (Croatia)" },
    { code: "sl-SI", name: "Slovenian (Slovenia)" },
    { code: "et-EE", name: "Estonian (Estonia)" },
    { code: "lv-LV", name: "Latvian (Latvia)" },
    { code: "lt-LT", name: "Lithuanian (Lithuania)" },
    { code: "fi-FI", name: "Finnish (Finland)" },
    { code: "sv-SE", name: "Swedish (Sweden)" },
    { code: "da-DK", name: "Danish (Denmark)" },
    { code: "no-NO", name: "Norwegian (Norway)" },
    { code: "nl-NL", name: "Dutch (Netherlands)" },
    { code: "uk-UA", name: "Ukrainian (Ukraine)" },
    { code: "be-BY", name: "Belarusian (Belarus)" },
    { code: "sr-RS", name: "Serbian (Serbia)" },
    { code: "mk-MK", name: "Macedonian (North Macedonia)" },
    { code: "sq-AL", name: "Albanian (Albania)" },
    { code: "bs-BA", name: "Bosnian (Bosnia)" },
    { code: "me-ME", name: "Montenegrin (Montenegro)" },
    { code: "ka-GE", name: "Georgian (Georgia)" },
    { code: "hy-AM", name: "Armenian (Armenia)" },
    { code: "az-AZ", name: "Azerbaijani (Azerbaijan)" },
    { code: "kk-KZ", name: "Kazakh (Kazakhstan)" },
    { code: "uz-UZ", name: "Uzbek (Uzbekistan)" },
    { code: "tk-TM", name: "Turkmen (Turkmenistan)" },
    { code: "ky-KG", name: "Kyrgyz (Kyrgyzstan)" },
    { code: "tg-TJ", name: "Tajik (Tajikistan)" },
    { code: "mn-MN", name: "Mongolian (Mongolia)" },
    { code: "my-MM", name: "Burmese (Myanmar)" },
    { code: "lo-LA", name: "Lao (Laos)" },
    { code: "km-KH", name: "Khmer (Cambodia)" },
    { code: "dv-MV", name: "Dhivehi (Maldives)" },
    { code: "ti-ET", name: "Tigrinya (Ethiopia)" },
    { code: "om-ET", name: "Oromo (Ethiopia)" },
    { code: "so-SO", name: "Somali (Somalia)" },
    { code: "rw-RW", name: "Kinyarwanda (Rwanda)" },
    { code: "lg-UG", name: "Luganda (Uganda)" },
    { code: "ny-MW", name: "Chichewa (Malawi)" },
    { code: "mg-MG", name: "Malagasy (Madagascar)" },
    { code: "rn-BI", name: "Kirundi (Burundi)" },
    { code: "sn-ZW", name: "Shona (Zimbabwe)" }
  ];

  const handleTranslateClick = async () => {
    setIsLoading(true);
    // 1. Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. Send a message to the Content Script in that tab
    chrome.tabs.sendMessage(tab.id, { 
      action: "TRIGGER_TRANSLATION", 
      targetLang,
      sourceLang: sourceLang === "auto" ? null : sourceLang
    });

    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleDetectLanguage = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const selection = window.getSelection();
          return selection.toString().trim();
        }
      });
      
      if (result[0]?.result) {
        const text = result[0].result;
        setDetectedLang("Detecting...");
        
        // Simple language detection based on character patterns
        // This is a basic implementation - could be enhanced with a proper API
        const detected = detectLanguage(text);
        setTimeout(() => {
          setDetectedLang(detected);
        }, 500);
      }
    } catch (error) {
      console.error("Language detection failed:", error);
      setDetectedLang("en"); // fallback
    }
  };

  // Simple language detection function
  const detectLanguage = (text) => {
    // Basic heuristics for common languages
    const patterns = {
      'hi': /[अ-ह]/, // Hindi/Devanagari
      'ar': /[\u0600-\u06FF]/, // Arabic
      'zh': /[\u4e00-\u9fff]/, // Chinese
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/, // Japanese
      'ko': /[\uac00-\ud7af]/, // Korean
      'ru': /[а-яё]/i, // Russian
      'de': /\b(der|die|das|und|ist|mit|von|zu|auf|für)\b/i, // German
      'fr': /\b(le|la|les|et|est|avec|de|à|pour|dans)\b/i, // French
      'es': /\b(el|la|los|las|y|es|con|de|a|por|en)\b/i, // Spanish
      'pt': /\b(o|a|os|as|e|é|com|de|para|em)\b/i, // Portuguese
      'it': /\b(il|la|i|gli|le|e|è|con|di|a|per)\b/i, // Italian
      'nl': /\b(de|het|en|van|ik|je|het|een|in|op)\b/i, // Dutch
      'sv': /\b(och|att|är|en|det|på|med|för|som|jag)\b/i, // Swedish
      'da': /\b(og|at|er|en|det|på|med|for|som|jeg)\b/i, // Danish
      'no': /\b(og|at|er|en|det|på|med|for|som|jeg)\b/i, // Norwegian
      'fi': /\b(ja|on|ei|että|mutta|tai|kun|minä|sinä|hän)\b/i, // Finnish
      'pl': /\b(i|oraz|jest|na|do|że|ale|lub|jak|ja)\b/i, // Polish
      'cs': /\b(a|se|je|že|ale|nebo|jako|já|ty|on)\b/i, // Czech
      'sk': /\b(a|sa|je|že|ale|alebo|ako|ja|ty|on)\b/i, // Slovak
      'hu': /\b(és|az|a|van|egy|nem|de|hogy|ki|be)\b/i, // Hungarian
      'ro': /\b(și|sau|este|pe|în|cu|care|dar|să|eu)\b/i, // Romanian
      'bg': /[а-я]/i, // Bulgarian (Cyrillic)
      'uk': /[а-я]/i, // Ukrainian (Cyrillic)
      'tr': /[a-zçğıöşü]/i, // Turkish
      'fa': /[\u0600-\u06FF]/, // Persian
      'he': /[\u0590-\u05FF]/, // Hebrew
      'th': /[\u0e00-\u0e7f]/, // Thai
      'vi': /[a-zàáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i, // Vietnamese
      'id': /\b(dan|yang|di|ke|dari|untuk|dengan|pada|adalah|ini)\b/i, // Indonesian
      'ms': /\b(dan|yang|di|ke|dari|untuk|dengan|pada|adalah|ini)\b/i, // Malay
      'tl': /\b(at|ang|ng|sa|kay|ko|mo|ako|ikaw|siya)\b/i, // Filipino
    };

    // Check for script-based languages first
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    // Default to English if no specific patterns match
    return 'en';
  };

  useEffect(() => {
    if (sourceLang === "auto" && detectedLang) {
      // Auto-detect is enabled and we have detected language
    }
  }, [sourceLang, detectedLang]);

  return (
    <div style={{ 
      width: '320px', 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '20px',
        color: '#1f2937',
        fontWeight: '600'
      }}>
        LingoBridge
      </h2>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151'
        }}>
          Source Language
        </label>
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          style={{ 
            marginBottom: '8px', 
            padding: '8px 12px', 
            width: '100%',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.9rem',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
          disabled={isLoading}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        
        {sourceLang === "auto" && (
          <button
            onClick={handleDetectLanguage}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              marginTop: '4px'
            }}
            disabled={isLoading}
          >
            Detect Language
          </button>
        )}
        
        {detectedLang && sourceLang === "auto" && (
          <p style={{ 
            fontSize: '0.8rem', 
            color: '#6b7280', 
            marginTop: '4px' 
          }}>
            Detected: {languages.find(l => l.code === detectedLang)?.name || detectedLang}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#374151'
        }}>
          Target Language
        </label>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          style={{ 
            marginBottom: '10px', 
            padding: '8px 12px', 
            width: '100%',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.9rem',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
          disabled={isLoading}
        >
          {languages.filter(lang => lang.code !== "auto").map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <button 
          disabled
          style={{
            padding: '12px 24px',
            backgroundColor: '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'not-allowed',
            fontSize: '1rem',
            fontWeight: '500',
            width: '100%'
          }}
        >
          Translating...
        </button>
      ) : (
        <button 
          onClick={handleTranslateClick}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            width: '100%',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Translate Selection
        </button>
      )}

      <p style={{ 
        fontSize: '0.8rem', 
        color: '#6b7280', 
        marginTop: '12px',
        lineHeight: '1.4'
      }}>
        Select text on any webpage and click to translate it instantly
      </p>
    </div>
  );
}

export default App;