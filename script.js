// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqgeR4sifObiXhXI6BYIVwfIaDw6Cw2yU",
  authDomain: "metas-e-recompensas.firebaseapp.com",
  projectId: "metas-e-recompensas",
  storageBucket: "metas-e-recompensas.firebasestorage.app",
  messagingSenderId: "659781973966",
  appId: "1:659781973966:web:8ab2baa166f1479437dd9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Estrutura de dados para as metas (vocês podem personalizar)
const initialGoals = {
    user1: { // Você (Plantão)
        points: 0,
        daily: [
            { id: 'u1d1', text: "Treino do dia", points: 10, completed: false },
            { id: 'u1d2', text: "Ler 20 min", points: 5, completed: false },
            { id: 'u1d3', text: "Estudar 1h", points: 10, completed: false }
        ],
        weekly: [
            { id: 'u1w1', text: "2 treinos na semana", points: 30, completed: false },
            { id: 'u1w2', text: "Seguir plano alimentar 5 dias", points: 30, completed: false },
            { id: 'u1w3', text: "Terminar X capítulos/livro", points: 20, completed: false }
        ]
    },
    user2: { // Ela (8h/dia)
        points: 0,
        daily: [
            { id: 'u2d1', text: "Treino do dia", points: 10, completed: false },
            { id: 'u2d2', text: "Ler 30 min", points: 5, completed: false },
            { id: 'u2d3', text: "Estudar 1.5h", points: 10, completed: false }
        ],
        weekly: [
            { id: 'u2w1', text: "4 treinos na semana", points: 30, completed: false },
            { id: 'u2w2', text: "Seguir plano alimentar 6 dias", points: 40, completed: false },
            { id: 'u2w3', text: "Concluir X módulos/horas estudo", points: 30, completed: false }
        ]
    }
};

const rewards = [
    { id: 'r1', text: "1h de Série/Filme/Anime", cost: 15 },
    { id: 'r2', text: "1 Refeição Livre", cost: 80 },
    { id: 'r3', text: "1h de Videogame", cost: 20 },
    { id: 'r4', text: "30min de Redes Sociais (sem culpa!)", cost: 10 },
    { id: 'r5', text: "Noite de Filme em Casal (somar pontos)", cost: 60 } // Exemplo para casal
];

// Referências aos elementos do HTML
const user1DailyGoalsEl = document.getElementById('user1-daily-goals');
const user1WeeklyGoalsEl = document.getElementById('user1-weekly-goals');
const user1PointsEl = document.getElementById('user1-points');

const user2DailyGoalsEl = document.getElementById('user2-daily-goals');
const user2WeeklyGoalsEl = document.getElementById('user2-weekly-goals');
const user2PointsEl = document.getElementById('user2-points');

const rewardsListEl = document.getElementById('rewards-list');

// Função para renderizar as metas
function renderGoals(userId, dailyGoalsEl, weeklyGoalsEl, goalsData) {
    dailyGoalsEl.innerHTML = '';
    weeklyGoalsEl.innerHTML = '';

    goalsData.daily.forEach(goal => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = goal.id;
        checkbox.checked = goal.completed;
        checkbox.onchange = () => toggleGoal(userId, 'daily', goal.id, goal.points);

        const label = document.createElement('label');
        label.htmlFor = goal.id;
        label.textContent = `${goal.text} (+${goal.points}pts)`;
        if (goal.completed) {
            label.classList.add('completed');
        }

        li.appendChild(checkbox);
        li.appendChild(label);
        dailyGoalsEl.appendChild(li);
    });

    goalsData.weekly.forEach(goal => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = goal.id;
        checkbox.checked = goal.completed;
        checkbox.onchange = () => toggleGoal(userId, 'weekly', goal.id, goal.points);

        const label = document.createElement('label');
        label.htmlFor = goal.id;
        label.textContent = `${goal.text} (+${goal.points}pts)`;
        if (goal.completed) {
            label.classList.add('completed');
        }

        li.appendChild(checkbox);
        li.appendChild(label);
        weeklyGoalsEl.appendChild(li);
    });
}

