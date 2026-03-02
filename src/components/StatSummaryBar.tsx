import React, { useMemo } from 'react';
import { RUNE_STAT_BONUSES } from '../pages/RunesView';
import { MOCK_ITEMS } from '../../mockItems';
import '../summaryBar.css';

interface StatSummaryBarProps {
    selectedRunes: number[];
    selectedShards: string[];
    selectedChamp?: any;
    equippedItems?: string[];
}

const StatSummaryBar: React.FC<StatSummaryBarProps> = ({
    selectedRunes,
    selectedShards,
    selectedChamp,
    equippedItems = []
}) => {
    const [runeData, setRuneData] = React.useState<any[]>([]);
    const [isExpanded, setIsExpanded] = React.useState(false);

    React.useEffect(() => {
        fetch(`https://ddragon.leagueoflegends.com/cdn/15.4.1/data/en_US/runesReforged.json`)
            .then(r => r.json())
            .then(data => setRuneData(data))
            .catch(() => { });
    }, []);

    // Find rune details from ID
    const getRuneDetails = (id: number) => {
        for (const tree of runeData) {
            for (const slot of tree.slots) {
                const found = slot.runes.find((r: any) => r.id === id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedRuneDetails = useMemo(() => {
        return selectedRunes.map(id => getRuneDetails(id)).filter(Boolean);
    }, [selectedRunes, runeData]);

    const stats = useMemo(() => {
        const totals = { ad: 0, ap: 0, hp: 0, ah: 0, as: 0, ms: 0, armor: 0, mr: 0 };

        // Rune & Shard Bonuses
        [...selectedRunes].forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (b) {
                totals.ad += b.ad ?? 0;
                totals.ap += b.ap ?? 0;
                totals.hp += b.hp ?? 0;
                totals.ah += b.ah ?? 0;
                totals.as += b.as ?? 0;
                totals.ms += b.ms ?? 0;
                // Runes might have armor/mr too if updated in the map
            }
        });

        selectedShards.forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (b) {
                totals.ad += b.ad ?? 0;
                totals.ap += b.ap ?? 0;
                totals.hp += b.hp ?? 0;
                totals.ah += b.ah ?? 0;
                totals.as += b.as ?? 0;
                totals.ms += b.ms ?? 0;
            }
        });

        // Item Bonuses
        equippedItems.forEach(itemId => {
            const item: any = MOCK_ITEMS[itemId];
            if (item && item.stats) {
                if (item.stats.FlatPhysicalDamageMod) totals.ad += item.stats.FlatPhysicalDamageMod;
                if (item.stats.FlatMagicDamageMod) totals.ap += item.stats.FlatMagicDamageMod;
                if (item.stats.FlatHPPoolMod) totals.hp += item.stats.FlatHPPoolMod;
                if (item.stats.FlatArmorMod) totals.armor += item.stats.FlatArmorMod;
                if (item.stats.FlatSpellBlockMod) totals.mr += item.stats.FlatSpellBlockMod;
            }
        });

        return totals;
    }, [selectedRunes, selectedShards, equippedItems]);

    const hasSelection = selectedRunes.length > 0 || selectedShards.some(s => s) || selectedChamp;

    if (!hasSelection) return null;

    return (
        <div className={`stat-summary-bar fade-in-up ${isExpanded ? 'expanded' : ''}`}>
            {isExpanded && selectedRuneDetails.length > 0 && (
                <div className="rune-descriptions-overlay">
                    <h5 className="overlay-title">Rune Effects</h5>
                    <ul className="rune-desc-list">
                        {selectedRuneDetails.map((rune: any) => (
                            <li key={rune.id} className="rune-desc-item">
                                <img src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} alt="" className="desc-icon" />
                                <div className="desc-text">
                                    <span className="desc-name">{rune.name}:</span>
                                    <span className="desc-short" dangerouslySetInnerHTML={{ __html: rune.shortDesc }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="summary-content">
                <div className="summary-info" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
                    {selectedChamp ? (
                        <div className="summary-champ">
                            <img
                                src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/champion/${selectedChamp.image.full}`}
                                alt={selectedChamp.name}
                                className="summary-avatar"
                            />
                            <span className="summary-label">{selectedChamp.name} Build</span>
                        </div>
                    ) : (
                        <span className="summary-label">Active Stats</span>
                    )}
                    <span className={`expand-arrow ${isExpanded ? 'up' : 'down'}`}>▴</span>
                </div>

                <div className="summary-stats">
                    {stats.ad > 0 && (
                        <div className="summary-stat-chip ad">
                            <span className="stat-icon">⚔️</span>
                            <span>{stats.ad} <small>AD</small></span>
                        </div>
                    )}
                    {stats.ap > 0 && (
                        <div className="summary-stat-chip ap">
                            <span className="stat-icon">🔮</span>
                            <span>{stats.ap} <small>AP</small></span>
                        </div>
                    )}
                    {stats.hp > 0 && (
                        <div className="summary-stat-chip hp">
                            <span className="stat-icon">❤️</span>
                            <span>{stats.hp} <small>HP</small></span>
                        </div>
                    )}
                    {(stats.armor > 0 || stats.mr > 0) && (
                        <div className="summary-stat-chip defense">
                            <span className="stat-icon">🛡️</span>
                            <span>{stats.armor}<small>AR</small> / {stats.mr}<small>MR</small></span>
                        </div>
                    )}
                    {stats.ah > 0 && (
                        <div className="summary-stat-chip ah">
                            <span className="stat-icon">⏱️</span>
                            <span>{stats.ah} <small>AH</small></span>
                        </div>
                    )}
                    {stats.as > 0 && (
                        <div className="summary-stat-chip as">
                            <span className="stat-icon">🏹</span>
                            <span>{Math.round(stats.as * 100)}% <small>AS</small></span>
                        </div>
                    )}
                    {stats.ms > 0 && (
                        <div className="summary-stat-chip ms">
                            <span className="stat-icon">👟</span>
                            <span>{stats.ms} <small>MS</small></span>
                        </div>
                    )}
                </div>

                <div className="summary-badges" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
                    <div className="summary-runes-visual">
                        {selectedRuneDetails.map((rune: any) => (
                            <img key={rune.id} src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`} alt="rune" className="summary-rune-icon" />
                        ))}
                        {selectedShards.filter(s => s).map((s, i) => (
                            <div key={i} className={`summary-shard-dot ${s}`} title={s}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatSummaryBar;
