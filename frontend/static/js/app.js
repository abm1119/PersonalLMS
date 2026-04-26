/**
 * LMS Suite - Frontend Application
 * A simple HTML/CSS/JS frontend communicating with the FastAPI backend
 */

// Dynamic BASE_URL for production readiness
const BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'https://abm-111-abmlms.hf.space/api'
    : 'https://abm-111-abmlms.hf.space/api';

const APP = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    currentPage: 'dashboard'
};

// ═══════════════════════════════════════════════════════════════════════════
// API UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

async function apiCall(endpoint, method = 'GET', body = null, useToken = true) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (useToken && APP.token) {
        options.headers['Authorization'] = `Bearer ${APP.token}`;
    }

    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            logout();
            return { error: 'Session expired. Please login again.' };
        }

        if (!response.ok) {
            const errorMsg = data?.detail || data?.message || 'An error occurred';
            return { error: errorMsg };
        }

        return data;
    } catch (error) {
        return { error: 'Network error. Please check if the backend is running.' };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function setAuth(token, user) {
    APP.token = token;
    APP.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    APP.token = null;
    APP.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('login');
}

function isAuthenticated() {
    return !!APP.token && !!APP.user;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTING
// ═══════════════════════════════════════════════════════════════════════════

const routes = {
    login: renderLogin,
    register: renderRegister,
    dashboard: renderDashboard,
    courses: renderCourses,
    courseNew: renderNewCourse,
    courseView: renderViewCourse,
    notes: renderNotes,
    noteNew: renderNewNote,
    noteView: renderViewNote,
    noteEdit: renderEditNote,
    bookmarks: renderBookmarks,
    bookmarkNew: renderNewBookmark,
    bookmarkEdit: renderEditBookmark
};

function navigate(page, params = {}) {
    if (!isAuthenticated() && page !== 'login' && page !== 'register') {
        navigate('login');
        return;
    }

    APP.currentPage = page;
    const renderer = routes[page];

    if (renderer) {
        const result = renderer(params);
        
        // Handle async renderers (return Promises)
        if (result instanceof Promise) {
            result.then(html => renderTemplate(html)).catch(error => {
                console.error('Render error:', error);
                renderTemplate(`<div class="container"><div class="alert alert-error">Error loading page: ${error.message}</div></div>`);
            });
        } else {
            // Handle sync renderers (return HTML strings)
            renderTemplate(result);
        }
    } else {
        navigate('dashboard');
    }
}

function renderTemplate(html) {
    try {
        const app = document.getElementById('app');
        if (!app) {
            console.error('App container not found!');
            return;
        }
        
        app.innerHTML = html;
        
        // Add loaded class for animations
        document.body.classList.add('is-loaded');
        
        // Setup intersection observer for reveals
        setupRevealAnimations();
        
        // Scroll to top
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Render template error:', error);
        document.getElementById('app').innerHTML = `<div class="container"><div class="alert alert-error">Error rendering page: ${error.message}</div></div>`;
    }
}

function setupRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((el) => {
        observer.observe(el);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function navbar() {
    if (!isAuthenticated()) return '';

    return `
        <nav class="navbar">
            <div class="nav-brand">
                <a href="javascript:navigate('dashboard')">LMS Suite</a>
            </div>
            <div class="nav-links">
                <a href="javascript:navigate('courses')" class="nav-link ${APP.currentPage === 'courses' ? 'active' : ''}">Courses</a>
                <a href="javascript:navigate('notes')" class="nav-link ${APP.currentPage === 'notes' ? 'active' : ''}">Notes</a>
                <a href="javascript:navigate('bookmarks')" class="nav-link ${APP.currentPage === 'bookmarks' ? 'active' : ''}">Bookmarks</a>
            </div>
            <div class="nav-user">
                <span>${APP.user.name || APP.user.email}</span>
                <a href="javascript:logout()" class="btn-logout">Logout</a>
            </div>
        </nav>
    `;
}

function footer() {
    return `
        <footer class="footer">
            <div class="footer-content reveal">
                <div class="footer-signature">Crafted for Excellence</div>
                <div class="footer-divider"></div>
                <p class="footer-credit">
                    built by <a href="https://www.engrabm.com" target="_blank">Abdul Basit</a>
                </p>
                <div class="footer-link-group">
                    <a href="https://www.engrabm.com" target="_blank">Portfolio</a>
                    <a href="mailto:basitmemon67@gmail.com">Contact</a>
                    <a href="https://www.linkedin.com/in/abdul-basit-memon-614961166" target="_blank">LinkedIn</a>
                </div>
                <p style="font-size: 0.65rem; color: var(--ink-light); margin-top: 1.5rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.5;">
                    &copy; ${new Date().getFullYear()} &bull; LMS Suite &bull; All Rights Reserved
                </p>
            </div>
        </footer>
    `;
}

function container(content) {
    return `
        <div style="display: flex; flex-direction: column; min-height: 100vh;">
            ${isAuthenticated() ? navbar() : ''}
            <div class="container" style="flex: 1;">
                ${content}
            </div>
            ${footer()}
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH PAGES
// ═══════════════════════════════════════════════════════════════════════════

function renderLogin() {
    return container(`
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-logo" style="text-align:center; margin-bottom:2rem;">
                    <div class="auth-logo-icon" style="font-size:3rem;">📚</div>
                </div>
                <div class="card auth-card reveal">
                    <h1 class="auth-title">Welcome back</h1>
                    <form id="loginForm" onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-input" placeholder="you@example.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-input" placeholder="Your password" required>
                        </div>
                        <div id="loginError"></div>
                        <button type="submit" class="btn btn-primary" style="width: 100%">Login</button>
                    </form>
                    <div class="auth-links">
                        <p>Don't have an account? <a href="javascript:navigate('register')">Create one</a></p>
                    </div>
                </div>
            </div>
        </div>
    `);
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.elements.email.value;
    const password = form.elements.password.value;

    const result = await apiCall('/auth/login', 'POST', { email, password }, false);

    if (result.error) {
        document.getElementById('loginError').innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    } else {
        setAuth(result.token, result.user);
        navigate('dashboard');
    }
}

function renderRegister() {
    return container(`
        <div class="auth-page">
            <div class="auth-container">
                <div class="auth-logo" style="text-align:center; margin-bottom:2rem;">
                    <div class="auth-logo-icon" style="font-size:3rem;">📚</div>
                </div>
                <div class="card auth-card reveal">
                    <h1 class="auth-title">Create account</h1>
                    <form id="registerForm" onsubmit="handleRegister(event)">
                        <div class="form-group">
                            <label class="form-label">Name</label>
                            <input type="text" name="name" class="form-input" placeholder="Your name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-input" placeholder="you@example.com" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-input" placeholder="Choose a password" required>
                        </div>
                        <div id="registerError"></div>
                        <button type="submit" class="btn btn-primary" style="width: 100%">Create Account</button>
                    </form>
                    <div class="auth-links">
                        <p>Already have an account? <a href="javascript:navigate('login')">Login</a></p>
                    </div>
                </div>
            </div>
        </div>
    `);
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.elements.name.value;
    const email = form.elements.email.value;
    const password = form.elements.password.value;

    const result = await apiCall('/auth/register', 'POST', { name, email, password }, false);

    if (result.error) {
        document.getElementById('registerError').innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    } else {
        navigate('login');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

async function renderDashboard() {
    const coursesResult = await apiCall(`/courses?user_id=${APP.user.id}`);
    const notesResult = await apiCall(`/notes?user_id=${APP.user.id}`);
    const bookmarksResult = await apiCall(`/bookmarks?user_id=${APP.user.id}`);

    const coursesCount = coursesResult.courses?.length || 0;
    const notesCount = notesResult.notes?.length || 0;
    const bookmarksCount = bookmarksResult.bookmarks?.length || 0;

    return container(`
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; gap:2rem; flex-wrap:wrap;">
            <div>
                <p class="page-desc" style="text-transform:uppercase; letter-spacing:0.14em; font-size:0.75rem; margin-bottom:0.5rem;">Personal Learning Hub</p>
                <h1 class="page-title">Welcome, ${APP.user.name || APP.user.email}</h1>
                <p class="page-desc">A quiet place for courses, notes, and bookmarks — organized with care.</p>
            </div>
            <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                <button onclick="navigate('courseNew')" class="btn btn-primary">Import course</button>
                <button onclick="navigate('noteNew')" class="btn btn-secondary">Write note</button>
            </div>
        </div>

        <div class="dashboard-grid">
            <a href="javascript:navigate('courses')" class="card stat-card reveal" style="text-decoration:none; color:inherit; cursor:pointer;">
                <div class="stat-number">${coursesCount}</div>
                <div class="stat-label">Courses</div>
            </a>
            <a href="javascript:navigate('notes')" class="card stat-card reveal" style="text-decoration:none; color:inherit; cursor:pointer;">
                <div class="stat-number">${notesCount}</div>
                <div class="stat-label">Notes</div>
            </a>
            <a href="javascript:navigate('bookmarks')" class="card stat-card reveal" style="text-decoration:none; color:inherit; cursor:pointer;">
                <div class="stat-number">${bookmarksCount}</div>
                <div class="stat-label">Bookmarks</div>
            </a>
        </div>

        <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="grid">
                <div class="card action-card reveal" onclick="navigate('courseNew')" style="cursor:pointer;">
                    <h3 class="card-title">Import a playlist</h3>
                    <p class="card-desc">Turn a YouTube playlist into a structured course with a clean video flow.</p>
                </div>
                <div class="card action-card reveal" onclick="navigate('noteNew')" style="cursor:pointer;">
                    <h3 class="card-title">Capture an idea</h3>
                    <p class="card-desc">Create a markdown note with tags, structure, and a polished reading view.</p>
                </div>
                <div class="card action-card reveal" onclick="navigate('bookmarkNew')" style="cursor:pointer;">
                    <h3 class="card-title">Save for later</h3>
                    <p class="card-desc">Store a link instantly so it lives with the rest of your learning system.</p>
                </div>
            </div>
        </div>
    `);
}

// ═══════════════════════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════════════════════

async function renderCourses() {
    const result = await apiCall(`/courses?user_id=${APP.user.id}`);
    const courses = result.courses || [];

    return container(`
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; gap:2rem;">
            <div>
                <h1 class="page-title">Courses</h1>
                <p class="page-desc">Your imported playlists and learning paths</p>
            </div>
            <button onclick="navigate('courseNew')" class="btn btn-primary">Import course</button>
        </div>

        <div class="grid">
            ${courses.map(course => `
                <div class="card course-card reveal" onclick="navigate('courseView', {id: '${course.id}'})" style="cursor:pointer;">
                    <h3 class="card-title">${course.title}</h3>
                    <p class="card-desc">${course.description || 'No description'}</p>
                    <div class="course-meta" style="margin-top:1rem;">
                        <span>📹 ${course.video_count || 0} videos</span>
                    </div>
                </div>
            `).join('')}
        </div>

        ${courses.length === 0 ? `
            <div style="text-align:center; padding:3rem; color:var(--ink-muted);">
                <p style="font-size:var(--text-lg); margin-bottom:1rem;">No courses yet</p>
                <button onclick="navigate('courseNew')" class="btn btn-primary">Import your first course</button>
            </div>
        ` : ''}
    `);
}

function renderNewCourse() {
    return container(`
        <a href="javascript:navigate('courses')" class="back-link">Back to courses</a>
        
        <div class="page-header">
            <h1 class="page-title">Import a Course</h1>
            <p class="page-desc">Paste a YouTube playlist URL to create a structured course</p>
        </div>

        <div style="max-width:600px;">
            <div class="card reveal">
                <form id="courseForm" onsubmit="handleNewCourse(event)">
                    <div class="form-group">
                        <label class="form-label">YouTube Playlist URL</label>
                        <input type="url" name="playlist_url" class="form-input" placeholder="https://www.youtube.com/playlist?list=..." required>
                    </div>
                    <div id="courseError"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Import Course</button>
                </form>
            </div>
        </div>
    `);
}

async function handleNewCourse(e) {
    e.preventDefault();
    const form = e.target;
    const playlistUrl = form.elements.playlist_url.value;

    const result = await apiCall('/courses', 'POST', {
        user_id: APP.user.id,
        playlist_url: playlistUrl
    });

    if (result.error) {
        document.getElementById('courseError').innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    } else {
        navigate('courses');
    }
}

async function renderViewCourse(params) {
    const result = await apiCall(`/courses/${params.id}`);

    if (result.error) {
        navigate('courses');
        return;
    }

    const course = result.course;
    const videos = result.videos || [];

    return container(`
        <a href="javascript:navigate('courses')" class="back-link">Back to courses</a>

        <div class="course-hero">
            <div class="course-hero-copy">
                <h1 class="page-title">${course.title}</h1>
                <p class="course-summary">${course.description || 'No description available'}</p>
            </div>
            <button onclick="deleteCourse('${course.id}')" class="btn btn-danger">Delete</button>
        </div>

        <div class="course-stage">
            <div>
                <div class="player-shell">
                    <div id="playerContainer" style="aspect-ratio:16/9; background:#111;">
                        ${videos.length > 0 ? `
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videos[0].video_id}" 
                                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen></iframe>
                        ` : '<p style="color:#999; padding:2rem;">No videos available</p>'}
                    </div>
                </div>
            </div>

            <div class="course-sidebar">
                <div class="course-sidebar-header">
                    <h4>Videos</h4>
                    <p>${videos.length} in course</p>
                </div>
                <div class="video-list">
                    ${videos.map((video, idx) => `
                        <button class="video-item ${idx === 0 ? 'active' : ''}" onclick="changeVideo('${video.video_id}', this)">
                            <div class="video-index">${idx + 1}</div>
                            <div class="video-info">
                                <h4>${video.title}</h4>
                                <span>${video.duration || 'Duration unknown'}</span>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `);
}

function changeVideo(videoId, element) {
    document.querySelectorAll('.video-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    const playerContainer = document.getElementById('playerContainer');
    playerContainer.innerHTML = `
        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen></iframe>
    `;
}

async function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        const result = await apiCall(`/courses/${courseId}?user_id=${APP.user.id}`, 'DELETE');
        if (!result.error) {
            navigate('courses');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════════════

async function renderNotes(params = {}) {
    const tag = params.tag || null;
    const query = tag ? `?user_id=${APP.user.id}&tag=${tag}` : `?user_id=${APP.user.id}`;
    
    const notesResult = await apiCall(`/notes${query}`);
    const tagsResult = await apiCall(`/notes/tags/${APP.user.id}`);

    const notes = notesResult.notes || [];
    const tags = tagsResult.tags || [];

    return container(`
        <div class="layout-sidebar">
            <div class="sidebar reveal">
                <div class="sidebar-title">Tags</div>
                <ul class="sidebar-list">
                    <li><a href="javascript:navigate('notes')" class="${!tag ? 'active' : ''}">All Notes</a></li>
                    ${tags.map(t => `<li><a href="javascript:navigate('notes', {tag: '${t}'})" class="${tag === t ? 'active' : ''}">${t}</a></li>`).join('')}
                </ul>
            </div>

            <div>
                <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; gap:2rem;">
                    <div>
                        <h1 class="page-title">Notes</h1>
                        <p class="page-desc">Your thoughts and ideas</p>
                    </div>
                    <button onclick="navigate('noteNew')" class="btn btn-primary">New note</button>
                </div>

                <div class="grid">
                    ${notes.map(note => `
                        <div class="card note-card reveal" onclick="navigate('noteView', {id: '${note.id}'})" style="cursor:pointer;">
                            <h3 class="card-title">${note.title}</h3>
                            <p class="card-desc">${note.content.substring(0, 100)}...</p>
                            ${note.tags && note.tags.length > 0 ? `
                                <div class="tags" style="margin-top:1rem;">
                                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                ${notes.length === 0 ? `
                    <div style="text-align:center; padding:3rem; color:var(--ink-muted);">
                        <p style="font-size:var(--text-lg); margin-bottom:1rem;">No notes yet</p>
                        <button onclick="navigate('noteNew')" class="btn btn-primary">Create your first note</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `);
}

function renderNewNote() {
    return container(`
        <a href="javascript:navigate('notes')" class="back-link">Back to notes</a>

        <div class="page-header">
            <h1 class="page-title">Create a Note</h1>
        </div>

        <div style="max-width:900px;">
            <div class="card reveal">
                <form id="noteForm" onsubmit="handleNewNote(event)">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" name="title" class="form-input" placeholder="Note title" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Content (Markdown)</label>
                        <textarea name="content" class="form-input form-textarea" placeholder="Write your note..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tags (comma-separated)</label>
                        <input type="text" name="tags" class="form-input" placeholder="tag1, tag2, tag3">
                    </div>
                    <div id="noteError"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Create Note</button>
                </form>
            </div>
        </div>
    `);
}

async function handleNewNote(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value;
    const content = form.elements.content.value;
    const tagsStr = form.elements.tags.value;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

    const result = await apiCall('/notes', 'POST', {
        user_id: APP.user.id,
        title,
        content,
        tags
    });

    if (result.error) {
        document.getElementById('noteError').innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    } else {
        navigate('notes');
    }
}

async function renderViewNote(params) {
    const result = await apiCall(`/notes/${params.id}`);

    if (result.error) {
        navigate('notes');
        return;
    }

    const note = result.note;

    return container(`
        <a href="javascript:navigate('notes')" class="back-link">Back to notes</a>

        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; gap:2rem;">
            <div>
                <h1 class="page-title">${note.title}</h1>
                ${note.tags && note.tags.length > 0 ? `
                    <div class="tags" style="margin-top:1rem;">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div style="display:flex; gap:0.5rem;">
                <button onclick="navigate('noteEdit', {id: '${note.id}'})" class="btn btn-secondary">Edit</button>
                <button onclick="deleteNote('${note.id}')" class="btn btn-danger">Delete</button>
            </div>
        </div>

        <div style="max-width:900px;">
            <div class="card note-content" style="margin-bottom:3rem;">
                ${marked(note.content)}
            </div>
        </div>
    `);
}

async function renderEditNote(params) {
    const result = await apiCall(`/notes/${params.id}`);

    if (result.error) {
        navigate('notes');
        return;
    }

    const note = result.note;

    return container(`
        <a href="javascript:navigate('noteView', {id: '${note.id}'})" class="back-link">Back to note</a>

        <div class="page-header">
            <h1 class="page-title">Edit Note</h1>
        </div>

        <div style="max-width:900px;">
            <div class="card reveal">
                <form id="editNoteForm" onsubmit="handleEditNote(event, '${note.id}')">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" name="title" class="form-input" value="${note.title}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Content (Markdown)</label>
                        <textarea name="content" class="form-input form-textarea" required>${note.content}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tags (comma-separated)</label>
                        <input type="text" name="tags" class="form-input" value="${note.tags ? note.tags.join(', ') : ''}">
                    </div>
                    <div id="editNoteError"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Save Changes</button>
                </form>
            </div>
        </div>
    `);
}

async function handleEditNote(e, noteId) {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value;
    const content = form.elements.content.value;
    const tagsStr = form.elements.tags.value;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

    const result = await apiCall(`/notes/${noteId}?user_id=${APP.user.id}`, 'PUT', {
        title,
        content,
        tags
    });

    if (result.error) {
        document.getElementById('editNoteError').innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    } else {
        navigate('noteView', { id: noteId });
    }
}

async function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        const result = await apiCall(`/notes/${noteId}?user_id=${APP.user.id}`, 'DELETE');
        if (!result.error) {
            navigate('notes');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOKMARKS
// ═══════════════════════════════════════════════════════════════════════════

async function renderBookmarks(params = {}) {
    const category = params.category || null;
    const query = category ? `?user_id=${APP.user.id}&category=${category}` : `?user_id=${APP.user.id}`;
    
    const bookmarksResult = await apiCall(`/bookmarks${query}`);
    const categoriesResult = await apiCall(`/bookmarks/categories/${APP.user.id}`);

    const bookmarks = bookmarksResult.bookmarks || [];
    const categories = categoriesResult.categories || [];

    return container(`
        <div class="layout-sidebar">
            <div class="sidebar reveal">
                <div class="sidebar-title">Categories</div>
                <ul class="sidebar-list">
                    <li><a href="javascript:navigate('bookmarks')" class="${!category ? 'active' : ''}">All Bookmarks</a></li>
                    ${categories.map(c => `<li><a href="javascript:navigate('bookmarks', {category: '${c}'})" class="${category === c ? 'active' : ''}">${c}</a></li>`).join('')}
                </ul>
            </div>

            <div>
                <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end; gap:2rem;">
                    <div>
                        <h1 class="page-title">Bookmarks</h1>
                        <p class="page-desc">Your saved links</p>
                    </div>
                    <button onclick="navigate('bookmarkNew')" class="btn btn-primary">New bookmark</button>
                </div>

                <div class="grid">
                    ${bookmarks.map(bookmark => `
                        <div class="card bookmark-card reveal">
                            <h3 class="card-title"><a href="${bookmark.url}" target="_blank">${bookmark.title}</a></h3>
                            <p class="card-desc">${bookmark.description || ''}</p>
                            <a href="${bookmark.url}" target="_blank" class="bookmark-url">${bookmark.url}</a>
                            <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                                <button onclick="navigate('bookmarkEdit', {id: '${bookmark.id}'})" class="btn btn-secondary">Edit</button>
                                <button onclick="deleteBookmark('${bookmark.id}')" class="btn btn-danger">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${bookmarks.length === 0 ? `
                    <div style="text-align:center; padding:3rem; color:var(--ink-muted);">
                        <p style="font-size:var(--text-lg); margin-bottom:1rem;">No bookmarks yet</p>
                        <button onclick="navigate('bookmarkNew')" class="btn btn-primary">Save your first bookmark</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `);
}

function renderNewBookmark() {
    return container(`
        <a href="javascript:navigate('bookmarks')" class="back-link">Back to bookmarks</a>

        <div class="page-header">
            <h1 class="page-title">Save a Bookmark</h1>
        </div>

        <div style="max-width:600px;">
            <div class="card reveal">
                <form id="bookmarkForm" onsubmit="handleNewBookmark(event)">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" name="title" class="form-input" placeholder="Bookmark title" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">URL</label>
                        <input type="url" name="url" class="form-input" placeholder="https://..." required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea name="description" class="form-input form-textarea" placeholder="Optional description" style="min-height:100px;"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <input type="text" name="category" class="form-input" placeholder="general" value="general">
                    </div>
                    <div id="bookmarkError"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Save Bookmark</button>
                </form>
            </div>
        </div>
    `);
}

async function handleNewBookmark(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value;
    const url = form.elements.url.value;
    const description = form.elements.description.value;
    const category = form.elements.category.value || 'general';

    const result = await apiCall('/bookmarks', 'POST', {
        user_id: APP.user.id,
        title,
        url,
        description,
        category
    });

    if (result.error) {
        document.getElementById('bookmarkError').innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    } else {
        navigate('bookmarks');
    }
}

async function renderEditBookmark(params) {
    const result = await apiCall(`/bookmarks/${params.id}`);

    if (result.error) {
        navigate('bookmarks');
        return;
    }

    const bookmark = result.bookmark || result.bookmarks?.[0];

    return container(`
        <a href="javascript:navigate('bookmarks')" class="back-link">Back to bookmarks</a>

        <div class="page-header">
            <h1 class="page-title">Edit Bookmark</h1>
        </div>

        <div style="max-width:600px;">
            <div class="card reveal">
                <form id="editBookmarkForm" onsubmit="handleEditBookmark(event, '${bookmark.id}')">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" name="title" class="form-input" value="${bookmark.title}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">URL</label>
                        <input type="url" name="url" class="form-input" value="${bookmark.url}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea name="description" class="form-input form-textarea" style="min-height:100px;">${bookmark.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <input type="text" name="category" class="form-input" value="${bookmark.category || 'general'}">
                    </div>
                    <div id="editBookmarkError"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Save Changes</button>
                </form>
            </div>
        </div>
    `);
}

async function handleEditBookmark(e, bookmarkId) {
    e.preventDefault();
    const form = e.target;
    const title = form.elements.title.value;
    const url = form.elements.url.value;
    const description = form.elements.description.value;
    const category = form.elements.category.value;

    const result = await apiCall(`/bookmarks/${bookmarkId}?user_id=${APP.user.id}`, 'PUT', {
        title,
        url,
        description,
        category
    });

    if (result.error) {
        document.getElementById('editBookmarkError').innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    } else {
        navigate('bookmarks');
    }
}

async function deleteBookmark(bookmarkId) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
        const result = await apiCall(`/bookmarks/${bookmarkId}?user_id=${APP.user.id}`, 'DELETE');
        if (!result.error) {
            navigate('bookmarks');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKDOWN SUPPORT (using marked.js)
// ═══════════════════════════════════════════════════════════════════════════

// Simple markdown renderer if marked.js is not available
function marked(markdown) {
    if (typeof window.marked !== 'undefined') {
        return window.marked(markdown);
    }
    // Basic fallback
    return `<pre>${markdown}</pre>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// APP INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        navigate('dashboard');
    } else {
        navigate('login');
    }
});
