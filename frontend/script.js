const API_URL = "http://localhost:3000";

// تسجيل
function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isEmpty(username) || isEmpty(email) || isEmpty(password)) {
        showToast("Please fill in all fields.", 'error');
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters.", 'error');
        return;
    }

    const btn = document.getElementById('registerBtn');
    setButtonLoading(btn, "Registering...");

    fetch(API_URL + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(res => {
        return res.text().then(text => {
            if (res.ok) {
                showToast(text, 'success');
                document.getElementById('username').value = "";
                document.getElementById('email').value = "";
                document.getElementById('password').value = "";
            } else {
                showToast("Registration failed: " + text, 'error');
            }
        });
    })
    .catch(() => {
        showToast("Registration failed: Server error", 'error');
    })
    .finally(() => {
        resetButton(btn);
    });
}

// تسجيل الدخول
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (isEmpty(email) || isEmpty(password)) {
        showToast("Please enter your email and password.", 'error');
        return;
    }

    const btn = document.getElementById('loginBtn');
    setButtonLoading(btn, "Logging in...");

    fetch(API_URL + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showToast("Welcome back, " + data.user.username + "!", 'success');
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        } else {
            showToast("Login failed: " + (data.message || "Invalid credentials"), 'error');
        }
    })
    .catch(() => {
        showToast("Login failed: Server error", 'error');
    })
    .finally(() => {
        resetButton(btn);
    });
}

//تحميل التحديات
function loadChallenges() {
    const list = document.getElementById('challengesList');
    list.innerHTML = renderSkeleton(4);

    fetch(API_URL + "/challenges")
    .then(res => res.json())
    .then(data => {
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>No challenges yet — check back soon!</p>
                </div>
            `;
            return;
        }

        const emojiMap = { easy: "🟢", medium: "🟡", hard: "🔴" };

        data.forEach(ch => {
            const li = document.createElement('li');
            li.className = "challenge-item difficulty-" + ch.difficulty;
            li.style.cursor = "pointer";
            li.onclick = function() { fillChallengeId(ch.id); };
            li.innerHTML = `
                <div class="challenge-header">
                    <span class="challenge-emoji">${emojiMap[ch.difficulty] || "⭐"}</span>
                    <strong>${ch.title}</strong>
                    <span class="difficulty-badge">${ch.difficulty}</span>
                </div>
                <p class="challenge-desc">${ch.description}</p>
                <span class="challenge-id">#${ch.id} — Click to solve this challenge</span>
            `;
            list.appendChild(li);
        });
    });
}

//ارسال الحل
function submitSolution() {
    const userData = localStorage.getItem('user');

    if (!userData) {
        showToast("Please login first before submitting a solution.", 'error');
        return;
    }

    const user = JSON.parse(userData);
    const user_id = user.id;

    const challenge_id = document.getElementById('challengeId').value;
    const solution_text = document.getElementById('solutionText').value;

    if (isEmpty(challenge_id) || isEmpty(solution_text)) {
        showToast("Please fill in the Challenge ID and your solution.", 'error');
        return;
    }

    const btn = document.getElementById('submitBtn');
    setButtonLoading(btn, "Submitting...");

    fetch(API_URL + "/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id,
            challenge_id,
            solution_text,
            solution_link: ""
        })
    })
    .then(res => {
        return res.text().then(text => {
            if (res.ok) {
                document.getElementById('celebrationOverlay').classList.add('show');
                document.getElementById('challengeId').value = "";
                document.getElementById('solutionText').value = "";
            } else {
                showToast("Submission failed: " + text, 'error');
            }
        });
    })
    .catch(() => {
        showToast("Submission failed: Server error", 'error');
    })
    .finally(() => {
        resetButton(btn);
    });
}

//عرض قائمة المتصدرين
function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = renderSkeleton(5);

    fetch(API_URL + "/leaderboard")
    .then(res => res.json())
    .then(data => {
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏁</div>
                    <p>No rankings yet — be the first to score points!</p>
                </div>
            `;
            return;
        }

        const medals = ["🥇", "🥈", "🥉"];

        data.forEach((user, index) => {
            const li = document.createElement('li');
            const rank = index + 1;

            if (rank <= 3) {
                li.className = "leaderboard-item top-" + rank;
                li.innerHTML = `
                    <span class="rank-medal">${medals[index]}</span>
                    <span class="rank-name">${user.username}</span>
                    <span class="rank-points">${user.total_points} pts</span>
                `;
            } else {
                li.className = "leaderboard-item";
                li.innerHTML = `
                    <span class="rank-number">#${rank}</span>
                    <span class="rank-name">${user.username}</span>
                    <span class="rank-points">${user.total_points} pts</span>
                `;
            }

            list.appendChild(li);
        });
    });
}

