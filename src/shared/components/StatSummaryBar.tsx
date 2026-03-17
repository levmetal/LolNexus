import React, { useMemo, useState } from 'react';
import { useBuildStore } from '../../features/build/useBuildStore';
import { calculateTotalStats } from '../../features/build/StatEngine';
import { useData } from '../context/DataContext';
import '../../shared/styles/summaryBar.css';

interface StatSummaryBarProps {
    selectedChamp?: any;
}

const StatSummaryBar: React.FC<StatSummaryBarProps> = ({ selectedChamp }) => {
    const {
        level,
        equippedItems,
        selectedRunes,
        selectedShards
    } = useBuildStore();

    const { runes: runeData, version } = useData();
    const [isExpanded, setIsExpanded] = useState(false);

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
        if (!selectedChamp) return { ad: 0, ap: 0, hp: 0, ah: 0, as: 0, ms: 0, armor: 0, mr: 0 };
        const results = calculateTotalStats(selectedChamp, level, equippedItems, selectedRunes, selectedShards);
        return {
            ad: Math.round(results.ad),
            ap: Math.round(results.ap),
            hp: Math.round(results.totalHP),
            ah: 0,
            as: results.as,
            ms: Math.round(results.ms),
            armor: Math.round(results.armor),
            mr: Math.round(results.mr)
        };
    }, [selectedChamp, level, equippedItems, selectedRunes, selectedShards]);

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
                                src={selectedChamp.icon || `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${selectedChamp.image?.full || selectedChamp.key + '.png'}`}
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
                    {stats.as > 0 && (
                        <div className="summary-stat-chip as">
                            <span className="stat-icon">🏹</span>
                            <span>{stats.as.toFixed(2)} <small>AS</small></span>
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
