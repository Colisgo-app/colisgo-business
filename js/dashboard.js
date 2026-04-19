// ===== PROTECTION : Vérifier si connecté =====
if (!ColisGoAPI.TokenManager.isLoggedIn()) {
    window.location.href = 'login.html';
}

// ===== INFOS UTILISATEUR =====
const currentUser = ColisGoAPI.TokenManager.getUser();
console.log('👤 Utilisateur connecté:', currentUser);
// ===== DONNÉES DE DÉMONSTRATION =====
const shipmentsData = [
    {
        id: '#CG12347',
        sender: 'Montréal, QC',
        receiver: 'Laval, QC',
        receiverName: 'Marie Dubois',
        receiverEmail: 'marie.dubois@email.com',
        receiverPhone: '+1 514 555-0145',
        status: 'en-attente',
        statusLabel: 'En Attente',
        transporter: null,
        price: '16.00$',
        date: '2025-01-16',
        hasPhotos: false,
        deliveryMode: 'avec-contact'
    },
    {
        id: '#CG12348',
        sender: 'Québec, QC',
        receiver: 'Montréal, QC',
        receiverName: 'Paul Leblanc',
        receiverEmail: 'paul.leblanc@email.com',
        receiverPhone: '+1 418 555-0167',
        status: 'en-attente',
        statusLabel: 'En Attente',
        transporter: null,
        price: '22.00$',
        date: '2025-01-16',
        hasPhotos: true,
        deliveryMode: 'sans-contact'
    },
    {
        id: '#CG12345',
        sender: 'Montréal, QC',
        receiver: 'Québec, QC',
        receiverName: 'Jean Tremblay',
        receiverEmail: 'jean.tremblay@email.com',
        receiverPhone: '+1 418 555-0123',
        status: 'en-cours',
        statusLabel: 'En Cours',
        transporter: { name: 'Sophie T.', avatar: 'https://ui-avatars.com/api/?name=Sophie+T&background=FF6B35&color=fff' },
        price: '18.50$',
        date: '2025-01-15',
        hasPhotos: true,
        deliveryMode: 'avec-contact'
    },
    {
        id: '#CG12338',
        sender: 'Laval, QC',
        receiver: 'Québec, QC',
        receiverName: 'Sophie Martin',
        receiverEmail: 'sophie.martin@email.com',
        receiverPhone: '+1 418 555-0189',
        status: 'livre',
        statusLabel: 'Livré',
        transporter: { name: 'Marc D.', avatar: 'https://ui-avatars.com/api/?name=Marc+D&background=10B981&color=fff' },
        price: '24.00$',
        date: '2025-01-14',
        hasPhotos: true,
        deliveryMode: 'avec-contact'
    },
    {
        id: '#CG12762',
        sender: 'Montréal, QC',
        receiver: 'Sherbrooke, QC',
        receiverName: 'Alex Roy',
        receiverEmail: 'alex.roy@email.com',
        receiverPhone: '+1 819 555-0234',
        status: 'en-cours',
        statusLabel: 'En Cours',
        transporter: { name: 'Alex R.', avatar: 'https://ui-avatars.com/api/?name=Alex+R&background=3B82F6&color=fff' },
        price: '15.00$',
        date: '2025-01-15',
        hasPhotos: true,
        deliveryMode: 'sans-contact'
    },
    {
        id: '#CG12263',
        sender: 'Gatineau, QC',
        receiver: 'Québec, QC',
        receiverName: 'Claire Gagnon',
        receiverEmail: 'claire.gagnon@email.com',
        receiverPhone: '+1 418 555-0267',
        status: 'annule',
        statusLabel: 'Annulé',
        transporter: null,
        price: '12.00$',
        date: '2025-01-13',
        hasPhotos: false,
        deliveryMode: 'avec-contact'
    },
    {
        id: '#CG12890',
        sender: 'Trois-Rivières, QC',
        receiver: 'Montréal, QC',
        receiverName: 'Julie Lavoie',
        receiverEmail: 'julie.lavoie@email.com',
        receiverPhone: '+1 819 555-0289',
        status: 'livre',
        statusLabel: 'Livré',
        transporter: { name: 'Julie L.', avatar: 'https://ui-avatars.com/api/?name=Julie+L&background=F59E0B&color=fff' },
        price: '20.00$',
        date: '2025-01-12',
        hasPhotos: true,
        deliveryMode: 'sans-contact'
    }
];

