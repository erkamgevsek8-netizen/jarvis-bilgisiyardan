const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Gemini API Proxy - Anahtarı gizli tutar
app.post('/api/gemini', async (req, res) => {
    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ 
            error: 'API anahtarı bulunamadı. Lütfen GEMINI_API_KEY ortam değişkenini ayarlayın.' 
        });
    }
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt gerekli' });
    }

    const systemPrompt = `Sen JARVIS'sin. Tony Stark'ın ileri teknoloji yapay zeka asistanısın. 
    Özelliklerin:
    - Kısa ve öz cevaplar ver (maksimum 2-3 cümle)
    - Havalı ve karizmatik konuş
    - Bazen "efendim" diye hitap et
    - Espri yapabilirsin ama abartma
    - Türkçe konuş
    - Teknik konularda detaylı bilgi ver`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\nKullanıcı: ${prompt}\nJARVIS:`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 150,
                        topP: 0.9,
                        topK: 40
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API Hatası: ${response.status} - ${errorData.error?.message || 'Bilinmeyen hata'}`);
        }

        const data = await response.json();
        
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            res.json({ 
                success: true, 
                text: data.candidates[0].content.parts[0].text.trim() 
            });
        } else {
            throw new Error('Beklenmeyen API yanıt formatı');
        }
        
    } catch (error) {
        console.error('Gemini API Hatası:', error);
        res.status(500).json({ 
            success: false, 
            error: 'JARVIS sistemlerinde geçici bir sorun var efendim.',
            details: error.message 
        });
    }
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sağlık kontrolü
app.get('/health', (req, res) => {
    res.json({ 
        status: 'online', 
        system: 'J.A.R.V.I.S.',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint bulunamadı' });
});

app.listen(PORT, () => {
    console.log(`🤖 J.A.R.V.I.S. sistemleri aktif!`);
    console.log(`🌐 Sunucu: http://localhost:${PORT}`);
    console.log(`🔑 API Anahtarı: ${process.env.GEMINI_API_KEY ? '✅ Yüklü' : '❌ Eksik!'}`);
});
