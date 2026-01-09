/**
 * AquaShield AI - Typhoon AI Integration
 * Thai LLM for flood risk analysis and chatbot
 */

// ============================================
// TYPHOON AI API
// ============================================

class TyphoonAI {
    constructor() {
        this.apiKey = CONFIG.TYPHOON_API_KEY;
        this.apiUrl = CONFIG.TYPHOON_API_URL;
        this.model = 'typhoon-v1.5x-70b-instruct';
        this.systemPrompt = `คุณคือ "AquaShield AI" ผู้ช่วย AI อัจฉริยะสำหรับระบบเตือนภัยน้ำท่วมฉับพลันในกรุงเทพมหานครและปริมณฑล ประเทศไทย

หน้าที่ของคุณ:
1. วิเคราะห์และสรุปสถานการณ์สภาพอากาศ/ความเสี่ยงน้ำท่วม
2. ให้คำแนะนำการเตรียมตัวรับมือน้ำท่วม
3. ตอบคำถามเกี่ยวกับสภาพอากาศและน้ำท่วม
4. ให้ข้อมูลที่ถูกต้อง เข้าใจง่าย เป็นภาษาไทย

พื้นที่ครอบคลุม (กรุงเทพฯ และปริมณฑล):
- กรุงเทพมหานคร (50 เขต)
- สมุทรปราการ: เมืองสมุทรปราการ, บางพลี, บางบ่อ, พระประแดง, พระสมุทรเจดีย์, บางเสาธง
- นนทบุรี: เมืองนนทบุรี, ปากเกร็ด, บางกรวย, บางบัวทอง, ไทรน้อย, บางใหญ่
- ปทุมธานี: เมืองปทุมธานี, ธัญบุรี, ลำลูกกา, คลองหลวง, หนองเสือ, สามโคก
- สมุทรสาคร: เมืองสมุทรสาคร, กระทุ่มแบน, บ้านแพ้ว
- นครปฐม: เมืองนครปฐม, สามพราน, พุทธมณฑล

ตอบสั้นกระชับ ใช้ภาษาที่เข้าใจง่าย หากมีความเสี่ยงสูงให้เตือนชัดเจน`;
    }


    // Call Typhoon API
    async chat(userMessage, weatherData = null) {
        try {
            let contextMessage = userMessage;

            // Add weather context if available
            if (weatherData) {
                contextMessage = `ข้อมูลสภาพอากาศปัจจุบัน:
- อุณหภูมิ: ${weatherData.temp}°C
- ความชื้น: ${weatherData.humidity}%
- ปริมาณฝน: ${weatherData.rain} mm
- ความเร็วลม: ${weatherData.wind} m/s
- ความเสี่ยง: ${weatherData.riskLevel}

คำถาม: ${userMessage}`;
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: this.systemPrompt },
                        { role: 'user', content: contextMessage }
                    ],
                    max_tokens: 512,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Typhoon AI Error:', error);
            return 'ขออภัย ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
        }
    }

    // Generate weather summary
    async generateSummary(weatherData) {
        const prompt = `สรุปสถานการณ์สภาพอากาศและความเสี่ยงน้ำท่วมในกรุงเทพฯและปริมณฑลให้สั้นกระชับ (ไม่เกิน 3 ประโยค) 

ข้อมูล:
- อุณหภูมิ: ${weatherData.temp}°C
- ความชื้น: ${weatherData.humidity}%
- ปริมาณฝน: ${weatherData.rain} mm
- ความเร็วลม: ${weatherData.wind} m/s
- สภาพอากาศ: ${weatherData.description}
- วันที่: ${new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

        return await this.chat(prompt);
    }
}

// ============================================
// AI SUMMARY COMPONENT
// ============================================

function initAISummary() {
    const summaryContainer = document.getElementById('aiSummary');
    if (!summaryContainer) return;

    // Show loading
    summaryContainer.innerHTML = `
        <div class="ai-summary-loading">
            <i class="fa-solid fa-robot fa-spin"></i>
            <span>AI กำลังวิเคราะห์...</span>
        </div>
    `;

    // Get weather data and generate summary
    getWeatherAndGenerateSummary();
}

async function getWeatherAndGenerateSummary() {
    try {
        // Fetch current weather
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${CONFIG.LAT}&lon=${CONFIG.LON}&appid=${CONFIG.OWM_KEY}&units=metric&lang=th`
        );
        const weather = await weatherResponse.json();

        const weatherData = {
            temp: weather.main.temp.toFixed(1),
            humidity: weather.main.humidity,
            rain: weather.rain ? weather.rain['1h'] || 0 : 0,
            wind: weather.wind.speed,
            description: weather.weather[0].description,
            riskLevel: calculateRiskLevel(weather)
        };

        // Generate AI summary
        const typhoonAI = new TyphoonAI();
        const summary = await typhoonAI.generateSummary(weatherData);

        // Update UI
        updateAISummary(summary, weatherData);

    } catch (error) {
        console.error('Error generating AI summary:', error);
        document.getElementById('aiSummary').innerHTML = `
            <div class="ai-summary-error">
                <i class="fa-solid fa-exclamation-circle"></i>
                <span>ไม่สามารถโหลดข้อมูลได้</span>
            </div>
        `;
    }
}

function calculateRiskLevel(weather) {
    const rain = weather.rain ? weather.rain['1h'] || 0 : 0;
    const humidity = weather.main.humidity;

    if (rain > 20 || humidity > 90) return 'สูง';
    if (rain > 5 || humidity > 75) return 'ปานกลาง';
    return 'ต่ำ';
}

