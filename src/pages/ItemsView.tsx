import React from 'react';

const ItemsView: React.FC = () => {
    return (
        <div className="view-container fade-in">
            <header className="view-header">
                <h2>Objects & Runes</h2>
                <input
                    type="text"
                    placeholder="Search items..."
                    className="search-input"
                />
            </header>

            <div className="empty-state">
                <p>Item catalog coming soon.</p>
            </div>
        </div>
    );
};

export default ItemsView;
