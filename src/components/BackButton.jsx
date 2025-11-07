// ============================================
// STANDARD BACK BUTTON COMPONENT
// ============================================
// IMPORTANT: This is the ONLY back button design allowed!
// ALL pages MUST use this exact component.
// DO NOT create custom back buttons or modify this styling.
// Size: 300px × 145px
// Background: KNAPP1.png
// Font: Press Start 2P, 24px, color #2a1810
// ============================================
function BackButton({ onClick }) {
    return (
        <button onClick={onClick} style={{
            width: '300px !important',
            height: '145px !important',
            minWidth: '300px !important',
            minHeight: '145px !important',
            maxWidth: '300px !important',
            maxHeight: '145px !important',
            backgroundImage: 'url(assets/KNAPP1.png)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: 'none',
            cursor: 'url(assets/wand-cursor-small.png) 8 8, auto',
            imageRendering: 'pixelated',
            transition: 'transform 0.15s ease, filter 0.15s ease',
            backgroundColor: 'transparent',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '24px',
            color: '#2a1810',
            fontWeight: 'bold',
            textShadow: '2px 2px 0 rgba(255,255,255,0.3)',
            filter: 'brightness(1)',
            marginTop: '20px',
            marginBottom: '-60px',
            padding: '0',
            boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.filter = 'brightness(1.15)';
        }}
        onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.filter = 'brightness(1)';
        }}
        onMouseDown={(e) => {
            e.target.style.transform = 'scale(0.95)';
            e.target.style.filter = 'brightness(0.9)';
        }}
        onMouseUp={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.filter = 'brightness(1.15)';
        }}
        >
            BACK
        </button>
    );
}

// BackButton is now available globally (no export needed for browser)
