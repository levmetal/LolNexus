import React from 'react';

interface NavbarProps {
    currentView: 'champions' | 'items' | 'runes';
    setCurrentView: (view: 'champions' | 'items' | 'runes') => void;
    onClearChamp: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onClearChamp }) => {
    return (
        <nav className="navbar">
            <div className="nav-brand" onClick={onClearChamp} style={{ cursor: 'pointer' }}>
                <h1>LoL <span className="highlight">Nexus</span></h1>
            </div>
            <div className="nav-links">
                <button
                    className={`nav-btn ${currentView === 'champions' ? 'active' : ''}`}
                    onClick={() => { setCurrentView('champions'); onClearChamp(); }}
                >
                    Champions
                </button>
                <button
                    className={`nav-btn ${currentView === 'items' ? 'active' : ''}`}
                    onClick={() => setCurrentView('items')}
                >
                    Objects
                </button>
                <button
                    className={`nav-btn ${currentView === 'runes' ? 'active' : ''}`}
                    onClick={() => setCurrentView('runes')}
                >
                    Runes
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
