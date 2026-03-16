import { useState, useEffect } from 'react';
import { useBuildStore } from '../build/useBuildStore';
import './runes.css';

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

// Map rune IDs to estimated stat bonuses
export const RUNE_STAT_BONUSES: Record<string | number, { label: string; ad?: number; ap?: number; hp?: number; ah?: number; as?: number; ms?: number }> = {
    8008: { label: 'Lethal Tempo', as: 0.15 },
    8021: { label: 'Fleet Footwork', ms: 15 },
    8010: { label: 'Conqueror', ad: 15 },
    9923: { label: 'Hail of Blades', as: 0.60 },
    8112: { label: 'Electrocute', ad: 20 },
    8124: { label: 'Predator', ms: 45 },
    8128: { label: 'Dark Harvest', ad: 10 },
    8214: { label: 'Arcane Comet', ap: 15 },
    8229: { label: 'Phase Rush', ms: 25 },
    8230: { label: 'Unsealed Spellbook', ah: 10 },
    8437: { label: 'Grasp of the Undying', hp: 30 },
    8439: { label: 'Aftershock', hp: 50 },
    8465: { label: 'Guardian', hp: 0 },
    8351: { label: 'Glacial Augment', ms: 0 },
    8360: { label: 'Unseal Spellbook 2', ah: 10 },
    8369: { label: 'First Strike', ad: 10 },
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
const runeIcon = (icon: string) => `https://ddragon.leagueoflegends.com/cdn/img/${icon}`;

const RunesView: React.FC = () => {
    const {
        selectedRunes,
        setSelectedRunes,
        selectedShards,
        setSelectedShards
    } = useBuildStore();

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

    const toggleRune = (runeId: number, rowIdx: number, treeIdx: number) => {
        const nextRunes = selectedRunes.filter(id => {
            for (let ti = 0; ti < runeTree.length; ti++) {
                if (ti !== treeIdx) continue;
                for (let ri = 0; ri < runeTree[ti].slots.length; ri++) {
                    if (ri !== rowIdx) continue;
                    if (runeTree[ti].slots[ri].runes.some((r: any) => r.id === id)) return false;
                }
            }
            return true;
        });

        if (!selectedRunes.includes(runeId)) {
            nextRunes.push(runeId);
        }
        setSelectedRunes(nextRunes);
    };

    const toggleShard = (shardId: string, rowIdx: number) => {
        const nextShards = [...selectedShards];
        nextShards[rowIdx] = nextShards[rowIdx] === shardId ? '' : shardId;
        setSelectedShards(nextShards);
    };

    const primaryData = runeTree[primaryTree];
    const secondaryData = runeTree[secondaryTree];

    if (loading) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <p className="loading-text">Summoning Runes...</p>
        </div>
    );

    return (
        <div className="runes-page fade-in">
            <header className="view-header">
                <h2>Rune Configuration</h2>
                <button className="rune-clear-btn" onClick={() => { setSelectedRunes([]); setSelectedShards(['', '', '']); }}>
                    Reset Runes
                </button>
            </header>

            <div className="runes-layout">
                <main className="runes-left-col">
                    <div className="tree-selector-row">
                        <div className="tree-select-group">
                            <span className="picker-label">Primary Path</span>
                            <div className="tree-icon-row">
                                {runeTree.map((tree, idx) => (
                                    <button
                                        key={tree.id}
                                        className={`tree-icon-btn ${primaryTree === idx ? 'active-primary' : ''} ${secondaryTree === idx ? 'disabled-tree' : ''}`}
                                        onClick={() => { setPrimaryTree(idx); setSelectedRunes([]); if (secondaryTree === idx) setSecondaryTree((idx + 1) % runeTree.length); }}
                                        disabled={secondaryTree === idx}
                                    >
                                        <img src={runeIcon(tree.icon)} alt={tree.name} title={tree.name} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="tree-select-group">
                            <span className="picker-label">Secondary Path</span>
                            <div className="tree-icon-row">
                                {runeTree.map((tree, idx) => (
                                    <button
                                        key={tree.id}
                                        className={`tree-icon-btn ${secondaryTree === idx ? 'active-secondary' : ''} ${primaryTree === idx ? 'disabled-tree' : ''}`}
                                        onClick={() => setSecondaryTree(idx)}
                                        disabled={primaryTree === idx}
                                    >
                                        <img src={runeIcon(tree.icon)} alt={tree.name} title={tree.name} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rune-trees-container">
                        <div className="rune-tree-panel primary-panel">
                            {primaryData && (
                                <>
                                    <div className="rune-tree-label">
                                        <img src={runeIcon(primaryData.icon)} alt="" className="tree-label-icon" />
                                        <span>{primaryData.name} Path</span>
                                    </div>
                                    {primaryData.slots.map((slot: any, ri: number) => (
                                        <div key={ri} className={`rune-row ${ri === 0 ? 'keystone-row' : ''}`}>
                                            {slot.runes.map((rune: any) => (
                                                <button
                                                    key={rune.id}
                                                    className={`rune-btn ${ri === 0 ? 'keystone-btn' : ''} ${selectedRunes.includes(rune.id) ? 'rune-selected' : ''}`}
                                                    onClick={() => toggleRune(rune.id, ri, primaryTree)}
                                                    onMouseEnter={() => setHoveredRune(rune)}
                                                    onMouseLeave={() => setHoveredRune(null)}
                                                >
                                                    <img src={runeIcon(rune.icon)} alt={rune.name} />
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="secondary-and-shards">
                            <div className="rune-tree-panel secondary-panel">
                                {secondaryData && (
                                    <>
                                        <div className="rune-tree-label">
                                            <img src={runeIcon(secondaryData.icon)} alt="" className="tree-label-icon" />
                                            <span>{secondaryData.name} Secondary</span>
                                        </div>
                                        {secondaryData.slots.slice(1).map((slot: any, ri: number) => (
                                            <div key={ri} className="rune-row secondary-rune-row">
                                                {slot.runes.map((rune: any) => (
                                                    <button
                                                        key={rune.id}
                                                        className={`rune-btn ${selectedRunes.includes(rune.id) ? 'rune-selected-secondary' : ''}`}
                                                        onClick={() => toggleRune(rune.id, ri + 1, secondaryTree)}
                                                        onMouseEnter={() => setHoveredRune(rune)}
                                                        onMouseLeave={() => setHoveredRune(null)}
                                                    >
                                                        <img src={runeIcon(rune.icon)} alt={rune.name} />
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="rune-tree-panel shard-panel">
                                <span className="picker-label" style={{ marginBottom: '1rem' }}>Stat Shards</span>
                                {(['offense', 'flex', 'defense'] as const).map((row, rowIdx) => (
                                    <div key={row} className="rune-row shard-row">
                                        <span className="shard-row-label">{row}</span>
                                        {STAT_SHARDS[row].map(shard => (
                                            <button
                                                key={shard.id}
                                                className={`shard-btn ${selectedShards[rowIdx] === shard.id ? 'shard-selected' : ''}`}
                                                onClick={() => toggleShard(shard.id, rowIdx)}
                                            >
                                                <div className={`shard-dot ${shard.id.replace(/\d/, '')}`} />
                                                <span className="shard-tooltip">{shard.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                <aside className="runes-info-col">
                    <div className="rune-detail-card">
                        {hoveredRune ? (
                            <div className="rune-detail-content fade-in">
                                <header className="rune-detail-header">
                                    <img src={runeIcon(hoveredRune.icon)} alt="" className="rune-detail-icon" />
                                    <h4 className="rune-detail-name">{hoveredRune.name}</h4>
                                </header>
                                <p className="rune-detail-short" dangerouslySetInnerHTML={{ __html: hoveredRune.shortDesc }} />
                                <div className="rune-detail-long" dangerouslySetInnerHTML={{ __html: hoveredRune.longDesc }} />
                            </div>
                        ) : (
                            <p className="rune-hint">Hover over a rune to reveal its powers</p>
                        )}
                    </div>

                    {selectedRunes.length > 0 && (
                        <div className="selected-runes-panel fade-in">
                            <span className="picker-label">Selected Fragments</span>
                            <div className="selected-rune-chips">
                                {selectedRunes.map(rid => {
                                    let rName = "Rune";
                                    let rIcon = "";
                                    runeTree.forEach(t => t.slots.forEach((s: any) => s.runes.forEach((r: any) => {
                                        if (r.id === rid) { rName = r.name; rIcon = r.icon; }
                                    })));
                                    return (
                                        <div key={rid} className="selected-rune-chip">
                                            <img src={runeIcon(rIcon)} alt="" />
                                            <span>{rName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default RunesView;
