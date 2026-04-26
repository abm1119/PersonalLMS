# LMS Suite Frontend

A clean, minimal learning management system frontend built with **plain HTML, CSS, and JavaScript** - no frameworks required.

## Features

- 🔐 **Authentication** - Login and register
- 📚 **Courses** - Import YouTube playlists as structured courses
- 📝 **Notes** - Create markdown notes with tags and filtering
- 🔖 **Bookmarks** - Save and organize links by category
- ✨ **Minimal Design** - Clean, distraction-free interface

## Architecture

This is a **Single Page Application (SPA)** that communicates directly with the FastAPI backend:

- **No server-side rendering** - Everything happens in the browser
- **No build step** - Pure HTML/CSS/JS
- **No frameworks** - Vanilla JavaScript with client-side routing
- **Responsive design** - Mobile, tablet, and desktop support

## Getting Started

### Prerequisites

- The FastAPI backend running on `https://abm-111-abmlms.hf.space`
- A web server to serve the static files (or use a simple HTTP server)

### Option 1: Using Python's Built-in HTTP Server

```bash
cd frontend
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Option 2: Using Node.js http-server

```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

### Option 4: Direct Browser Access

Simply open `frontend/index.html` directly in your browser (note: some features may not work due to browser security restrictions).

## Backend Configuration

The frontend expects the backend API at `https://abm-111-abmlms.hf.space/api`. If your backend is running on a different URL, edit the `BASE_URL` variable in `static/js/app.js`:

```javascript
const BASE_URL = 'https://abm-111-abmlms.hf.space/api';
```

## Project Structure

```
frontend/
├── index.html           # Main HTML file (SPA entry point)
├── static/
│   ├── css/
│   │   └── style.css    # All styling (responsive, minimal design)
│   └── js/
│       └── app.js       # Complete SPA logic (routing, API calls, rendering)
└── README.md           # This file
```

## How It Works

### Client-Side Routing

The application uses simple hash-based routing:
- `#dashboard` - Main dashboard
- `#courses` - List courses
- `#courseNew` - Import new course
- `#notes` - List notes
- `#notes?tag=javascript` - Filter notes by tag
- `#bookmarks` - List bookmarks

### State Management

- User authentication stored in `localStorage`
- JWT tokens included in all API requests
- Automatic logout on 401 responses

### API Communication

The frontend communicates with these API endpoints:

**Auth:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

**Courses:**
- `GET /courses?user_id=...` - List courses
- `POST /courses` - Import new course
- `GET /courses/{id}` - Get course details
- `DELETE /courses/{id}` - Delete course

**Notes:**
- `GET /notes?user_id=...` - List notes
- `GET /notes?user_id=...&tag=...` - List notes by tag
- `GET /notes/tags/{user_id}` - Get all tags
- `POST /notes` - Create note
- `GET /notes/{id}` - Get note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

**Bookmarks:**
- `GET /bookmarks?user_id=...` - List bookmarks
- `GET /bookmarks/categories/{user_id}` - Get all categories
- `POST /bookmarks` - Create bookmark
- `GET /bookmarks/{id}` - Get bookmark
- `PUT /bookmarks/{id}` - Update bookmark
- `DELETE /bookmarks/{id}` - Delete bookmark

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Styling

The frontend uses:
- **Fonts**: Fraunces (display) + DM Sans (body) from Google Fonts
- **Design System**: CSS custom properties for colors, spacing, typography
- **Responsive**: Mobile-first approach with media queries
- **Animations**: Smooth transitions and reveal animations

### Color Palette

- **Canvas**: `#FDFCF8` (background)
- **Surface**: `#FFFFFF` (cards)
- **Accent**: `#C9A227` (gold)
- **Ink**: `#1A1916` (text)
- **Success**: `#2E7D6B`
- **Error**: `#B84444`

## JavaScript Utilities

### Navigation

```javascript
navigate('dashboard');              // Go to dashboard
navigate('courseView', {id: '123'}) // Go to course with params
```

### API Calls

```javascript
const result = await apiCall('/endpoint', 'GET');
const result = await apiCall('/endpoint', 'POST', {data: 'value'});
```

### Authentication

```javascript
setAuth(token, user);  // Set authentication
logout();              // Clear auth and redirect to login
isAuthenticated();     // Check if user is logged in
```

## Markdown Support

Notes support markdown rendering. If you want to add markdown support, include marked.js in the HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

The app will automatically use it if available, otherwise falls back to plain `<pre>` tags.

## Development

To modify the frontend:

1. **Add a new page**: Create a `renderNewPage()` function in `app.js` and add it to the `routes` object
2. **Update styling**: Edit `static/css/style.css`
3. **Change colors**: Update CSS custom properties in `:root`
4. **Add animations**: Use the `reveal` class and CSS transitions

## Deployment

To deploy the frontend:

1. Ensure the backend is available at your production URL
2. Update `BASE_URL` in `app.js` to point to your production API
3. Serve the `frontend/` directory with any static file server:
   - Nginx
   - Apache
   - GitHub Pages
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

## Performance

- **No dependencies** - Fast initial load
- **Minimal CSS** - ~15KB gzipped
- **Lightweight JS** - ~25KB gzipped
- **Lazy rendering** - Only renders visible content
- **Smooth animations** - 60fps CSS transitions

## License

MIT