function updateAISummary(summary, weatherData) {
    const container = document.getElementById('aiSummary');
    if (!container) return;

    const riskColors = { 'สูง': '#EF4444', 'ปานกลาง': '#F59E0B', 'ต่ำ': '#22C55E' };
    const riskColor = riskColors[weatherData.riskLevel] || riskColors['ต่ำ'];

    container.innerHTML = `
        <div class="ai-summary-content">
            <div class="ai-summary-header">
                <div class="ai-icon">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="ai-title">
                    <span class="title-text">AI สรุปสถานการณ์</span>
                    <span class="update-time">อัพเดต: ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="risk-badge" style="background: ${riskColor}">
                    ความเสี่ยง: ${weatherData.riskLevel}
                </div>
            </div>
            <div class="ai-summary-text">
                ${summary}
            </div>
            <div class="ai-summary-stats">
                <div class="stat-item">
                    <i class="fa-solid fa-temperature-half"></i>
                    <span>${weatherData.temp}°C</span>
                </div>
                <div class="stat-item">
                    <i class="fa-solid fa-droplet"></i>
                    <span>${weatherData.humidity}%</span>
                </div>
                <div class="stat-item">
                    <i class="fa-solid fa-cloud-rain"></i>
                    <span>${weatherData.rain} mm</span>
                </div>
                <div class="stat-item">
                    <i class="fa-solid fa-wind"></i>
                    <span>${weatherData.wind} m/s</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// AI CHATBOT COMPONENT
// ============================================

let chatHistory = [];
let currentWeatherData = null;

function initChatbot() {
    // Create chatbot HTML
    const chatbotHTML = `
        <div class="chatbot-container" id="chatbotContainer">
            <!-- Floating Button -->
            <button class="chatbot-fab" id="chatbotFab">
                <i class="fa-solid fa-robot" id="fabIcon"></i>
            </button>
            
            <!-- Chat Window -->
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="chatbot-info">
                        <span class="chatbot-name">AquaShield AI</span>
                        <span class="chatbot-status">ออนไลน์</span>
                    </div>
                    <button class="chatbot-close" id="chatbotClose">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="chat-message bot">
                        <div class="message-avatar">
                            <i class="fa-solid fa-robot"></i>
                        </div>
                        <div class="message-content">
                            สวัสดีครับ! ผมคือ AquaShield AI ผู้ช่วยวิเคราะห์สภาพอากาศและความเสี่ยงน้ำท่วม 🌊<br><br>
                            คุณสามารถถามได้เลย เช่น:<br>
                            • "สถานการณ์น้ำท่วมตอนนี้เป็นยังไง?"<br>
                            • "ควรเตรียมตัวรับมือน้ำท่วมอย่างไร?"<br>
                            • "พื้นที่ไหนเสี่ยงที่สุด?"
                        </div>
                    </div>
                </div>
                <div class="chatbot-input-container">
                    <input type="text" class="chatbot-input" id="chatbotInput" 
                           placeholder="พิมพ์ข้อความ..." autocomplete="off">
                    <button class="chatbot-send" id="chatbotSend">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Setup event listeners
    setupChatbotEvents();

    // Fetch initial weather data
    fetchCurrentWeatherForChat();
}

function setupChatbotEvents() {
    const fab = document.getElementById('chatbotFab');
    const window_ = document.getElementById('chatbotWindow');
    const close = document.getElementById('chatbotClose');
    const input = document.getElementById('chatbotInput');
    const send = document.getElementById('chatbotSend');
    const fabIcon = document.getElementById('fabIcon');

    // Toggle chat window
    fab.addEventListener('click', () => {
        window_.classList.toggle('open');
        if (window_.classList.contains('open')) {
            fabIcon.className = 'fa-solid fa-times';
            input.focus();
        } else {
            fabIcon.className = 'fa-solid fa-robot';
        }
    });

    close.addEventListener('click', () => {
        window_.classList.remove('open');
        fabIcon.className = 'fa-solid fa-robot';
    });

    // Send message
    send.addEventListener('click', sendChatMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    if (!message) return;

    // Clear input
    input.value = '';

    // Add user message to UI
    addChatMessage('user', message);

    // Show typing indicator
    showTypingIndicator();

    // Send to AI
    const typhoonAI = new TyphoonAI();
    const response = await typhoonAI.chat(message, currentWeatherData);

    // Remove typing indicator
    hideTypingIndicator();

    // Add AI response
    addChatMessage('bot', response);

    // Store history
    chatHistory.push({ role: 'user', content: message });
    chatHistory.push({ role: 'assistant', content: response });
}

function addChatMessage(type, content) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageHTML = `
        <div class="chat-message ${type}">
            ${type === 'bot' ? '<div class="message-avatar"><i class="fa-solid fa-robot"></i></div>' : ''}
            <div class="message-content">${content}</div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    messagesContainer.insertAdjacentHTML('beforeend', `
        <div class="chat-message bot typing-indicator" id="typingIndicator">
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content">
                <span class="typing-dots">
                    <span></span><span></span><span></span>
                </span>
            </div>
        </div>
    `);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function fetchCurrentWeatherForChat() {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${CONFIG.LAT}&lon=${CONFIG.LON}&appid=${CONFIG.OWM_KEY}&units=metric&lang=th`
        );
        const weather = await response.json();
        currentWeatherData = {
            temp: weather.main.temp.toFixed(1),
            humidity: weather.main.humidity,
            rain: weather.rain ? weather.rain['1h'] || 0 : 0,
            wind: weather.wind.speed,
            description: weather.weather[0].description,
            riskLevel: calculateRiskLevel(weather)
        };
    } catch (error) {
        console.error('Error fetching weather for chat:', error);
    }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AI Summary if on dashboard
    if (document.getElementById('aiSummary')) {
        initAISummary();
    }

    // Initialize Chatbot
    initChatbot();
});