//بروفايل
function loadProfile() {
    const id = document.getElementById('profileId').value;

    if (isEmpty(id)) {
        showToast("Please enter a User ID.", 'error');
        return;
    }

    fetch(API_URL + "/profile/" + id)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById('profileResult');

        if (!data || !data.username) {
            div.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>User not found.</p>
                </div>
            `;
            return;
        }

        const initial = data.username.charAt(0).toUpperCase();
        const points = data.total_points || 0;

        let badge = { emoji: "🌱", label: "Beginner Coder" };
        if (points >= 100) {
            badge = { emoji: "🏆", label: "Coding Champion" };
        } else if (points >= 50) {
            badge = { emoji: "⭐", label: "Rising Star" };
        } else if (points >= 20) {
            badge = { emoji: "🔥", label: "Getting Started" };
        }

        div.innerHTML = `
            <div class="identity-card">
                <div class="identity-avatar">${initial}</div>
                <h3 class="identity-name">${data.username}</h3>
                <div class="identity-badge">${badge.emoji} ${badge.label}</div>

                <div class="identity-stats">
                    <div class="identity-stat">
                        <div class="identity-stat-value">${data.total_submissions}</div>
                        <div class="identity-stat-label">Submissions</div>
                    </div>
                    <div class="identity-stat">
                        <div class="identity-stat-value">${points}</div>
                        <div class="identity-stat-label">Points</div>
                    </div>
                </div>
            </div>
        `;
    })
    .catch(() => {
        const div = document.getElementById('profileResult');
        div.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>User not found.</p>
            </div>
        `;
    });
}

// عرض حالة تسجيل الدخول
function updateUIBasedOnLogin() {
    const userData = localStorage.getItem('user');

    const headerLoggedOut = document.getElementById('headerLoggedOut');
    const headerLoggedIn = document.getElementById('headerLoggedIn');
    const headerUsername = document.getElementById('headerUsername');
    const adminNavLink = document.getElementById('adminNavLink');

    if (userData) {
        const user = JSON.parse(userData);

        if (headerLoggedOut) headerLoggedOut.style.display = 'none';
        if (headerLoggedIn) headerLoggedIn.style.display = 'flex';
        if (headerUsername) headerUsername.innerText = "👋 " + user.username;

        if (adminNavLink) {
            adminNavLink.style.display = (user.role === 'admin') ? 'inline-block' : 'none';
        }
    } else {
        if (headerLoggedOut) headerLoggedOut.style.display = 'block';
        if (headerLoggedIn) headerLoggedIn.style.display = 'none';
        if (adminNavLink) adminNavLink.style.display = 'none';
    }
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIBasedOnLogin();
}

// تشغيل هذه الدالة تلقائياً عند فتح الصفحة
updateUIBasedOnLogin();

// اضافة تحدي (أدمن فقط)
function addChallenge() {
    const token = localStorage.getItem('token');

    if (!token) {
        showToast("You must be logged in as admin.", 'error');
        return;
    }

    const title = document.getElementById('newChallengeTitle').value;
    const description = document.getElementById('newChallengeDescription').value;
    const difficulty = document.getElementById('newChallengeDifficulty').value;

    if (isEmpty(title) || isEmpty(description)) {
        showToast("Please fill in the challenge title and description.", 'error');
        return;
    }

    const btn = document.getElementById('addChallengeBtn');
    setButtonLoading(btn, "Adding...");

    fetch(API_URL + "/challenges", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ title, description, difficulty })
    })
    .then(res => {
        return res.text().then(text => {
            if (res.ok) {
                showToast(text, 'success');
                document.getElementById('newChallengeTitle').value = "";
                document.getElementById('newChallengeDescription').value = "";
            } else {
                showToast("Failed to add challenge: " + text, 'error');
            }
        });
    })
    .catch(() => {
        showToast("Failed to add challenge: Server error", 'error');
    })
    .finally(() => {
        resetButton(btn);
    });
}

