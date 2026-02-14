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
    if (!u || !p) return alert("Details poorthiga nampu mama!");

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
    const taskInput = document.querySelector("#taskInput");
    const reminderInput = document.querySelector("#reminderInput");
    
    if (!taskInput.value) return alert("Task enter chey mama!");

    try {
        const response = await fetch(`${API_URL}/add-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                task: taskInput.value, 
                userId: currentUserId, 
                reminderTime: reminderInput.value || null 
            })
        });

        if (response.ok) {
            // ✅ RESET FIX: Input values ni blank chesi force refresh
            taskInput.value = ""; 
            reminderInput.value = ""; 
            taskInput.blur();
            reminderInput.blur();

            new Notification("Task Added!", { body: "Nee task save ayyindi mama!" });
            getTasks();
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// 4. Get Tasks (Timezone Display Fix)
async function getTasks() {
    const res = await fetch(`${API_URL}/get-tasks/${currentUserId}`);
    const tasks = await res.json();
    
    const taskList = document.getElementById("taskList");
    const historyList = document.getElementById("historyList");
    
    taskList.innerHTML = "";
    historyList.innerHTML = "";
    
    tasks.forEach(t => {
        // Timezone formatting fix: 
        // Database time lo 'T' unna lekapoyina, direct ga slice chesthunnam
        let displayTime = "No Time";
        if (t.reminder_time) {
            displayTime = t.reminder_time.replace('T', ' ').substring(0, 16);
        }

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
                        `<button class="btn btn-sm btn-success me-2" onclick="completeTask(${t.id})">Done ✅</button>` : ''}
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

async function checkAlarms() {
    if (!currentUserId) return;

    const res = await fetch(`${API_URL}/get-tasks/${currentUserId}`);
    const tasks = await res.json();
    
    const now = new Date();
    // System Local Time format (YYYY-MM-DDTHH:MM)
    const nowStr = now.getFullYear() + "-" + 
                   String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                   String(now.getDate()).padStart(2, '0') + "T" + 
                   String(now.getHours()).padStart(2, '0') + ":" + 
                   String(now.getMinutes()).padStart(2, '0');

    tasks.forEach(t => {
        if (t.status === 'pending' && t.reminder_time) {
            // Match cheyadaniki database string ni format chesthunnam
            const taskTime = t.reminder_time.substring(0, 16).replace(' ', 'T');
            
            if (taskTime === nowStr) {
                if (Notification.permission === "granted") {
                    new Notification("Todo Alarm! 🔔", {
                        body: `Mama, Time ayyindi: ${t.task_name}`,
                        icon: "https://cdn-icons-png.flaticon.com/512/906/906334.png"
                    });
                } else {
                    alert("ALARM: " + t.task_name);
                }
            }
        }
    });
}