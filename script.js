const API_URL = "https://todo-backend-varun.onrender.com";
let currentUserId = localStorage.getItem("userId");
let currentUserName = localStorage.getItem("userName");

// App open avvagane login status check cheyali
window.onload = () => {
    if (currentUserId) {
        showApp();
    }
};

// 1. Signup Logic
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

// 2. Login Logic
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

// UI ni marchadam
function showApp() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";
    document.getElementById("display-name").innerText = currentUserName;
    getTasks();
}

// 3. Get Tasks (UserId pampali ikkada)
async function getTasks() {
    if (!currentUserId) return;
    const res = await fetch(`${API_URL}/get-tasks/${currentUserId}`); // Backend route ki match avvali
    const tasks = await res.json();
    
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    
    tasks.forEach(t => {
        taskList.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                    <strong>${t.task_name}</strong> 
                    <br><small class="text-muted">Reminder: ${t.reminder_time ? new Date(t.reminder_time).toLocaleString() : 'No reminder'}</small>
                </span>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})">Delete</button>
            </li>
        `;
    });
}

// 4. Add Task
async function addTask() {
    const task = document.getElementById("taskInput").value;
    const reminder = document.getElementById("reminderInput").value;
    if (!task) return alert("Task enter chey mama!");

    await fetch(`${API_URL}/add-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            task: task, 
            userId: currentUserId, 
            reminderTime: reminder || null 
        })
    });
    document.getElementById("taskInput").value = ""; // Task box clear chestundi
    document.getElementById("reminderInput").value = ""; // Date/Time box ni reset chestundi (Idhi add chey)
    getTasks();
}

// 5. Delete Task
async function deleteTask(id) {
    await fetch(`${API_URL}/delete-task/${id}`, { method: 'DELETE' });
    getTasks();
}

function logout() {
    localStorage.clear();
    location.reload();
}