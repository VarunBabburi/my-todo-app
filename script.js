const API_URL = "https://todo-backend-varun.onrender.com";

// Page load avvagane tasks load cheyali
window.onload = getTasks;

async function getTasks() {
    const res = await fetch(`${API_URL}/get-tasks`);
    const tasks = await res.json();
    
    const todoList = document.getElementById('todoList');
    const historyList = document.getElementById('historyList');
    
    todoList.innerHTML = '';
    historyList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        const isCompleted = task.status === 'completed';

        // Checkbox logic
        li.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                    onclick="toggleComplete(${task.id}, '${task.status}')">
                <span class="${isCompleted ? 'completed' : ''}">${task.task_name}</span>
            </div>
            <div>
                <small style="font-size:10px; color:gray;">
                    ${task.completed_at ? new Date(task.completed_at).toLocaleString() : ''}
                </small>
                <span class="delete-btn" onclick="deleteTask(${task.id})"> X</span>
            </div>
        `;

        if (isCompleted) {
            historyList.appendChild(li);
        } else {
            todoList.appendChild(li);
        }
    });
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
const completedClass = task.status === 'completed' ? 'class="completed"' : '';

li.innerHTML = `
    <span ${completedClass} onclick="toggleComplete(${task.id}, '${task.status}')" style="cursor:pointer">
        ${task.task_name}
    </span>
    <span class="delete-btn" onclick="deleteTask(${task.id})">X</span>
`;

async function addTask() {
    const input = document.getElementById('todoInput');
    const taskText = input.value;

    if (!taskText) return;

    await fetch(`${API_URL}/add-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskText })
    });

    input.value = '';
    getTasks(); // Refresh list
}

async function deleteTask(id) {
    await fetch(`${API_URL}/delete-task/${id}`, {
        method: 'DELETE'
    });
    getTasks(); // Refresh list
}