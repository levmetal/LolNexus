import { useState, useEffect, useMemo } from 'react';
import '../runes.css';

// ── Stat shard definitions ──────────────────────────────────────────────────
export const STAT_SHARDS = {
    offense: [
        { id: 'ats', label: '+10% Attack Speed' },
        { id: 'ah', label: '+8 Ability Haste' },
        { id: 'ad', label: '+9 Adaptive Force' },
    ],
    flex: [
        { id: 'ad2', label: '+9 Adaptive Force' },
        { id: 'ah2', label: '+8 Ability Haste' },
        { id: 'ms', label: '+8 Move Speed' },
    ],
    defense: [
        { id: 'hp1', label: '+15-90 HP (lvl)' },
        { id: 'tenacity', label: '+10% Tenacity + Slow Res' },
        { id: 'overgrowth', label: '+10-180 HP (cs)' },
    ],
};

// Map rune IDs to estimated stat bonuses (for real-time calc display)
// These are representative approximations shown in the UI
export const RUNE_STAT_BONUSES: Record<string | number, { label: string; ad?: number; ap?: number; hp?: number; ah?: number; as?: number; ms?: number }> = {
    // Precision keystones
    8008: { label: 'Lethal Tempo', as: 0.15 },
    8021: { label: 'Fleet Footwork', ms: 15 },
    8010: { label: 'Conqueror', ad: 15 },
    9923: { label: 'Hail of Blades', as: 0.60 },
    // Domination
    8112: { label: 'Electrocute', ad: 20 },
    8124: { label: 'Predator', ms: 45 },
    8128: { label: 'Dark Harvest', ad: 10 },
    // Sorcery
    8214: { label: 'Arcane Comet', ap: 15 },
    8229: { label: 'Phase Rush', ms: 25 },
    8230: { label: 'Unsealed Spellbook', ah: 10 },
    // Resolve
    8437: { label: 'Grasp of the Undying', hp: 30 },
    8439: { label: 'Aftershock', hp: 50 },
    8465: { label: 'Guardian', hp: 0 },
    // Inspiration
    8351: { label: 'Glacial Augment', ms: 0 },
    8360: { label: 'Unseal Spellbook 2', ah: 10 },
    8369: { label: 'First Strike', ad: 10 },
    // Stat shards
    ad: { label: '+AD', ad: 9 },
    ap: { label: '+AP', ap: 15 },
    ah: { label: '+Haste', ah: 8 },
    hp: { label: '+HP', hp: 65 },
    ats: { label: '+Attack Speed', as: 0.10 },
    ah2: { label: '+Haste', ah: 8 },
    ms: { label: '+Move Speed', ms: 8 },
    hp1: { label: '+HP', hp: 65 },
    tenacity: { label: '+Tenacity', },
    overgrowth: { label: '+HP', hp: 90 },
    ad2: { label: '+AD', ad: 9 },
};

const DDRAGON_VER = '15.4.1';
const runeIcon = (icon: string) =>
    `https://ddragon.leagueoflegends.com/cdn/img/${icon}`;

interface RunesViewProps {
    selectedRunes: number[];
    setSelectedRunes: (runes: number[]) => void;
    selectedShards: string[];
    setSelectedShards: (shards: string[]) => void;
}

