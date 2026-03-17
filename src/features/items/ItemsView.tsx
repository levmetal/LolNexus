import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MOCK_ITEMS } from '../../data/mockItems';
import ItemIcon from './ItemIcon';

/* ── Champion-class → item-tag mapping ──────────────── */
const CLASS_FILTERS: { label: string; icon: string; matchTags: string[] }[] = [
    { label: 'Fighter', icon: '⚔️', matchTags: ['Damage', 'Health', 'HealthRegen', 'LifeSteal'] },
    { label: 'Mage', icon: '🔮', matchTags: ['SpellDamage', 'Mana', 'MagicPenetration', 'AbilityHaste'] },
    { label: 'Tank', icon: '🛡️', matchTags: ['Armor', 'SpellBlock', 'Health', 'HealthRegen'] },
    { label: 'Assassin', icon: '🗡️', matchTags: ['Damage', 'ArmorPenetration', 'CriticalStrike', 'AttackSpeed'] },
    { label: 'Marksman', icon: '🏹', matchTags: ['CriticalStrike', 'AttackSpeed', 'Damage', 'LifeSteal'] },
    { label: 'Support', icon: '💫', matchTags: ['ManaRegen', 'HealthRegen', 'Active', 'Aura', 'AbilityHaste'] },
];

/* ── Craft component with hover tooltip ─────────────── */
const CraftIcon: React.FC<{ comp: any; size?: number }> = ({ comp, size = 36 }) => {
    const [show, setShow] = useState(false);
    return (
        <div
            className="craft-icon-wrap"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <ItemIcon id={comp.id} name={comp.name} size={size} />
            {show && (
                <div className="craft-tooltip">
                    <strong>{comp.name}</strong>
                    <span className="craft-tooltip-gold">{comp.gold.total}G</span>
                    {comp.plaintext && <p>{comp.plaintext}</p>}
                </div>
            )}
        </div>
    );
};