// عرض الحلول المرسلة (أدمن)
function loadSubmissions() {
    const list = document.getElementById('submissionsList');
    list.innerHTML = renderSkeleton(3);

    fetch(API_URL + "/submissions")
    .then(res => res.json())
    .then(data => {
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No submissions yet.</p>
                </div>
            `;
            return;
        }

        data.forEach(sub => {
            const li = document.createElement('li');
            li.className = "submission-item";

            const shortText = sub.solution_text.length > 80
                ? sub.solution_text.substring(0, 80) + "..."
                : sub.solution_text;

            li.innerHTML = `
                <div class="submission-header">
                    <span class="submission-id-badge">#${sub.id}</span>
                    <span class="submission-meta">👤 User ${sub.user_id} &nbsp;•&nbsp; 🎯 Challenge ${sub.challenge_id}</span>
                </div>
                <p class="submission-solution" id="solutionText-${sub.id}">${shortText}</p>
                ${sub.solution_text.length > 80 ? `<span class="submission-toggle" onclick="toggleSubmissionText(${sub.id}, this)" data-full="${encodeURIComponent(sub.solution_text)}" data-short="${encodeURIComponent(shortText)}">Show more</span>` : ""}
                <button class="submission-use-btn" onclick="fillEvaluationId(${sub.id})">Evaluate this ➜</button>
            `;

            list.appendChild(li);
        });
    });
}

// إظهار/إخفاء النص الكامل للحل
function toggleSubmissionText(id, toggleElement) {
    const textEl = document.getElementById('solutionText-' + id);
    const isShort = toggleElement.innerText === "Show more";

    if (isShort) {
        textEl.innerText = decodeURIComponent(toggleElement.dataset.full);
        toggleElement.innerText = "Show less";
    } else {
        textEl.innerText = decodeURIComponent(toggleElement.dataset.short);
        toggleElement.innerText = "Show more";
    }
}

// تعبئة رقم الحل تلقائياً في نموذج التقييم
function fillEvaluationId(id) {
    const evalInput = document.getElementById('evalSubmissionId');
    if (evalInput) {
        evalInput.value = id;
        evalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast("Submission #" + id + " ready to evaluate ⬇️", 'info');
    }
}

// تقييم حل (أدمن فقط)
function evaluateSubmission() {
    const token = localStorage.getItem('token');

    if (!token) {
        showToast("You must be logged in as admin.", 'error');
        return;
    }

    const submission_id = document.getElementById('evalSubmissionId').value;
    const score = document.getElementById('evalScore').value;
    const feedback = document.getElementById('evalFeedback').value;

    if (isEmpty(submission_id) || isEmpty(score)) {
        showToast("Please enter the Submission ID and a score.", 'error');
        return;
    }

    if (Number(score) < 0 || Number(score) > 10) {
        showToast("Score must be between 0 and 10.", 'error');
        return;
    }

    const btn = document.getElementById('evaluateBtn');
    setButtonLoading(btn, "Submitting...");

    fetch(API_URL + "/evaluate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ submission_id, score, feedback })
    })
    .then(res => {
        return res.text().then(text => {
            if (res.ok) {
                showToast(text, 'success');
                document.getElementById('evalSubmissionId').value = "";
                document.getElementById('evalScore').value = "";
                document.getElementById('evalFeedback').value = "";
            } else {
                showToast("Failed to submit evaluation: " + text, 'error');
            }
        });
    })
    .catch(() => {
        showToast("Failed to submit evaluation: Server error", 'error');
    })
    .finally(() => {
        resetButton(btn);
    });
}

// التمرير التلقائي لقسم التحديات عند الضغط على زر البداية
function scrollToChallenges() {
    document.getElementById('mainAppTitle').scrollIntoView({ behavior: 'smooth' });
}

// حماية صفحة admin.html: إعادة توجيه أي شخص ليس أدمن
function protectAdminPage() {
    const userData = localStorage.getItem('user');

    if (!userData) {
        showToast("Please login first.", 'error');
        setTimeout(() => {
            window.location.href = "auth.html";
        }, 1200);
        return;
    }

    const user = JSON.parse(userData);

    if (user.role !== 'admin') {
        showToast("Access denied: this page is for admins only.", 'error');
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);
    }
}

// تشغيل الحماية فقط إذا كانت الصفحة الحالية admin.html
if (window.location.pathname.endsWith('admin.html')) {
    protectAdminPage();
}

// ====== الروبوت المرافق ======
const mascotMessages = [
    "Great job! Keep exploring! 🌟",
    "Every challenge makes you stronger! 💪",
    "You can do it! 🚀",
    "Keep going, coder! 👨‍💻",
    "Mistakes help you learn faster! 🧠",
    "One challenge at a time! 🎯",
    "You're doing amazing! ✨",
    "Believe in yourself! 🏆"
];

function showMascotMessage() {
    const bubble = document.getElementById('mascotBubble');
    if (!bubble) return;

    const randomMsg = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
    bubble.innerText = randomMsg;
    bubble.classList.add('show');

    // إخفاء الفقاعة تلقائياً بعد 3 ثوانٍ
    clearTimeout(window.mascotTimeout);
    window.mascotTimeout = setTimeout(() => {
        bubble.classList.remove('show');
    }, 3000);
}

// إظهار رسالة ترحيبية تلقائياً بعد ثانيتين من فتح أي صفحة
setTimeout(() => {
    const bubble = document.getElementById('mascotBubble');
    if (bubble) {
        bubble.innerText = "Hi there! Ready to code? 🤖";
        bubble.classList.add('show');
        setTimeout(() => bubble.classList.remove('show'), 3000);
    }
}, 1500);

// إغلاق نافذة الاحتفال
function closeCelebration() {
    const overlay = document.getElementById('celebrationOverlay');
    if (overlay) overlay.classList.remove('show');
}

// ====== نظام الإشعارات (Toast) ======
function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info') {
    const container = ensureToastContainer();
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // إظهار الإشعار بحركة انزلاق
    setTimeout(() => toast.classList.add('show'), 10);

    // إخفاؤه وحذفه تلقائياً بعد 3.5 ثانية
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ====== دالة تحقق عامة من الحقول الفارغة ======
function isEmpty(value) {
    return !value || value.trim() === "";
}

// ====== دوال مساعدة لحالة التحميل على الأزرار ======
function setButtonLoading(button, loadingText) {
    if (!button) return;
    button.dataset.originalText = button.innerText;
    button.innerText = loadingText;
    button.disabled = true;
    button.style.opacity = "0.7";
    button.style.cursor = "not-allowed";
}

function resetButton(button) {
    if (!button) return;
    button.innerText = button.dataset.originalText || button.innerText;
    button.disabled = false;
    button.style.opacity = "1";
    button.style.cursor = "pointer";
}

// إظهار/إخفاء كلمة المرور
function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        iconElement.innerText = "🙈";
    } else {
        input.type = "password";
        iconElement.innerText = "👁️";
    }
}

// ====== توليد عناصر Skeleton أثناء التحميل ======
function renderSkeleton(count = 3) {
    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-item">
                <div class="skeleton-line skeleton-line-short"></div>
                <div class="skeleton-line skeleton-line-long"></div>
            </div>
        `;
    }
    return html;
}

// إشعار مؤقت لميزة غير مفعّلة بعد
function showForgotPasswordNotice(event) {
    event.preventDefault();
    showToast("This feature is coming soon! 🚧", 'info');
}

// ====== إحصائيات الصفحة الرئيسية ======
function animateCounter(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let current = 0;
    const duration = 800; // مدة الحركة بالميلي ثانية
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetValue / steps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        el.innerText = Math.floor(current);
    }, stepTime);
}