const RunesView: React.FC<RunesViewProps> = ({
    selectedRunes,
    setSelectedRunes,
    selectedShards,
    setSelectedShards,
}) => {
    const [runeTree, setRuneTree] = useState<any[]>([]);
    const [primaryTree, setPrimaryTree] = useState<number>(0);
    const [secondaryTree, setSecondaryTree] = useState<number>(1);
    const [hoveredRune, setHoveredRune] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VER}/data/en_US/runesReforged.json`)
            .then(r => r.json())
            .then(data => {
                setRuneTree(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // --- Toggle rune selection ---
    const toggleRune = (runeId: number, rowIdx: number, treeIdx: number) => {
        // Remove any previously selected rune from the same row + tree
        const key = `${treeIdx}-${rowIdx}`;
        const nextRunes = selectedRunes.filter(id => {
            // Find which tree/row this rune belongs to
            for (let ti = 0; ti < runeTree.length; ti++) {
                const t = runeTree[ti];
                for (let ri = 0; ri < t.slots.length; ri++) {
                    if (t.slots[ri].runes.some((r: any) => r.id === id)) {
                        if (`${ti}-${ri}` === key) return false;
                    }
                }
            }
            return true;
        });
        nextRunes.push(runeId);
        setSelectedRunes(nextRunes);
    };

    const toggleShard = (rowIdx: number, shardId: string) => {
        const next = [...selectedShards];
        next[rowIdx] = shardId;
        setSelectedShards(next);
    };

    const primaryData = runeTree[primaryTree];
    const secondaryData = runeTree[secondaryTree];

    // Stat bonuses from selected runes
    const runeStatSummary = useMemo(() => {
        let ad = 0, ap = 0, hp = 0, ah = 0, ms = 0, as_ = 0;
        [...selectedRunes].forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (!b) return;
            ad += b.ad ?? 0;
            ap += b.ap ?? 0;
            hp += b.hp ?? 0;
            ah += b.ah ?? 0;
            ms += b.ms ?? 0;
            as_ += b.as ?? 0;
        });
        selectedShards.forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (!b) return;
            ad += b.ad ?? 0;
            ap += b.ap ?? 0;
            hp += b.hp ?? 0;
            ah += b.ah ?? 0;
            ms += b.ms ?? 0;
        });
        return { ad, ap, hp, ah, ms, as: as_ };
    }, [selectedRunes, selectedShards]);

    if (loading) {
        return (
            <div className="loader-container">
                <div className="spinner" />
                <p className="loading-text">Loading Runes...</p>
            </div>
        );
    }

    return (
        <div className="runes-page fade-in">
            <header className="view-header">
                <h2>Rune Builder</h2>
                <button className="rune-clear-btn" onClick={() => { setSelectedRunes([]); setSelectedShards([]); }}>
                    Clear All
                </button>
            </header>

            <div className="runes-layout">
                {/* ── LEFT: Primary + Secondary tree pickers ── */}
                <div className="runes-picker-col">
                    {/* Tree selector */}
                    <div className="tree-selector-row">
                        <div className="tree-select-group">
                            <span className="picker-label">Primary Path</span>
                            <div className="tree-icon-row">
                                {runeTree.map((tree, ti) => (
                                    <button
                                        key={tree.id}
                                        title={tree.name}
                                        className={`tree-icon-btn ${primaryTree === ti ? 'active-primary' : ''} ${secondaryTree === ti ? 'active-secondary-tree' : ''}`}
                                        onClick={() => {
                                            if (ti === secondaryTree) setSecondaryTree(primaryTree);
                                            setPrimaryTree(ti);
                                        }}
                                    >
                                        <img
                                            src={runeIcon(tree.icon)}
                                            alt={tree.name}
                                            onError={(e: any) => { e.target.style.opacity = 0.3; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="tree-select-group">
                            <span className="picker-label">Secondary Path</span>
                            <div className="tree-icon-row">
                                {runeTree.map((tree, ti) => (
                                    <button
                                        key={tree.id}
                                        title={tree.name}
                                        disabled={ti === primaryTree}
                                        className={`tree-icon-btn ${secondaryTree === ti ? 'active-secondary' : ''} ${ti === primaryTree ? 'disabled-tree' : ''}`}
                                        onClick={() => setSecondaryTree(ti)}
                                    >
                                        <img
                                            src={runeIcon(tree.icon)}
                                            alt={tree.name}
                                            onError={(e: any) => { e.target.style.opacity = 0.3; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Side-by-Side Panels Container */}
                    <div className="rune-trees-container">
                        {/* Primary Tree Slots */}
                        {primaryData && (
                            <div className="rune-tree-panel primary-panel">
                                <div className="rune-tree-label">
                                    <img src={runeIcon(primaryData.icon)} alt={primaryData.name} className="tree-label-icon" onError={(e: any) => { e.target.style.display = 'none'; }} />
                                    <span style={{ color: 'var(--primary)' }}>{primaryData.name}</span>
                                </div>
                                {primaryData.slots.map((slot: any, ri: number) => (
                                    <div key={ri} className={`rune-row ${ri === 0 ? 'keystone-row' : ''}`}>
                                        {slot.runes.map((rune: any) => {
                                            const isSelected = selectedRunes.includes(rune.id);
                                            return (
                                                <button
                                                    key={rune.id}
                                                    className={`rune-btn ${isSelected ? 'rune-selected' : ''} ${ri === 0 ? 'keystone-btn' : ''}`}
                                                    onClick={() => toggleRune(rune.id, ri, primaryTree)}
                                                    onMouseEnter={() => setHoveredRune(rune)}
                                                    onMouseLeave={() => setHoveredRune(null)}
                                                    title={rune.name}
                                                >
                                                    <img
                                                        src={runeIcon(rune.icon)}
                                                        alt={rune.name}
                                                        onError={(e: any) => { e.target.style.opacity = 0.3; }}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="secondary-and-shards">
                            {/* Secondary Tree (rows 1-3 only, not keystone) */}
                            {secondaryData && (
                                <div className="rune-tree-panel secondary-panel">
                                    <div className="rune-tree-label">
                                        <img src={runeIcon(secondaryData.icon)} alt={secondaryData.name} className="tree-label-icon" onError={(e: any) => { e.target.style.display = 'none'; }} />
                                        <span style={{ color: 'var(--secondary)' }}>{secondaryData.name}</span>
                                    </div>
                                    {secondaryData.slots.slice(1).map((slot: any, ri: number) => (
                                        <div key={ri} className="rune-row secondary-rune-row">
                                            {slot.runes.map((rune: any) => {
                                                const isSelected = selectedRunes.includes(rune.id);
                                                return (
                                                    <button
                                                        key={rune.id}
                                                        className={`rune-btn ${isSelected ? 'rune-selected-secondary' : ''}`}
                                                        onClick={() => toggleRune(rune.id, ri + 1, secondaryTree)}
                                                        onMouseEnter={() => setHoveredRune(rune)}
                                                        onMouseLeave={() => setHoveredRune(null)}
                                                        title={rune.name}
                                                    >
                                                        <img
                                                            src={runeIcon(rune.icon)}
                                                            alt={rune.name}
                                                            onError={(e: any) => { e.target.style.opacity = 0.3; }}
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stat Shards */}
                            <div className="rune-tree-panel shard-panel">
                                <div className="rune-tree-label">
                                    <span style={{ color: 'var(--accent)' }}>Stat Shards</span>
                                </div>
                                {(['offense', 'flex', 'defense'] as const).map((row, ri) => (
                                    <div key={row} className="rune-row shard-row">
                                        <span className="shard-row-label">{row.charAt(0).toUpperCase() + row.slice(1)}</span>
                                        {STAT_SHARDS[row].map(shard => (
                                            <button
                                                key={shard.id}
                                                title={shard.label}
                                                className={`shard-btn ${selectedShards[ri] === shard.id ? 'shard-selected' : ''}`}
                                                onClick={() => toggleShard(ri, shard.id)}
                                            >
                                                <span className="shard-dot" />
                                                <span className="shard-tooltip">{shard.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Info panel ── */}
                <div className="runes-info-col">
                    {/* Hover tooltip */}
                    <div className="rune-detail-card">
                        {hoveredRune ? (
                            <>
                                <div className="rune-detail-header">
                                    <img src={runeIcon(hoveredRune.icon)} alt={hoveredRune.name} className="rune-detail-icon" onError={(e: any) => { e.target.style.display = 'none'; }} />
                                    <h4 className="rune-detail-name">{hoveredRune.name}</h4>
                                </div>
                                <p className="rune-detail-short" dangerouslySetInnerHTML={{ __html: hoveredRune.shortDesc }} />
                                <p className="rune-detail-long" dangerouslySetInnerHTML={{ __html: hoveredRune.longDesc }} />
                            </>
                        ) : (
                            <p className="rune-hint">Hover a rune to see its description</p>
                        )}
                    </div>

                    {/* Selected rune chips */}
                    <div className="selected-runes-panel">
                        <h4 className="section-title">Selected Runes</h4>
                        {selectedRunes.length === 0 ? (
                            <p className="rune-hint">No runes selected yet</p>
                        ) : (
                            <div className="selected-rune-chips">
                                {selectedRunes.map(id => {
                                    // find rune in tree
                                    let rune: any = null;
                                    for (const tree of runeTree) {
                                        for (const slot of tree.slots) {
                                            const found = slot.runes.find((r: any) => r.id === id);
                                            if (found) { rune = found; break; }
                                        }
                                        if (rune) break;
                                    }
                                    if (!rune) return null;
                                    return (
                                        <div key={id} className="selected-rune-chip" title={rune.shortDesc}>
                                            <img src={runeIcon(rune.icon)} alt={rune.name} onError={(e: any) => { e.target.style.display = 'none'; }} />
                                            <span>{rune.name}</span>
                                            <button onClick={() => setSelectedRunes(selectedRunes.filter(r => r !== id))} className="chip-remove">✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Stat bonus summary */}
                    <div className="rune-stat-summary">
                        <h4 className="section-title">Rune Stat Bonuses</h4>
                        <div className="rune-stat-grid">
                            {runeStatSummary.ad > 0 && (
                                <div className="rune-stat-row">
                                    <span className="rune-stat-label">Attack Damage</span>
                                    <span className="rune-stat-value ad-value">+{runeStatSummary.ad}</span>
                                </div>
                            )}
                            {runeStatSummary.ap > 0 && (
                                <div className="rune-stat-row">
                                    <span className="rune-stat-label">Ability Power</span>
                                    <span className="rune-stat-value ap-value">+{runeStatSummary.ap}</span>
                                </div>
                            )}
                            {runeStatSummary.hp > 0 && (
                                <div className="rune-stat-row">
                                    <span className="rune-stat-label">Health</span>
                                    <span className="rune-stat-value hp-value">+{runeStatSummary.hp}</span>
                                </div>
                            )}
                            {runeStatSummary.ah > 0 && (
                                <div className="rune-stat-row">
                                    <span className="rune-stat-label">Ability Haste</span>
                                    <span className="rune-stat-value">+{runeStatSummary.ah}</span>
                                </div>
                            )}
                            {runeStatSummary.ms > 0 && (
                                <div className="rune-stat-row">
                                    <span className="rune-stat-label">Move Speed</span>
                                    <span className="rune-stat-value">+{runeStatSummary.ms}</span>
                                </div>
                            )}
                            {runeStatSummary.as > 0 && (
                                <div className="rune-stat-row">
                                    <span className="rune-stat-label">Attack Speed</span>
                                    <span className="rune-stat-value">+{(runeStatSummary.as * 100).toFixed(0)}%</span>
                                </div>
                            )}
                            {Object.values(runeStatSummary).every(v => v === 0) && (
                                <p className="rune-hint">Select runes to see stat bonuses</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunesView;
