// ===== VÉRIFIER SI DÉJÀ CONNECTÉ =====
if (ColisGoAPI.TokenManager.isLoggedIn()) {
    window.location.href = 'index.html';
}

// ===== GESTION DU FORMULAIRE =====
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginAlert = document.getElementById('loginAlert');
const alertMessage = document.getElementById('alertMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Cacher les alertes
    hideAlert();
    
    // Validation basique
    if (!email || !password) {
        showAlert('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Désactiver le bouton
    setLoading(true);
    
    try {
        console.log('🔐 Tentative de connexion...');
        
        const response = await ColisGoAPI.Auth.login(email, password);
        
        if (response.success) {
            console.log('✅ Connexion réussie:', response.data.user);
            
            // Sauvegarder "Se souvenir de moi"
            if (rememberMe) {
                localStorage.setItem('colisgo_remember', 'true');
            }
            
            // Afficher succès
            showAlert('Connexion réussie ! Redirection...', 'success');
            
            // Rediriger vers le dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        
        // Messages d'erreur personnalisés
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid credentials') || 
            error.message.includes('incorrect') ||
            error.message.includes('not found')) {
            errorMessage = '❌ Email ou mot de passe incorrect';
        } else if (error.message.includes('not verified')) {
            errorMessage = '⚠️ Veuillez vérifier votre email avant de vous connecter';
        } else if (error.message.includes('2FA')) {
            errorMessage = '🔐 Code 2FA requis (à implémenter)';
        } else if (error.message.includes('banned') || error.message.includes('blocked')) {
            errorMessage = '🚫 Votre compte a été suspendu. Contactez le support.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = '🌐 Erreur de connexion. Vérifiez votre internet.';
        }
        
        showAlert(errorMessage, 'error');
        setLoading(false);
    }
});

// ===== AFFICHER ALERTE =====
function showAlert(message, type = 'error') {
    alertMessage.textContent = message;
    loginAlert.className = `alert alert-${type}`;
    loginAlert.style.display = 'flex';
    
    const icon = loginAlert.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else {
        icon.className = 'fas fa-exclamation-circle';
    }
}

function hideAlert() {
    loginAlert.style.display = 'none';
}

// ===== LOADING BUTTON =====
function setLoading(loading) {
    if (loading) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        loginBtn.querySelector('.btn-text').textContent = 'Connexion...';
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        loginBtn.querySelector('.btn-text').textContent = 'Se connecter';
    }
}

// ===== TOGGLE PASSWORD =====
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// ===== MOT DE PASSE OUBLIÉ =====
function forgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
        showAlert('Veuillez entrer votre email d\'abord', 'error');
        document.getElementById('email').focus();
        return;
    }
    
    alert(`📧 Un email de réinitialisation sera envoyé à : ${email}\n\n(Fonctionnalité à implémenter avec /api/auth/request-password-reset)`);
}

// ===== LOGIN SOCIAL =====
function loginWithGoogle() {
    window.location.href = `${ColisGoAPI.BASE_URL}/api/auth/google`;
}

function loginWithFacebook() {
    window.location.href = `${ColisGoAPI.BASE_URL}/api/auth/facebook`;
}

console.log('🔐 Page de login prête !');