function loadHomeStats() {
    // عدد التحديات
    fetch(API_URL + "/challenges")
        .then(res => res.json())
        .then(data => animateCounter('statChallenges', data.length))
        .catch(() => {});

    // عدد الحلول المرسلة
    fetch(API_URL + "/submissions")
        .then(res => res.json())
        .then(data => animateCounter('statSubmissions', data.length))
        .catch(() => {});

    // عدد المستخدمين النشطين (من لديهم نقاط في الـ leaderboard)
    fetch(API_URL + "/leaderboard")
        .then(res => res.json())
        .then(data => animateCounter('statCoders', data.length))
        .catch(() => {});
}

// تشغيل الإحصائيات تلقائياً فقط في الصفحة الرئيسية
if (document.getElementById('statChallenges')) {
    loadHomeStats();
}

// تحميل ملف المستخدم الحالي تلقائياً عند فتح صفحة profile.html
function autoLoadOwnProfile() {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const profileInput = document.getElementById('profileId');
    if (profileInput) {
        profileInput.value = user.id;
        loadProfile();
    }
}

if (document.getElementById('profileId')) {
    autoLoadOwnProfile();
}

// تعبئة رقم التحدي تلقائياً عند الضغط على بطاقته
function fillChallengeId(id) {
    const challengeInput = document.getElementById('challengeId');
    if (challengeInput) {
        challengeInput.value = id;
        challengeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast("Challenge #" + id + " selected — write your solution below ⬇️", 'info');
    }
}