const API_URL = "https://todo-backend-varun.onrender.com";

// Page load avvagane tasks load cheyali
window.onload = getTasks;

async function getTasks() {
    try {
        const res = await fetch(`${API_URL}/get-tasks`);
        const tasks = await res.json();
        
        // 1. Nee HTML lo ee IDs pakka undali mama
        const todoList = document.getElementById('todoList');
        const historyList = document.getElementById('historyList');
        
        if (!todoList || !historyList) {
            console.error("HTML lo todoList leda historyList IDs levu mama!");
            return;
        }

        todoList.innerHTML = '';
        historyList.innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            // Backend nundi 'status' ane peru tho data ostundi
            const isCompleted = task.status === 'completed';

            li.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                        onclick="toggleComplete(${task.id}, '${task.status}')">
                    <span style="${isCompleted ? 'text-decoration: line-through; color: gray;' : ''}">
    ${task.task_name || task.task || "Unnamed Task"} 
</span>
                </div>
                <div>
                    <small style="font-size:10px; color:gray;">
                        ${task.completed_at ? new Date(task.completed_at).toLocaleString() : ''}
                    </small>
                    <span class="delete-btn" onclick="deleteTask(${task.id})" style="cursor:pointer; color:red; margin-left:10px;"> X</span>
                </div>
            `;

            // 2. Status batti list loki pampali
            if (isCompleted) {
                historyList.appendChild(li);
            } else {
                todoList.appendChild(li);
            }
        });
    } catch (err) {
        console.error("Tasks load avvatledhu:", err);
    }
}

async function toggleComplete(id, currentStatus) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    
    await fetch(`${API_URL}/update-task/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    getTasks(); // List refresh chey
}
// Patha line: const isDone = task.status === 'completed' ? 'style="..."' : '';
// Kotha line (Class based):
// const completedClass = task.status === 'completed' ? 'class="completed"' : '';

// li.innerHTML = `
//     <span ${completedClass} onclick="toggleComplete(${task.id}, '${task.status}')" style="cursor:pointer">
//         ${task.task_name}
//     </span>
//     <span class="delete-btn" onclick="deleteTask(${task.id})">X</span>
// `;

async function addTask() {
    const input = document.getElementById('todoInput');
    const taskText = input.value;

    if (!taskText) return;

    try {
        const response = await fetch(`${API_URL}/add-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskText }) // Backend lo 'task' ani catch chestunnam
        });

        if (response.ok) {
            input.value = '';
            getTasks(); // List refresh cheyadaniki
        } else {
            console.error("Server error:", await response.text());
        }
    } catch (err) {
        console.error("Network error:", err);
        alert("Server connect avvaledu mama!");
    }
}

async function deleteTask(id) {
    await fetch(`${API_URL}/delete-task/${id}`, {
        method: 'DELETE'
    });
    getTasks(); // Refresh list
}