// ===== RENDU DU TABLEAU =====
function renderTable(filter = 'all') {
    const tbody = document.getElementById('shipmentsTableBody');
    if (!tbody) return;
    
    const filtered = filter === 'all' 
        ? shipmentsData 
        : shipmentsData.filter(s => s.status === filter);
    
    tbody.innerHTML = filtered.map(s => {
        const qrButton = s.status === 'en-attente' 
            ? `<button class="btn-qr" onclick="openQRModal('${s.id}')" title="Gérer les photos">
                 <i class="fas fa-qrcode"></i> ${s.hasPhotos ? 'Voir' : 'Photos'}
               </button>`
            : '';
        
        const transporterCell = s.transporter 
            ? `<div class="transporter">
                 <img src="${s.transporter.avatar}" alt="${s.transporter.name}">
                 <span class="transporter-name">${s.transporter.name}</span>
               </div>`
            : `<div class="waiting-transporter">
                 <i class="fas fa-hourglass-half"></i>
                 <span>En attente...</span>
               </div>`;
        
        const photoBadge = s.status === 'en-attente'
            ? (s.hasPhotos 
                ? `<span class="photo-badge has-photos"><i class="fas fa-check"></i> Photos OK</span>`
                : `<span class="photo-badge no-photos"><i class="fas fa-exclamation-circle"></i> Photos requises</span>`)
            : '';
        
        return `
            <tr>
                <td><input type="checkbox"></td>
                <td>
                    <span class="tracking-id">${s.id}</span>
                    ${photoBadge}
                </td>
                <td>${s.sender}</td>
                <td>${s.receiver}</td>
                <td><span class="status-badge status-${s.status}">${s.statusLabel}</span></td>
                <td>${transporterCell}</td>
                <td><span class="price">${s.price}</span></td>
                <td>${formatDate(s.date)}</td>
                <td>
                    <div class="action-buttons">
                        ${qrButton}
                        <button class="btn-view" onclick="viewShipment('${s.id}')">Voir</button>
                        <button class="btn-icon" title="Plus"><i class="fas fa-ellipsis-v"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===== NAVIGATION SIDEBAR =====
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        const page = this.dataset.page;
        document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) pageEl.classList.remove('hidden');
        
        if (window.innerWidth < 992) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
});

// ===== TABS FILTRAGE =====
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderTable(this.dataset.filter);
    });
});

// ===== MODAL NOUVEL ENVOI =====
const modal = document.getElementById('shipmentModal');
const newShipmentBtn = document.getElementById('newShipmentBtn');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');

if (newShipmentBtn) newShipmentBtn.addEventListener('click', () => openShipmentModal());
if (modalClose) modalClose.addEventListener('click', () => closeShipmentModal());
if (cancelBtn) cancelBtn.addEventListener('click', () => closeShipmentModal());

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeShipmentModal();
    });
}

function openShipmentModal() {
    modal.classList.add('active');
    resetFormSteps();
}

function closeShipmentModal() {
    modal.classList.remove('active');
}

// ===== WORKFLOW - STEPS =====
let currentStep = 1;
let uploadedPhotos = [];

function resetFormSteps() {
    currentStep = 1;
    uploadedPhotos = [];
    updateStepUI();
    const photoPreview = document.getElementById('photoPreview');
    if (photoPreview) photoPreview.innerHTML = '';
}

function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        updateStepUI();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
    }
}

function updateStepUI() {
    // Mettre à jour les indicateurs
    document.querySelectorAll('.workflow-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Afficher le bon contenu
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.toggle('active', index + 1 === currentStep);
    });
}

// ===== UPLOAD PHOTOS =====
function handlePhotoUpload(input) {
    const files = Array.from(input.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedPhotos.push({
                    name: file.name,
                    url: e.target.result,
                    size: (file.size / 1024).toFixed(1) + ' KB'
                });
                renderPhotoPreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

function renderPhotoPreview() {
    const preview = document.getElementById('photoPreview');
    if (!preview) return;
    
    preview.innerHTML = uploadedPhotos.map((photo, index) => `
        <div class="photo-preview-item">
            <img src="${photo.url}" alt="${photo.name}">
            <button class="photo-remove" onclick="removePhoto(${index})">
                <i class="fas fa-times"></i>
            </button>
            <div class="photo-info">
                <span>${photo.name}</span>
                <small>${photo.size}</small>
            </div>
        </div>
    `).join('');
    
    // Update counter
    const counter = document.getElementById('photoCounter');
    if (counter) counter.textContent = uploadedPhotos.length;
}

function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    renderPhotoPreview();
}

function openQRFromForm() {
    const qrFormSection = document.getElementById('qrFormSection');
    if (qrFormSection) {
        qrFormSection.classList.toggle('active');
        if (qrFormSection.classList.contains('active')) {
            const token = generateUniqueToken();
            const uploadUrl = `https://colisgo.ca/upload/${token}`;
            const urlElement = document.getElementById('qrFormUrl');
            if (urlElement) urlElement.textContent = uploadUrl;
            generateQRCodeForm(uploadUrl);
        }
    }
}