// Função para renderizar as recompensas
function renderRewards() {
    rewardsListEl.innerHTML = '';
    rewards.forEach(reward => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${reward.text} (Custo: ${reward.cost}pts)</span>
            <div>
                <button onclick="redeemReward('user1', ${reward.cost})">Resgatar (Você)</button>
                <button onclick="redeemReward('user2', ${reward.cost})">Resgatar (Ela)</button>
            </div>
        `;
        // Para recompensas de casal, você pode ter um botão único ou lógica para debitar de ambos
        rewardsListEl.appendChild(li);
    });
}

// Função para marcar/desmarcar meta e atualizar pontos
function toggleGoal(userId, goalType, goalId, pointsValue) {
    const userRef = database.ref('users/' + userId);
    userRef.once('value').then(snapshot => {
        const userData = snapshot.val();
        if (!userData) return;

        const goal = userData[goalType].find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            const newPoints = userData.points + (goal.completed ? pointsValue : -pointsValue);
            
            // Garantir que os pontos não fiquem negativos ao desmarcar
            const finalPoints = Math.max(0, newPoints);

            database.ref('users/' + userId + '/' + goalType).set(userData[goalType]);
            database.ref('users/' + userId + '/points').set(finalPoints);
        }
    });
}

// Função para resgatar recompensa
function redeemReward(userId, cost) {
    const userRef = database.ref('users/' + userId);
    userRef.once('value').then(snapshot => {
        const userData = snapshot.val();
        if (userData && userData.points >= cost) {
            const newPoints = userData.points - cost;
            database.ref('users/' + userId + '/points').set(newPoints);
            alert('Recompensa resgatada!');
        } else {
            alert('Pontos insuficientes!');
        }
    });
}

// Funções para resetar metas
function resetGoals(userId, type) {
    const userRef = database.ref('users/' + userId + '/' + type);
    const initialUserGoals = initialGoals[userId][type];

    const resetGoalsArray = initialUserGoals.map(goal => ({ ...goal, completed: false }));
    
    userRef.set(resetGoalsArray)
        .then(() => {
            console.log(`${type} goals for ${userId} reset successfully.`);
            // Forçar recarregamento dos dados para refletir o reset na UI
            loadData(); 
        })
        .catch(error => console.error(`Error resetting ${type} goals for ${userId}:`, error));
}


function resetDailyGoals(userId) {
    if (confirm(`Tem certeza que deseja resetar as metas DIÁRIAS de ${userId === 'user1' ? 'Você' : 'Ela'}?`)) {
        resetGoals(userId, 'daily');
    }
}

function resetWeeklyGoals(userId) {
     if (confirm(`Tem certeza que deseja resetar as metas SEMANAIS de ${userId === 'user1' ? 'Você' : 'Ela'}?`)) {
        resetGoals(userId, 'weekly');
    }
}


// Carregar dados do Firebase ou inicializar
function loadData() {
    const usersRef = database.ref('users');
    usersRef.on('value', snapshot => { // 'on' escuta mudanças em tempo real
        const usersData = snapshot.val();
        if (usersData) {
            if (usersData.user1) {
                renderGoals('user1', user1DailyGoalsEl, user1WeeklyGoalsEl, usersData.user1);
                user1PointsEl.textContent = usersData.user1.points || 0;
            } else { // Inicializa se não existir
                database.ref('users/user1').set(initialGoals.user1);
            }

            if (usersData.user2) {
                renderGoals('user2', user2DailyGoalsEl, user2WeeklyGoalsEl, usersData.user2);
                user2PointsEl.textContent = usersData.user2.points || 0;
            } else { // Inicializa se não existir
                database.ref('users/user2').set(initialGoals.user2);
            }
        } else {
            // Se não houver dados de 'users', inicializa ambos
            database.ref('users').set(initialGoals);
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderRewards();
});