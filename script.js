// Dicionários de caracteres
const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Elementos do DOM
const passwordDisplay = document.getElementById('password-display');
const copyBtn = document.getElementById('copy-btn');
const generateBtn = document.getElementById('generate-btn');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const strengthText = document.getElementById('strength-text');
const strengthBar = document.getElementById('strength-bar');

const checkboxes = {
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols')
};

// Atualiza o número do tamanho na tela em tempo real
lengthSlider.addEventListener('input', (e) => {
    lengthVal.textContent = e.target.value;
});

// Função principal de geração
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let allowedChars = '';
    let guaranteedChars = [];

    // Verifica quais opções estão marcadas
    Object.keys(checkboxes).forEach(key => {
        if (checkboxes[key].checked) {
            const chars = CHAR_SETS[key];
            allowedChars += chars;
            // Garante pelo menos um caractere de cada tipo selecionado
            guaranteedChars.push(chars[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % chars.length)]);
        }
    });

    // Se nenhuma caixinha estiver marcada
    if (allowedChars === '') {
        passwordDisplay.textContent = 'Selecione pelo menos uma opção!';
        passwordDisplay.classList.replace('text-emerald-400', 'text-amber-500');
        updateStrength(0);
        return;
    }

    let passwordArray = [...guaranteedChars];
    const remainingLength = length - guaranteedChars.length;

    // USANDO CRYPTO API (Segurança Real)
    // Em vez de Math.random() que é previsível, usamos criptografia segura do navegador
    const randomValues = new Uint32Array(remainingLength);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = randomValues[i] % allowedChars.length;
        passwordArray.push(allowedChars[randomIndex]);
    }

    // Criptografa/Embaralha o array final para não deixar os caracteres garantidos no início
    const shuffleValues = new Uint32Array(passwordArray.length);
    crypto.getRandomValues(shuffleValues);
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = shuffleValues[i] % (i + 1);
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    const finalPassword = passwordArray.join('');
    passwordDisplay.textContent = finalPassword;
    passwordDisplay.classList.replace('text-amber-500', 'text-emerald-400');
    
    // Avalia a força da senha gerada
    calculateStrength(finalPassword, length);
}

// Medidor de Força da Senha
function calculateStrength(password, length) {
    let score = 0;
    
    if (length >= 8) score++;
    if (length >= 14) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    updateStrength(score);
}

function updateStrength(score) {
    const states = [
        { text: 'Muito Fraca', color: 'bg-red-600', width: '20%' },
        { text: 'Fraca', color: 'bg-orange-500', width: '40%' },
        { text: 'Média', color: 'bg-yellow-500', width: '60%' },
        { text: 'Forte', color: 'bg-blue-500', width: '80%' },
        { text: 'Excelente', color: 'bg-emerald-500', width: '100%' }
    ];

    // Reseta classes antigas de cores
    strengthBar.className = 'h-full transition-all duration-300';

    if (score === 0) {
        strengthText.textContent = '-';
        strengthBar.style.width = '0%';
        return;
    }

    const current = states[score - 1];
    strengthText.textContent = current.text;
    strengthBar.classList.add(current.color);
    strengthBar.style.width = current.width;
}

// Função de copiar para a área de transferência
async function copyToClipboard() {
    const password = passwordDisplay.textContent;
    if (password === 'Selecione as opções...' || password === 'Selecione pelo menos uma opção!') return;

    try {
        await navigator.clipboard.writeText(password);
        
        // Feedback visual no botão de cópia
        const icon = copyBtn.querySelector('i');
        icon.className = 'fa-solid fa-check text-emerald-400';
        copyBtn.classList.add('bg-slate-700');
        
        setTimeout(() => {
            icon.className = 'fa-regular fa-copy';
            copyBtn.classList.remove('bg-slate-700');
        }, 2000);
    } catch (err) {
        alert('Falha ao copiar a senha.');
    }
}

// Event Listeners
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);

// Gerar uma senha automática ao carregar a página
window.addEventListener('DOMContentLoaded', generatePassword);
