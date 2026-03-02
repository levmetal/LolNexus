import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import BuildCalculator from '../components/BuildCalculator';
import { MOCK_ITEMS } from '../../mockItems';
import { RUNE_STAT_BONUSES } from './RunesView';
import '../details.css';
import '../buildCalc.css';

interface ChampionsViewProps {
    championsData: any;
    selectedChamp: any;
    setSelectedChamp: (champ: any) => void;
    selectedRunes: number[];
    selectedShards: string[];
}

const ChampionsView: React.FC<ChampionsViewProps> = ({
    championsData,
    selectedChamp,
    setSelectedChamp,
    selectedRunes,
    selectedShards
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('All');

    // Shared state between Abilities and BuildCalculator
    const [level, setLevel] = useState(1);
    const [equippedItems, setEquippedItems] = useState<string[]>([]);

    // Reset build when changing champion
    useEffect(() => {
        setLevel(1);
        setEquippedItems([]);
    }, [selectedChamp]);

    // Real-time stat calculations for Abilities Panel
    const calculatedStats = useMemo(() => {
        if (!selectedChamp) return null;
        const stats = { ...selectedChamp.stats };
        const levelMultiplier = level - 1;

        let bonusAD = 0;
        let bonusAP = 0;
        let bonusHP = 0;

        equippedItems.forEach(itemId => {
            const item: any = MOCK_ITEMS[itemId];
            if (item && item.stats) {
                if (item.stats.FlatPhysicalDamageMod) bonusAD += item.stats.FlatPhysicalDamageMod;
                if (item.stats.FlatMagicDamageMod) bonusAP += item.stats.FlatMagicDamageMod;
                if (item.stats.FlatHPPoolMod) bonusHP += item.stats.FlatHPPoolMod;
            }
        });

        // Add Rune Bonuses
        selectedRunes.forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (b) {
                bonusAD += b.ad ?? 0;
                bonusAP += b.ap ?? 0;
                bonusHP += b.hp ?? 0;
            }
        });
        selectedShards.forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (b) {
                bonusAD += b.ad ?? 0;
                bonusAP += b.ap ?? 0;
                bonusHP += b.hp ?? 0;
            }
        });

        const effectiveAD = stats.attackdamage + (stats.attackdamageperlevel * levelMultiplier);
        const effectiveHP = stats.hp + (stats.hpperlevel * levelMultiplier);

        return {
            bonusAD,
            totalAD: effectiveAD + bonusAD,
            ap: bonusAP,
            bonusHP,
            totalHP: effectiveHP + bonusHP
        };
    }, [selectedChamp, level, equippedItems, selectedRunes, selectedShards]);

    const championsList = useMemo(() => {
        if (!championsData) return [];
        return Object.values(championsData).filter((champ: any) => {
            const matchName = champ.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = selectedRole === 'All' || champ.tags.includes(selectedRole);
            return matchName && matchRole;
        });
    }, [championsData, searchTerm, selectedRole]);

    const roles = ['All', 'Fighter', 'Tank', 'Mage', 'Assassin', 'Marksman', 'Support'];

    // Progressive loading — hooks MUST be before any conditional return
    const [visibleCount, setVisibleCount] = useState(30);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setVisibleCount(30);
    }, [searchTerm, selectedRole]);

    const handleLoadMore = useCallback((entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
            setVisibleCount(prev => Math.min(prev + 30, championsList.length));
        }
    }, [championsList.length]);

    useEffect(() => {
        const el = loadMoreRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleLoadMore, { rootMargin: '200px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore]);

    const visibleChampions = useMemo(() => championsList.slice(0, visibleCount), [championsList, visibleCount]);

    if (!championsData) return <div>No champion data found.</div>;

    if (selectedChamp) {
        return (
            <div className="view-container fade-in">
                <div className="detail-top-bar">
                    <button className="back-btn" onClick={() => setSelectedChamp(null)}>
                        &larr; Back
                    </button>
                    <div className="detail-champ-info">
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${selectedChamp.image.full}`}
                            alt={selectedChamp.name}
                            className="detail-avatar-sm"
                        />
                        <div>
                            <h2 className="detail-name-sm">{selectedChamp.name}</h2>
                            <span className="detail-title-sm">{selectedChamp.title}</span>
                        </div>
                        <div className="champ-roles-sm">
                            {selectedChamp.tags.map((tag: string) => (
                                <span key={tag} className="role-badge-sm">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === MAIN 2-COLUMN LAYOUT === */}
                <div className="detail-main-grid">
                    {/* LEFT: Abilities (scrollable) */}
                    <div className="detail-left-col">
                        <h3 className="section-title">Abilities & Scaling</h3>
                        <div className="abilities-scroll">
                            {/* Passive */}
                            <div className="ability-card">
                                <div className="ability-card-header">
                                    <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/passive/${selectedChamp.passive.image.full}`}
                                        alt={selectedChamp.passive.name}
                                        className="ability-icon"
                                    />
                                    <div className="ability-header-info">
                                        <div className="ability-key-badge passive-badge">P</div>
                                        <h4 className="ability-card-name">{selectedChamp.passive.name}</h4>
                                    </div>
                                </div>
                                <p className="ability-card-desc" dangerouslySetInnerHTML={{ __html: selectedChamp.passive.description }} />
                            </div>

                            {/* Q / W / E / R */}
                            {selectedChamp.spells.map((spell: any, idx: number) => (
                                <div key={spell.id} className="ability-card">
                                    <div className="ability-card-header">
                                        <img
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/spell/${spell.image.full}`}
                                            alt={spell.name}
                                            className="ability-icon"
                                        />
                                        <div className="ability-header-info">
                                            <div className={`ability-key-badge key-${['q', 'w', 'e', 'r'][idx]}`}>
                                                {['Q', 'W', 'E', 'R'][idx]}
                                            </div>
                                            <h4 className="ability-card-name">{spell.name}</h4>
                                        </div>
                                        <div className="ability-mini-stats">
                                            <span className="mini-cd">{spell.cooldownBurn || '—'}s</span>
                                            <span className="mini-cost">{spell.costBurn || '—'}</span>
                                            <span className="mini-range">{spell.rangeBurn || '—'}</span>
                                        </div>
                                    </div>

                                    <p className="ability-card-desc" dangerouslySetInnerHTML={{ __html: spell.description }} />

                                    {spell.leveltip && spell.leveltip.label && spell.leveltip.label.length > 0 && (
                                        <div className="ability-leveltip">
                                            <span className="leveltip-title">Per Rank:</span>
                                            {spell.leveltip.label.map((label: string, i: number) => (
                                                <span key={i} className="leveltip-item">
                                                    {label.replace('@AbilityResourceName@', selectedChamp.partype || 'Mana')}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {calculatedStats && (calculatedStats.bonusAD > 0 || calculatedStats.ap > 0 || calculatedStats.bonusHP > 0) && (
                                        <div className="ability-item-scaling">
                                            <span className="scaling-title">Build:</span>
                                            {calculatedStats.bonusAD > 0 && (
                                                <span className="scaling-chip ad-chip">+{calculatedStats.bonusAD} AD</span>
                                            )}
                                            {calculatedStats.ap > 0 && (
                                                <span className="scaling-chip ap-chip">+{calculatedStats.ap} AP</span>
                                            )}
                                            {calculatedStats.bonusHP > 0 && (
                                                <span className="scaling-chip hp-chip">+{calculatedStats.bonusHP} HP</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Build Calculator */}
                    <div className="detail-right-col">
                        <BuildCalculator
                            selectedChamp={selectedChamp}
                            level={level}
                            setLevel={setLevel}
                            equippedItems={equippedItems}
                            setEquippedItems={setEquippedItems}
                            selectedRunes={selectedRunes}
                            selectedShards={selectedShards}
                        />
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="view-container fade-in">
            <header className="view-header">
                <h2>Champions</h2>
                <div className="controls">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="role-select"
                    >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search champions..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid-container">
                {visibleChampions.map((champ: any) => (
                    <div key={champ.id} className="champ-card" onClick={() => setSelectedChamp(champ)}>
                        <div className="card-image">
                            <img
                                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
                                onError={(e: any) => {
                                    e.target.src = `https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${champ.image.full}`
                                }}
                                alt={champ.name}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="card-content">
                            <h3>{champ.name}</h3>
                            <p className="champ-title">{champ.title}</p>
                        </div>
                    </div>
                ))}
            </div>
            {visibleCount < championsList.length && (
                <div ref={loadMoreRef} style={{ height: '1px' }} />
            )}
        </div>
    );
};

export default ChampionsView;
