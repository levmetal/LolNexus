import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MOCK_ITEMS } from '../../mockItems';

const DDRAGON_VERSIONS = ['15.4.1', '14.23.1', '14.4.1'];
const itemImgUrl = (id: string, ver = DDRAGON_VERSIONS[0]) =>
    `https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png`;

const ItemsView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [hoveredItem, setHoveredItem] = useState<any>(null);

    // Progressive loading state
    const [visibleCount, setVisibleCount] = useState(40);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const itemsArray = useMemo(() => {
        return Object.values(MOCK_ITEMS).filter((item: any) =>
            item.inStore && !item.name.startsWith('Quest:') && !item.name.startsWith('Showdown')
        );
    }, []);

    const categories = ['All', 'Damage', 'Magic', 'Tank', 'Support', 'Boots', 'Consumable'];

    const filteredItems = useMemo(() => {
        return itemsArray.filter((item: any) => {
            const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            let matchCat = true;
            if (selectedCategory === 'Damage') {
                matchCat = item.tags?.includes('Damage') || item.tags?.includes('CriticalStrike') || item.tags?.includes('AttackSpeed') || item.tags?.includes('ArmorPenetration');
            } else if (selectedCategory === 'Magic') {
                matchCat = item.tags?.includes('SpellDamage') || item.tags?.includes('Mana') || item.tags?.includes('MagicPenetration');
            } else if (selectedCategory === 'Tank') {
                matchCat = item.tags?.includes('Health') || item.tags?.includes('Armor') || item.tags?.includes('SpellBlock');
            } else if (selectedCategory === 'Support') {
                matchCat = item.tags?.includes('HealthRegen') || item.tags?.includes('ManaRegen') || item.tags?.includes('Active');
            } else if (selectedCategory === 'Boots') {
                matchCat = item.tags?.includes('Boots');
            } else if (selectedCategory === 'Consumable') {
                matchCat = item.tags?.includes('Consumable');
            }
            return matchName && matchCat;
        });
    }, [searchTerm, selectedCategory, itemsArray]);

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(40);
    }, [searchTerm, selectedCategory]);

    const handleLoadMore = useCallback((entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
            setVisibleCount(prev => Math.min(prev + 40, filteredItems.length));
        }
    }, [filteredItems.length]);

    useEffect(() => {
        const el = loadMoreRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleLoadMore, { rootMargin: '200px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore]);

    const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

    return (
        <div className="view-container fade-in">
            <header className="view-header">
                <h2>LoL Objects</h2>
                <div className="controls">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="role-select"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search objects..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="runes-layout">
                <div className="grid-container item-grid-compact">
                    {visibleItems.map(item => (
                        <div
                            key={item.id}
                            className="champ-card item-card-db compact"
                            onMouseEnter={() => setHoveredItem(item)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <div className="card-image">
                                <img
                                    src={itemImgUrl(item.id)}
                                    alt={item.name}
                                    onError={(e: any) => {
                                        const t = e.target;
                                        if (t.dataset.retry === '1') {
                                            t.dataset.retry = '2';
                                            t.src = itemImgUrl(item.id, DDRAGON_VERSIONS[1]);
                                        } else if (t.dataset.retry === '2') {
                                            t.style.opacity = '0.3';
                                            t.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23222" width="48" height="48" rx="6"/><text x="24" y="28" text-anchor="middle" fill="%23666" font-size="10">?</text></svg>')}`;
                                        } else {
                                            t.dataset.retry = '1';
                                            t.src = itemImgUrl(item.id, DDRAGON_VERSIONS[2]);
                                        }
                                    }}
                                />
                            </div>
                            <div className="card-content">
                                <h3>{item.name}</h3>
                                <span className="champ-title">{item.gold.total}g</span>
                            </div>
                        </div>
                    ))}
                    {/* Sentinel for lazy loading */}
                    <div ref={loadMoreRef} style={{ height: '20px', width: '100%', gridColumn: '1/-1' }} />
                </div>

                <div className="runes-info-col">
                    <div className="rune-detail-card sticky-card">
                        {hoveredItem ? (
                            <>
                                <div className="rune-detail-header">
                                    <img src={itemImgUrl(hoveredItem.id)} alt={hoveredItem.name} className="rune-detail-icon item-db-icon" />
                                    <h4 className="rune-detail-name">{hoveredItem.name}</h4>
                                </div>
                                <p className="rune-detail-short">{hoveredItem.plaintext}</p>
                                <div className="rune-detail-long" dangerouslySetInnerHTML={{ __html: hoveredItem.description }} />
                                <div className="item-stats-summary" style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
                                    <span className="picker-label">Purchase Value: {hoveredItem.gold.total}g</span>
                                    <span className="picker-label">Sell Value: {hoveredItem.gold.sell}g</span>
                                </div>
                            </>
                        ) : (
                            <p className="rune-hint">Hover an object to see its properties</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemsView;
