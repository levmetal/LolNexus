import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import BuildCalculator from '../build/BuildCalculator';
import { useBuildStore } from '../build/useBuildStore';
import { calculateTotalStats } from '../build/StatEngine';
import { parseMerakiAbility, getMerakiPerRank } from '../build/DamageParser';
import './details.css';
import '../build/buildCalc.css';

interface ChampionsViewProps {
    championsData: any;
    selectedChamp: any;
    setSelectedChamp: (champ: any) => void;
}

const ChampionsView: React.FC<ChampionsViewProps> = ({
    championsData,
    selectedChamp,
    setSelectedChamp
}) => {
    const {
        level,
        equippedItems,
        selectedRunes,
        selectedShards,
        skillRanks
    } = useBuildStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('All');

    // Real-time stat calculations for Abilities Panel
    const calculatedStats = useMemo(() => {
        return calculateTotalStats(
            selectedChamp,
            level,
            equippedItems,
            selectedRunes,
            selectedShards
        );
    }, [selectedChamp, level, equippedItems, selectedRunes, selectedShards]);

    const championsList = useMemo(() => {
        if (!championsData) return [];
        return Object.values(championsData).filter((champ: any) => {
            const matchName = champ.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = selectedRole === 'All' || (champ.roles && champ.roles.some((r: string) => r.toUpperCase() === selectedRole.toUpperCase()));
            return matchName && matchRole;
        });
    }, [championsData, searchTerm, selectedRole]);

    const roles = ['All', 'Fighter', 'Tank', 'Mage', 'Assassin', 'Marksman', 'Support'];

    // Progressive loading — hooks MUST be before any conditional return
    const [visibleCount, setVisibleCount] = useState(30);
    const loadMoreRef = useRef<HTMLDivElement>(null);



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
                            src={selectedChamp.icon}
                            alt={selectedChamp.name}
                            className="detail-avatar-sm"
                        />
                        <div>
                            <h2 className="detail-name-sm">{selectedChamp.name}</h2>
                            <span className="detail-title-sm">{selectedChamp.title}</span>
                        </div>
                        <div className="champ-roles-sm">
                            {selectedChamp.roles?.map((tag: string) => (
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
                            {['P', 'Q', 'W', 'E', 'R'].map((key) => {
                                const abilityArray = selectedChamp.abilities?.[key];
                                if (!abilityArray || abilityArray.length === 0) return null;

                                const ability = abilityArray[0]; // Meraki puts main ability at index 0
                                const isPassive = key === 'P';

                                const skillKey = key.toLowerCase() as keyof typeof skillRanks;
                                const currentRank = isPassive ? 0 : skillRanks[skillKey] || 1;

                                const parsedHtml = parseMerakiAbility(ability.effects, calculatedStats, currentRank);
                                const perRankData = isPassive ? [] : getMerakiPerRank(ability.effects);

                                return (
                                    <div key={key} className="ability-card">
                                        <div className="ability-card-header">
                                            <div className="ability-icon-wrapper">
                                                <img
                                                    src={ability.icon}
                                                    alt={ability.name}
                                                    className="ability-icon"
                                                />
                                                <div className={`ability-key-badge key-${key.toLowerCase()}`}>
                                                    {key}
                                                </div>
                                            </div>
                                            <div className="ability-header-info">
                                                <h4 className="ability-card-name">{ability.name}</h4>
                                                {isPassive && <span className="passive-label-nexus">Passive Ability</span>}
                                            </div>
                                        </div>

                                        <div className="ability-content-box">
                                            <div
                                                className="ability-card-desc"
                                                dangerouslySetInnerHTML={{ __html: parsedHtml }}
                                            />

                                            {!isPassive && perRankData.some(d => d.values && d.values.length > 0) && (
                                                <div className="ability-leveltip">
                                                    <div className="leveltip-header">
                                                        <span className="leveltip-title">Dynamic Progression</span>
                                                    </div>
                                                    <div className="leveltip-grid">
                                                        {perRankData.filter(d => d.values && d.values.length > 0).map((item, i) => (
                                                            <div key={i} className="leveltip-item">
                                                                <span className="leveltip-label">{item.label}</span>
                                                                <div className="progression-values-wrapper">
                                                                    {item.values.map((v, vIdx) => (
                                                                        <React.Fragment key={vIdx}>
                                                                            <span className={`prog-val ${vIdx === currentRank - 1 ? 'active' : ''}`}>
                                                                                {v}
                                                                            </span>
                                                                            {vIdx < item.values.length - 1 && <span className="prog-sep"></span>}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    {/* RIGHT: Build Calculator */}
                    <div className="detail-right-col">
                        <BuildCalculator selectedChamp={selectedChamp} />
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
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            setVisibleCount(30);
                        }}
                        className="role-select"
                    >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search champions..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setVisibleCount(30);
                        }}
                    />
                </div>
            </header>

            <div className="grid-container">
                {visibleChampions.map((champ: any) => (
                    <div key={champ.key} className="champ-card" onClick={() => setSelectedChamp(champ)}>
                        <div className="card-image">
                            <img
                                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.key}_0.jpg`}
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
