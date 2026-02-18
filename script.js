const API_URL = "https://todo-backend-varun.onrender.com";
let currentUserId = localStorage.getItem("userId");
let currentUserName = localStorage.getItem("userName");

// 1. App open avvagane initialization
window.onload = () => {
    if (currentUserId) {
        showApp();
    }
    // Mobile notifications permission
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
};

// 2. Signup & Login (Unna code eh, em marchaledhu)
async function signup() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    if (!u || !p) return alert("Details poorthiga nimpu mama!");

    const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    alert(data.message || data.error);
}

async function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (data.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.username);
        currentUserId = data.userId;
        currentUserName = data.username;
        showApp();
    } else {
        alert("Thappu details kottav mama!");
    }
}

function showApp() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";
    document.getElementById("display-name").innerText = currentUserName;
    getTasks();
}

// 3. Add Task (Aggressive Reset & Notification Fix)
async function addTask() {
    const tInput = document.getElementById("taskInput");
    const rInput = document.getElementById("reminderInput");

    if (!tInput.value) return alert("Task raye mama!");

    try {
        await fetch(`${API_URL}/add-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                task: tInput.value, 
                userId: currentUserId, 
                reminderTime: rInput.value || null 
            })
        });

        // ✅ AGGRESSIVE RESET: 
        // Ikkada manual ga empty chesthunnam.
        tInput.value = ""; 
        rInput.value = ""; 

        // List refresh cheyadam
        getTasks();
        
    } catch (err) {
        alert("Server connection error!");
    }
}

// 4. Get Tasks (Timezone Display Fix)
// 2. Get Tasks (Timezone and Reset issues fixed ikkada)
async function getTasks() {
    try {
        const res = await fetch(`${API_URL}/get-tasks/${currentUserId}`);
        const tasks = await res.json();
        
        const taskList = document.getElementById("taskList");
        const historyList = document.getElementById("historyList");
        
        // Pathavi clear cheyadam
        taskList.innerHTML = "";
        historyList.innerHTML = "";
        
        tasks.forEach(t => {
            // ✅ TIMEZONE FIX: 
            // Browser system time tho sambandham lekunda, 
            // database string ni direct ga cut chesthunnam.
            const dbTime = t.reminder_time; 
            const displayTime = dbTime ? dbTime.substring(0, 16).replace('T', ' ') : 'No Time';

            const itemHtml = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                        <strong style="${t.status === 'completed' ? 'text-decoration: line-through; color: gray;' : ''}">
                            ${t.task_name}
                        </strong> 
                        <br><small class="text-muted">Set for: ${displayTime}</small>
                    </span>
                    <div>
                        ${t.status === 'pending' ? 
                            `<button class="btn btn-sm btn-outline-success me-2" onclick="completeTask(${t.id})">Done ✅</button>` : ''}
                        <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})">Erase 🗑️</button>
                    </div>
                </li>
            `;

            if (t.status === 'pending') {
                taskList.innerHTML += itemHtml;
            } else {
                historyList.innerHTML += itemHtml;
            }
        });
    } catch (err) {
        console.error("Tasks load avvatledhu mama:", err);
    }
}

// 5. Complete & Delete Logic
async function completeTask(id) {
    await fetch(`${API_URL}/complete-task/${id}`, { method: 'PUT' });
    getTasks();
}

async function deleteTask(id) {
    await fetch(`${API_URL}/delete-task/${id}`, { method: 'DELETE' });
    getTasks();
}

function logout() {
    localStorage.clear();
    location.reload();
}

// 6. ALARM SYSTEM (60 seconds ki okasari check chesthundhi)
setInterval(() => {
    checkAlarms();
}, 60000);

// 1. Alarm Sound kosam oka variable (Inthaku mundu ekkadaina top lo pettu)
// 1. Manchi Loud Sound okati pettuko mama
// Manchi loud sound link idi, okkasari browser lo open chesi chudu mama sound osthundo ledo
const alarmSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_loop.ogg");
alarmSound.loop = true; // Alarm aagakunda moguthune untundhi

async function checkAlarms() {
    if (!currentUserId) return;

    try {
        const res = await fetch(`${API_URL}/get-tasks/${currentUserId}`);
        const tasks = await res.json();
        
        const now = new Date();
        const nowStr = now.getFullYear() + "-" + 
                       String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                       String(now.getDate()).padStart(2, '0') + "T" + 
                       String(now.getHours()).padStart(2, '0') + ":" + 
                       String(now.getMinutes()).padStart(2, '0');

        tasks.forEach(t => {
            if (t.status === 'pending' && t.reminder_time) {
                const taskTime = t.reminder_time.substring(0, 16).replace(' ', 'T');
                
                if (taskTime === nowStr) {
                    // ✅ FORCE PLAY: Browser block chesina play cheyamani chepthunnam
                    alarmSound.play().catch(error => {
                        console.log("Browser sound block chesindi mama! Screen meeda okasari click chey.");
                    });

                    // Vibrate phone
                    if (navigator.vibrate) navigator.vibrate([500, 300, 500]);

                    // Alert vachinappudu manam "OK" kotte daka sound moguthune untundi
                    setTimeout(() => {
                        if(confirm("⏰ ALARM: " + t.task_name + "\n\nSound aapalante OK kottu mama!")) {
                            alarmSound.pause();
                            alarmSound.currentTime = 0;
                        }
                    }, 500);
                }
            }
        });
    } catch (e) {
        console.log("Check alarms error");
    }
}