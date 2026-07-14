// ============ JARVIS ANA SINIFI ============
class JARVIS {
    constructor() {
        this.isProcessing = false;
        this.conversationHistory = [];
        
        this.initApp();
    }

    initApp() {
        this.createBackgroundParticles();
        this.createReactorParticles();
        this.initCamera();
        this.initChat();
        this.initVoiceRecognition();
        this.startReactorSimulation();
        this.checkServerHealth();
    }

    // ============ SUNUCU SAĞLIK KONTROLÜ ============
    async checkServerHealth() {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            console.log('✅ Sunucu:', data.status);
            document.getElementById('connectionStatus').innerHTML = `
                <span class="status-indicator"></span>
                <span class="status-text">SİSTEM ONLINE</span>
            `;
        } catch (error) {
            console.error('❌ Sunucu bağlantısı yok');
            document.getElementById('connectionStatus').innerHTML = `
                <span class="status-indicator" style="background:#ff4444;box-shadow:0 0 10px #ff4444;"></span>
                <span class="status-text">BAĞLANTI YOK</span>
            `;
        }
    }

    // ============ ARKA PLAN PARÇACIKLARI ============
    createBackgroundParticles() {
        const container = document.getElementById('particles');
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 3 + 1;
            const startX = Math.random() * 100;
            const duration = Math.random() * 10 + 5;
            const delay = Math.random() * 10;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${startX}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;
            
            container.appendChild(particle);
        }
    }

    // ============ REAKTÖR PARÇACIKLARI ============
    createReactorParticles() {
        const container = document.getElementById('energyParticles');
        const count = 12;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            
            const delay = (i / count) * 3;
            particle.style.animationDelay = `${delay}s`;
            
            container.appendChild(particle);
        }
    }

    // ============ REAKTÖR SIMÜLASYONU ============
    startReactorSimulation() {
        setInterval(() => {
            const power = (3.0 + Math.random() * 0.5).toFixed(1);
            const efficiency = (99.5 + Math.random() * 0.5).toFixed(1);
            const temp = (36.5 + Math.random() * 1).toFixed(1);
            
            const powerEl = document.getElementById('powerOutput');
            const effEl = document.getElementById('efficiency');
            const tempEl = document.getElementById('temperature');
            
            if (powerEl) powerEl.textContent = power;
            if (effEl) effEl.textContent = efficiency;
            if (tempEl) tempEl.textContent = temp;
        }, 2000);
    }

    // ============ KAMERA ============
    async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                } 
            });
            
            const video = document.getElementById('cameraFeed');
            if (video) {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    this.startCameraOverlay();
                    this.startFPScounter();
                };
            }
            
        } catch (err) {
            console.log('Kamera bulunamadı:', err.message);
            const hud = document.querySelector('.camera-hud');
            if (hud) {
                hud.innerHTML = '<div class="hud-item" style="color:#ff4444;">KAMERA BULUNAMADI</div>';
            }
        }
    }

    startCameraOverlay() {
        const canvas = document.getElementById('cameraOverlay');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const time = Date.now() / 1000;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            
            // Yüz tanıma karesi
            const bw = 180 + Math.sin(time * 3) * 15;
            const bh = 220 + Math.cos(time * 2.5) * 15;
            
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 + Math.sin(time) * 0.1})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - bw/2, cy - bh/2, bw, bh);
            
            // Köşeler
            const cs = 25;
            const corners = [
                [cx - bw/2, cy - bh/2, 1, 1],
                [cx + bw/2, cy - bh/2, -1, 1],
                [cx - bw/2, cy + bh/2, 1, -1],
                [cx + bw/2, cy + bh/2, -1, -1]
            ];
            
            corners.forEach(([x, y, dx, dy]) => {
                ctx.beginPath();
                ctx.moveTo(x, y + cs * dy);
                ctx.lineTo(x, y);
                ctx.lineTo(x + cs * dx, y);
                ctx.stroke();
            });
            
            // Izgara
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }

    startFPScounter() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const updateFPS = () => {
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                const fpsEl = document.getElementById('fpsCounter');
                if (fpsEl) fpsEl.textContent = frameCount;
                frameCount = 0;
                lastTime = now;
            }
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
    }

    // ============ CHAT SISTEMI ============
    initChat() {
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.voiceWave = document.getElementById('voiceWave');
        
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => this.startVoiceRecognition());
        }
    }

    async sendMessage() {
        const text = this.chatInput?.value.trim();
        if (!text || this.isProcessing) return;
        
        this.addMessage(text, 'user');
        this.chatInput.value = '';
        this.isProcessing = true;
        this.setInputDisabled(true);
        
        const thinkingMsg = this.addThinkingMessage();
        this.showVoiceWave();
        
        try {
            // 🔥 ARTIK BACKEND'E İSTEK ATIYORUZ (API anahtarı güvende!)
            const response = await this.callBackendAPI(text);
            thinkingMsg.remove();
            this.addMessage(response, 'jarvis');
        } catch (error) {
            thinkingMsg.remove();
            console.error('Hata:', error);
            this.addMessage('Üzgünüm efendim, bir hata oluştu. Sistemler yeniden başlatılıyor...', 'jarvis');
        } finally {
            this.hideVoiceWave();
            this.isProcessing = false;
            this.setInputDisabled(false);
            this.chatInput?.focus();
        }
    }

    // ============ BACKEND API ÇAĞRISI (ANAHTAR GÜVENDE!) ============
    async callBackendAPI(prompt) {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.text) {
            return data.text;
        }
        
        throw new Error(data.error || 'Beklenmeyen yanıt');
    }

    addMessage(text, type) {
        if (!this.chatMessages) return;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}-message`;
        
        const avatar = type === 'jarvis' ? 'J' : 'S';
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        msgDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${formattedText}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(msgDiv);
        this.scrollToBottom();
        
        return msgDiv;
    }

    addThinkingMessage() {
        if (!this.chatMessages) return { remove: () => {} };
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message jarvis-message thinking-message';
        msgDiv.innerHTML = `
            <div class="message-avatar">J</div>
            <div class="message-content">
                <div class="message-text">
                    <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(msgDiv);
        this.scrollToBottom();
        
        const dots = msgDiv.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.style.animation = `pulse 1s ${i * 0.2}s infinite`;
        });
        
        return msgDiv;
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    setInputDisabled(disabled) {
        if (this.chatInput) this.chatInput.disabled = disabled;
        if (this.sendButton) this.sendButton.disabled = disabled;
    }

    // ============ SES TANIMA ============
    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            if (this.voiceButton) this.voiceButton.style.display = 'none';
            console.log('Ses tanıma desteklenmiyor');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'tr-TR';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onstart = () => {
            if (this.voiceButton) this.voiceButton.classList.add('recording');
            this.showVoiceWave();
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.chatInput) this.chatInput.value = transcript;
            this.sendMessage();
        };
        
        this.recognition.onerror = (event) => {
            console.error('Ses hatası:', event.error);
            if (this.voiceButton) this.voiceButton.classList.remove('recording');
            this.hideVoiceWave();
        };
        
        this.recognition.onend = () => {
            if (this.voiceButton) this.voiceButton.classList.remove('recording');
            this.hideVoiceWave();
        };
        
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.startVoiceRecognition();
            }
        });
    }

    startVoiceRecognition() {
        if (this.recognition && !this.isProcessing) {
            try {
                this.recognition.start();
            } catch (e) {}
        }
    }

    showVoiceWave() {
        if (this.voiceWave) this.voiceWave.classList.add('active');
    }

    hideVoiceWave() {
        if (this.voiceWave) this.voiceWave.classList.remove('active');
    }
}

// ============ BAŞLAT ============
document.addEventListener('DOMContentLoaded', () => {
    window.jarvis = new JARVIS();
    console.log('🤖 J.A.R.V.I.S. sistemleri aktif!');
    console.log('💡 Ctrl+M ile sesli komut');
});
