# Course Mapping Tool

A static GitHub Pages web app for instructional designers and SMEs to collaborate on online course mapping.

## Features
- Course number and name capture
- Dynamic CLO builder with auto-numbered CLO1, CLO2, etc.
- Bloom's Taxonomy warnings for vague objective language
- Select between 7 and 15 modules and generate module cards automatically
- Module title input, CLO alignment, module-level objectives, assessments, and instructional materials
- Alignment checking with live validation for CLO/MO/assessment rules
- Auto-save in the browser via localStorage
- Download the course map as a Word document (.doc)

## Files
- `index.html` — main application page
- `styles.css` — sleek modern UI styling
- `script.js` — app logic, dynamic module creation, auto-save, and download support
- `.nojekyll` — disables Jekyll on GitHub Pages hosting

## Hosting on GitHub Pages
1. Push this repository to GitHub.
2. In repository settings, enable GitHub Pages from the `main` branch.
3. Visit the published site at `https://<your-username>.github.io/course-map/`.

## Local Development
Serve the folder with any static server. For a quick local preview, run:

```bash
cd course-map
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.
