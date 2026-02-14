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
// 1. Add Task (Reset fix tho)
async function addTask() {
    const taskBox = document.getElementById("taskInput");
    const reminderBox = document.getElementById("reminderInput");
    
    if (!taskBox.value) return alert("Task enter chey mama!");

    await fetch(`${API_URL}/add-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            task: taskBox.value, 
            userId: currentUserId, 
            reminderTime: reminderBox.value || null 
        })
    });

    // Resetting inputs - Idi pakka pani chestundi
    taskBox.value = ""; 
    reminderBox.value = ""; 
    getTasks();
}

// 2. Get Tasks (History filter tho)
async function getTasks() {
    const res = await fetch(`${API_URL}/get-tasks/${currentUserId}`);
    const tasks = await res.json();
    
    const taskList = document.getElementById("taskList");
    const historyList = document.getElementById("historyList");
    
    taskList.innerHTML = "";
    historyList.innerHTML = "";
    
    tasks.forEach(t => {
        const itemHtml = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                    <strong style="${t.status === 'completed' ? 'text-decoration: line-through; color: gray;' : ''}">
                        ${t.task_name}
                    </strong> 
                    <br><small class="text-muted">${t.reminder_time ? new Date(t.reminder_time).toLocaleString() : ''}</small>
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
}

// 3. Complete Task Function
async function completeTask(id) {
    await fetch(`${API_URL}/complete-task/${id}`, { method: 'PUT' });
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