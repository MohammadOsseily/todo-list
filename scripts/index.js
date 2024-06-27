document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskDateTime = document.getElementById('task-datetime');
    const taskAssignee = document.getElementById('task-assignee');
    const pendingList = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    const pastDueList = document.getElementById('past-due-list');

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    console.log(tasks);

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function removeTask(task, li) {
        const index = tasks.indexOf(task);
        if (index > -1) {
            tasks.splice(index, 1);
            li.remove();
            saveTasks();
        }
    }

    function addTaskToList(task) {
        const li = document.createElement('li');

        li.setAttribute('draggable', true);
        li.innerHTML = `
            <span style="width:100% ">${task.text} -<span style="font-weight : bolder;">Assigned to: </span>  ${task.assignee}</span>
            <div style=" display: flex; align-items: baseline; width: 100%; flex-direction: row;">
                <span>Due to: ${task.dateTime}</span>
                <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''}>
                <button class="delete">X</button>
            </div>
        `;
        if (task.status === 'pending') {
            pendingList.appendChild(li);
        } else if (task.status === 'completed') {
            li.classList.add('completed');
            completedList.appendChild(li);
        } else if (task.status === 'past-due') {
            li.classList.add('past-due');
            pastDueList.appendChild(li);
        }

        li.querySelector('input').addEventListener('change', function() {
            if (this.checked) {
                task.status = 'completed';
                li.classList.add('completed');
                completedList.appendChild(li);
            } else {
                task.status = 'pending';
                li.classList.remove('completed');
                pendingList.appendChild(li);
            }
            saveTasks();
        });

        li.querySelector('.delete').addEventListener('click', function() {
            removeTask(task, li);
        });

        li.addEventListener('dragstart', function() {
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', function() {
            li.classList.remove('dragging');
            const checkbox = li.querySelector('input[type="checkbox"]');
            task.status = 'completed';
            checkbox.checked = true;
            li.classList.add('completed');
            completedList.appendChild(li);
            saveTasks();
        });
    }

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newTask = {
            text: taskInput.value,
            dateTime: taskDateTime.value,
            assignee: taskAssignee.value,
            status: 'pending'
        };
        tasks.push(newTask);
        addTaskToList(newTask);
        saveTasks();
        taskForm.reset();
    });

    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragover', function(e) {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            column.querySelector('ul').appendChild(draggingTask);
        });
    });

    function checkPastDueTasks() {
        const now = new Date().getTime();

        tasks.forEach(task => {
            let dateNow = new Date(task.dateTime).getTime();

            if (task.dateTime != undefined) {
                if (task.status === 'pending' && dateNow <= now) {
                    task.status = 'past-due';
                    const taskElements = [...pendingList.children];
                    taskElements.forEach(li => {
                        const taskText = li.querySelector('span').textContent;
                        if (taskText.includes(task.text)) {
                            li.classList.add('past-due');
                            pastDueList.appendChild(li);
                        }
                    });
                }
            }
        });
        saveTasks();
    }

    tasks.forEach(addTaskToList);
    setInterval(checkPastDueTasks, 2000);
});