/* ── Crafting recipe component ──────────────────────── */
const CraftingTree: React.FC<{ item: any }> = ({ item }) => {
    const components = (item.from || [])
        .map((id: string) => (MOCK_ITEMS as any)[id])
        .filter(Boolean);

    if (components.length === 0) return null;

    return (
        <div className="crafting-tree">
            <h5 className="crafting-title">Recipe</h5>
            <div className="crafting-layout">
                {/* Result item */}
                <div className="craft-result">
                    <ItemIcon id={item.id} name={item.name} size={44} />
                    <span className="craft-gold">{item.gold.total}G</span>
                </div>
                <div className="craft-arrow">←</div>
                {/* Components */}
                <div className="craft-components">
                    {components.map((comp: any) => {
                        const subComps = (comp.from || [])
                            .map((cid: string) => (MOCK_ITEMS as any)[cid])
                            .filter(Boolean);
                        return (
                            <div key={comp.id} className="craft-component-group">
                                <div className="craft-component">
                                    <CraftIcon comp={comp} size={36} />
                                    <span className="craft-comp-name">{comp.name}</span>
                                    <span className="craft-gold">{comp.gold.total}G</span>
                                </div>
                                {subComps.length > 0 && (
                                    <div className="craft-sub-components">
                                        {subComps.map((sc: any) => (
                                            <CraftIcon key={sc.id} comp={sc} size={22} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {item.gold.base > 0 && (
                        <div className="craft-combine-cost">
                            <span>+ {item.gold.base}G combine</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ItemsView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [visibleCount, setVisibleCount] = useState(120);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const itemsArray = useMemo(() => {
        const allItems = Object.values(MOCK_ITEMS).filter((item: any) =>
            item.inStore
            && !item.name.startsWith('Quest:')
            && !item.name.startsWith('Showdown')
            && item.maps?.['11'] !== false
            && !/^7\d{3}$/.test(String(item.id))
        );
        const byName = new Map<string, any>();
        for (const item of allItems) {
            const existing = byName.get(item.name);
            if (!existing || item.gold.total > existing.gold.total) {
                byName.set(item.name, item);
            }
        }
        return Array.from(byName.values());
    }, []);

    const categories = ['All', 'Attack', 'Magic', 'Defense', 'Boots', 'Consumable'];

    const filteredItems = useMemo(() => {
        return itemsArray.filter((item: any) => {
            const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchName) return false;
            const tags = item.tags || [];
            let matchCat = true;
            if (selectedCategory !== 'All') {
                switch (selectedCategory) {
                    case 'Attack': matchCat = tags.includes('Damage') || tags.includes('CriticalStrike') || tags.includes('AttackSpeed') || tags.includes('ArmorPenetration'); break;
                    case 'Magic': matchCat = tags.includes('SpellDamage') || tags.includes('Mana') || tags.includes('MagicPenetration') || tags.includes('AbilityHaste'); break;
                    case 'Defense': matchCat = tags.includes('Health') || tags.includes('Armor') || tags.includes('SpellBlock') || tags.includes('HealthRegen'); break;
                    case 'Boots': matchCat = tags.includes('Boots'); break;
                    case 'Consumable': matchCat = tags.includes('Consumable'); break;
                }
                if (!matchCat) return false;
            }
            if (selectedClass) {
                const classFilter = CLASS_FILTERS.find(c => c.label === selectedClass);
                if (classFilter) {
                    const hasAny = classFilter.matchTags.some(t => tags.includes(t));
                    if (!hasAny) return false;
                }
            }
            return true;
        });
    }, [searchTerm, selectedCategory, selectedClass, itemsArray]);



    const handleLoadMore = useCallback((entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
            setVisibleCount(prev => Math.min(prev + 120, filteredItems.length));
        }
    }, [filteredItems.length]);

    useEffect(() => {
        const el = loadMoreRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleLoadMore, { rootMargin: '600px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore]);

    const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);
    const activeItem = selectedItem;

    return (
        <div className="runes-page fade-in">
            <header className="view-header items-header">
                <div className="header-content-main">
                    <h2>Arsenal & Artifacts</h2>
                    <div className="items-filter-bar">
                        <div className="category-chips">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setVisibleCount(120);
                                    }}
                                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <span className="filter-divider">|</span>
                        <div className="category-chips class-chips">
                            {CLASS_FILTERS.map(cf => (
                                <button
                                    key={cf.label}
                                    onClick={() => {
                                        setSelectedClass(selectedClass === cf.label ? null : cf.label);
                                        setVisibleCount(120);
                                    }}
                                    className={`category-chip class-chip ${selectedClass === cf.label ? 'active-class' : ''}`}
                                    title={`Items for ${cf.label}`}
                                >
                                    <span className="class-icon">{cf.icon}</span> {cf.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="controls">
                    <input
                        type="search"
                        placeholder="Filter objects..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setVisibleCount(120);
                        }}
                    />
                </div>
            </header>

            <div className="runes-layout">
                <main className="runes-left-col">
                    <div className="grid-container item-grid-compact">
                        {visibleItems.map(item => (
                            <div
                                key={item.id}
                                className={`item-card-compact ${activeItem?.id === item.id ? 'active-item' : ''}`}
                                onClick={() => setSelectedItem(activeItem?.id === item.id ? null : item)}
                            >
                                <div className="item-icon-wrapper">
                                    <ItemIcon id={item.id} name={item.name} size={48} />
                                </div>
                                <div className="item-mini-info">
                                    <span className="item-gold">{item.gold.total}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={loadMoreRef} style={{ height: '80px', width: '100%', gridColumn: '1/-1' }} />
                    </div>
                </main>

                <aside className="runes-info-col">
                    <div className="rune-detail-card item-detail-scrollable">
                        {activeItem ? (
                            <div className="item-detail-full animate-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <header className="rune-detail-header">
                                    <ItemIcon id={activeItem.id} name={activeItem.name} size={52} className="rune-detail-icon item-border-glow" />
                                    <div style={{ flex: 1 }}>
                                        <h4 className="rune-detail-name">{activeItem.name}</h4>
                                        <div className="item-labels">
                                            <span className="cost-label">{activeItem.gold.total}G</span>
                                            {activeItem.tags?.slice(0, 3).map((t: string) => (
                                                <span key={t} className="tag-label">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </header>
                                <p className="rune-detail-short" style={{ fontStyle: 'italic', marginBottom: '0.75rem' }}>{activeItem.plaintext}</p>
                                <div className="rune-detail-long" dangerouslySetInnerHTML={{ __html: activeItem.description }} />
                                <CraftingTree item={activeItem} />
                                <footer className="item-footer-extra">
                                    <span>Sell: {activeItem.gold.sell}G</span>
                                    <span>Tier: {activeItem.depth || 1}</span>
                                </footer>
                            </div>
                        ) : (
                            <div className="rune-hint" style={{ margin: 'auto' }}>
                                <p>Click an item to inspect its properties & recipe</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ItemsView;