function generateQRCodeForm(url) {
    const canvas = document.getElementById('qrFormCanvas');
    if (!canvas) return;
    QRCode.toCanvas(canvas, url, {
        width: 200,
        margin: 2,
        color: { dark: '#1E2A4A', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
    });
}

function submitShipment(e) {
    if (e) e.preventDefault();
    
    showToast('🎉 Envoi créé avec succès ! En attente d\'un voyageur...');
    
    setTimeout(() => {
        closeShipmentModal();
    }, 1500);
}

// ===== MODAL QR CODE (depuis tableau) =====
let currentShipmentForQR = null;

function openQRModal(shipmentId) {
    const shipment = shipmentsData.find(s => s.id === shipmentId);
    if (!shipment) return;
    
    currentShipmentForQR = shipment;
    
    document.getElementById('qrShipmentId').textContent = shipment.id;
    document.getElementById('qrSender').textContent = shipment.sender;
    document.getElementById('qrReceiver').textContent = shipment.receiver;
    
    const token = generateUniqueToken();
    const uploadUrl = `https://colisgo.ca/upload/${token}`;
    document.getElementById('qrUrl').textContent = uploadUrl;
    
    generateQRCode(uploadUrl);
    resetPhotosGrid();
    
    document.getElementById('qrModal').classList.add('active');
}

function closeQRModal() {
    document.getElementById('qrModal').classList.remove('active');
    currentShipmentForQR = null;
}

function generateUniqueToken() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function generateQRCode(url) {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    QRCode.toCanvas(canvas, url, {
        width: 280,
        margin: 2,
        color: { dark: '#1E2A4A', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
    });
}

function copyQRUrl() {
    const url = document.getElementById('qrUrl').textContent;
    navigator.clipboard.writeText(url).then(() => showToast('✅ Lien copié !'));
}

function copyFormQRUrl() {
    const url = document.getElementById('qrFormUrl').textContent;
    navigator.clipboard.writeText(url).then(() => showToast('✅ Lien copié !'));
}

function printQRCode() { window.print(); }

function downloadQRCode() {
    const canvas = document.getElementById('qrCanvas');
    const shipmentId = document.getElementById('qrShipmentId').textContent;
    const link = document.createElement('a');
    link.download = `qrcode-colisgo-${shipmentId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('📥 QR Code téléchargé !');
}

function resetPhotosGrid() {
    const grid = document.getElementById('photosGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="qr-photo-placeholder"><i class="fas fa-camera"></i><span>En attente...</span></div>
        <div class="qr-photo-placeholder"><i class="fas fa-camera"></i><span>En attente...</span></div>
        <div class="qr-photo-placeholder"><i class="fas fa-camera"></i><span>En attente...</span></div>
        <div class="qr-photo-placeholder"><i class="fas fa-camera"></i><span>En attente...</span></div>
    `;
    document.getElementById('photoCount').textContent = '0';
}

function simulatePhotoUpload() {
    const demoPhotos = [
        'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1609778269131-b74448e03c79?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=300&fit=crop'
    ];
    
    const grid = document.getElementById('photosGrid');
    const placeholders = grid.querySelectorAll('.qr-photo-placeholder');
    let photoIndex = 0;
    
    const interval = setInterval(() => {
        if (photoIndex < 4) {
            placeholders[photoIndex].classList.add('filled');
            placeholders[photoIndex].innerHTML = `
                <img src="${demoPhotos[photoIndex]}" alt="Photo colis">
                <div class="photo-overlay"><i class="fas fa-check"></i></div>
            `;
            document.getElementById('photoCount').textContent = photoIndex + 1;
            showToast(`📸 Photo ${photoIndex + 1} reçue !`);
            photoIndex++;
        } else {
            clearInterval(interval);
            const status = document.getElementById('qrStatus');
            if (status) {
                status.classList.add('completed');
                status.innerHTML = `<i class="fas fa-check-circle"></i><span>Toutes les photos ont été reçues !</span>`;
            }
            showToast('🎉 Upload complet !');
        }
    }, 1500);
}

// ===== SIDEBAR MOBILE =====
const menuToggle = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');
if (menuToggle) menuToggle.addEventListener('click', () => document.getElementById('sidebar').classList.add('active'));
if (sidebarClose) sidebarClose.addEventListener('click', () => document.getElementById('sidebar').classList.remove('active'));

// ===== ACTIONS =====
function viewShipment(id) {
    alert(`Ouverture du colis ${id} (À connecter à votre backend)`);
}

// ===== CHART =====
function initChart() {
    const ctx = document.getElementById('statsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
                label: 'Colis livrés',
                data: [12, 19, 8, 15, 22, 18, 14],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 0,
                borderRadius: 8,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
                x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' } }
            }
        }
    });
}

