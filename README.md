# Wizard Survivors 🧙‍♂️

A Vampire Survivors-inspired roguelike game built with HTML5 Canvas and React.

## 🎮 Game Features

- **Top-down survival gameplay** - Fight waves of enemies
- **Skill Tree System** - Upgrade your wizard with Combat, Defense, and Magic skills
- **Equipment System** - Collect and equip gear with different rarities
- **Achievement System** - Unlock achievements and earn rewards
- **Multiple Weapons** - Unlock and upgrade different weapons
- **Music Controls** - Toggle background music

## 📁 Project Structure

```
wizard-survivors/
├── index.html              # Main HTML file
├── assets/                 # Game assets (images, sprites, sounds)
│   ├── Background*.png     # Background textures
│   ├── IceBackgroundGame.png
│   ├── *Game.png          # Game sprites and UI elements
│   └── sounds/            # Audio files
├── src/
│   ├── components/
│   │   └── UI.jsx         # React UI components (menus, HUD)
│   ├── game/
│   │   └── game.js        # Core game logic and Canvas rendering
│   ├── utils/             # Helper functions (future)
│   └── constants/         # Game constants (future)
└── styles/
    └── main.css           # All CSS styles
```

## 🚀 Getting Started

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/fabiankjaergaard/wizard-survivors.git
cd wizard-survivors
```

2. Open `index.html` in a modern browser, or use a local server:
```bash
# Using Python
python3 -m http.server 5500

# Using Node.js
npx http-server -p 5500
```

3. Navigate to `http://localhost:5500`

## 🎯 Controls

- **WASD** or **Arrow Keys** - Move wizard
- **ESC** - Go back / Open menu
- **Mouse** - Navigate menus

## 🛠️ Technology Stack

- **Vanilla JavaScript** - Game logic and Canvas rendering
- **React 18** - UI components and state management
- **HTML5 Canvas** - Game rendering
- **CSS3** - Styling

## 📦 Packaging for Distribution

### Steam / Desktop

Use **Electron** or **Tauri** to package as a desktop app.

### Web

Deploy to **Itch.io**, **GitHub Pages**, or **Vercel/Netlify**.

## 📝 Development

### Adding New Features

1. **New UI Components** - Add to `src/components/`
2. **Game Logic** - Modify `src/game/game.js`
3. **Styles** - Update `styles/main.css`
4. **Assets** - Add to `assets/`

## 📄 License

Copyright © 2025 Fabian Kjærgaard

---

🤖 Built with Claude Code