// ===== API SECTION FUNCTIONS =====
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const text = element.textContent;
        navigator.clipboard.writeText(text).then(() => showToast('✅ Copié !'));
    }
}

function toggleSecret() {
    const secret = document.getElementById('secretKey');
    const icon = document.getElementById('eyeIcon');
    if (!secret || !icon) return;
    if (secret.textContent.includes('•')) {
        secret.textContent = 'sk_test_XYZ987ABC123colisgo789GHI';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        secret.textContent = 'sk_test_••••••••••••••••••••••••';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function regenerateKeys() {
    if (confirm('⚠️ Régénérer les clés ?')) showToast('🔑 Nouvelles clés générées !');
}

function copyCode(btn) {
    const code = btn.closest('.code-example').querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copié !';
        setTimeout(() => btn.innerHTML = originalText, 2000);
    });
}

function addWebhook() {
    alert('📡 Formulaire webhook (à connecter)');
}

document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const lang = this.dataset.lang;
        document.querySelectorAll('.code-example').forEach(ex => {
            ex.classList.toggle('active', ex.dataset.lang === lang);
        });
    });
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        showToast(this.dataset.mode === 'live' ? '⚡ Mode Production' : '🧪 Mode Test');
    });
});

// ===== TOAST =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background: #1E2A4A; color: white;
        padding: 14px 24px; border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999; font-size: 14px; font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const styleEl = document.createElement('style');
styleEl.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(styleEl);

// QR Modal close
const qrModal = document.getElementById('qrModal');
if (qrModal) {
    qrModal.addEventListener('click', (e) => {
        if (e.target.id === 'qrModal') closeQRModal();
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    initChart();
    console.log('🚀 ColisGo Business Dashboard - Prêt !');
});

// ===== CREATE SHIPMENT PAGE =====
function switchToPage(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${page}`)?.classList.remove('hidden');
}

function renderPendingPhotos() {
    const container = document.getElementById('pendingPhotosCards');
    if (!container) return;
    
    const pending = shipmentsData.filter(s => s.status === 'en-attente' && !s.hasPhotos);
    
    if (pending.length === 0) {
        container.innerHTML = `
            <div class="no-pending" style="grid-column: 1 / -1;">
                <i class="fas fa-check-circle"></i>
                <h4>Aucun envoi en attente de photos</h4>
                <p>Tous vos envois ont leurs photos !</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pending.map(s => `
        <div class="pending-card">
            <div class="pending-card-header">
                <span class="pending-card-id">${s.id}</span>
                <span class="photo-badge no-photos">
                    <i class="fas fa-exclamation-circle"></i> Photos requises
                </span>
            </div>
            <div class="pending-card-route">
                <strong>${s.sender}</strong>
                <i class="fas fa-arrow-right"></i>
                <strong>${s.receiver}</strong>
            </div>
            <div class="pending-card-footer">
                <span class="pending-card-date">
                    <i class="far fa-clock"></i> ${formatDate(s.date)}
                </span>
                <button class="btn-mini" onclick="openQRModal('${s.id}')">
                    <i class="fas fa-qrcode"></i> Ajouter photos
                </button>
            </div>
        </div>
    `).join('');
}

// Mettre à jour la navigation pour appeler renderPendingPhotos
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        if (this.dataset.page === 'nouveau') {
            setTimeout(renderPendingPhotos, 100);
        }
    });
});

// Initialiser au chargement
setTimeout(renderPendingPhotos, 500);

// ===== DÉCONNEXION =====
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        ColisGoAPI.Auth.logout();
    }
}