import React, { useState, useMemo } from 'react';
import { MOCK_ITEMS } from '../../mockItems';
import { RUNE_STAT_BONUSES } from '../pages/RunesView';

const DDRAGON_VERSIONS = ['15.4.1', '14.23.1', '14.4.1'];
const itemImgUrl = (id: string, ver = DDRAGON_VERSIONS[0]) =>
    `https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png`;

interface BuildCalculatorProps {
    selectedChamp: any;
    level: number;
    setLevel: (level: number) => void;
    equippedItems: string[];
    setEquippedItems: (items: string[]) => void;
    selectedRunes: number[];
    selectedShards: string[];
}

const BuildCalculator: React.FC<BuildCalculatorProps> = ({
    selectedChamp,
    level,
    setLevel,
    equippedItems,
    setEquippedItems,
    selectedRunes,
    selectedShards
}) => {
    const [searchItem, setSearchItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [hoveredItem, setHoveredItem] = useState<any>(null);

    // Item catalog as array - exclude unpurchasable and broken Quest items
    const itemsArray = useMemo(() => {
        return Object.values(MOCK_ITEMS).filter((item: any) =>
            item.inStore && !item.name.startsWith('Quest:') && !item.name.startsWith('Showdown')
        );
    }, []);

    const categories = ['All', 'Damage', 'Magic', 'Tank', 'Support'];

    const filteredItems = useMemo(() => {
        return itemsArray.filter((item: any) => {
            const matchName = item.name.toLowerCase().includes(searchItem.toLowerCase());
            let matchCat = true;
            if (selectedCategory === 'Damage') {
                matchCat = item.tags?.includes('Damage') || item.tags?.includes('CriticalStrike') || item.tags?.includes('AttackSpeed') || item.tags?.includes('ArmorPenetration');
            } else if (selectedCategory === 'Magic') {
                matchCat = item.tags?.includes('SpellDamage') || item.tags?.includes('Mana') || item.tags?.includes('MagicPenetration');
            } else if (selectedCategory === 'Tank') {
                matchCat = item.tags?.includes('Health') || item.tags?.includes('Armor') || item.tags?.includes('SpellBlock');
            } else if (selectedCategory === 'Support') {
                matchCat = item.tags?.includes('HealthRegen') || item.tags?.includes('ManaRegen') || item.tags?.includes('Active');
            }
            return matchName && matchCat;
        });
    }, [searchItem, selectedCategory, itemsArray]);

    const equipItem = (itemId: string) => {
        if (equippedItems.length < 6) {
            setEquippedItems([...equippedItems, itemId]);
        }
    };

    const removeEquippedItem = (index: number) => {
        const nextItems = [...equippedItems];
        nextItems.splice(index, 1);
        setEquippedItems(nextItems);
    };

    // Real-time stat calculations
    const calculatedStats = useMemo(() => {
        const stats = { ...selectedChamp.stats };

        // Add per-level scaling
        const levelMultiplier = level - 1;
        let effectiveHP = stats.hp + (stats.hpperlevel * levelMultiplier);
        let effectiveAD = stats.attackdamage + (stats.attackdamageperlevel * levelMultiplier);
        let effectiveArmor = stats.armor + (stats.armorperlevel * levelMultiplier);
        let effectiveMR = stats.spellblock + (stats.spellblockperlevel * levelMultiplier);

        let bonusAD = 0;
        let bonusAP = 0;
        let bonusHP = 0;
        let bonusArmor = 0;
        let bonusMR = 0;

        let bonusAS = 0;
        let bonusCrit = 0;
        let bonusLifeSteal = 0;
        let bonusFlatMS = 0;
        let bonusPercentMS = 0;

        // Sum item stats
        equippedItems.forEach(itemId => {
            const item: any = MOCK_ITEMS[itemId];
            if (item && item.stats) {
                if (item.stats.FlatPhysicalDamageMod) bonusAD += item.stats.FlatPhysicalDamageMod;
                if (item.stats.FlatMagicDamageMod) bonusAP += item.stats.FlatMagicDamageMod;
                if (item.stats.FlatHPPoolMod) bonusHP += item.stats.FlatHPPoolMod;
                if (item.stats.FlatArmorMod) bonusArmor += item.stats.FlatArmorMod;
                if (item.stats.FlatSpellBlockMod) bonusMR += item.stats.FlatSpellBlockMod;

                if (item.stats.PercentAttackSpeedMod) bonusAS += item.stats.PercentAttackSpeedMod;
                if (item.stats.FlatCritChanceMod) bonusCrit += item.stats.FlatCritChanceMod;
                if (item.stats.PercentLifeStealMod) bonusLifeSteal += item.stats.PercentLifeStealMod;
                if (item.stats.FlatMovementSpeedMod) bonusFlatMS += item.stats.FlatMovementSpeedMod;
                if (item.stats.PercentMovementSpeedMod) bonusPercentMS += item.stats.PercentMovementSpeedMod;
            }
        });

        // Add Rune & Shard Bonuses
        selectedRunes.forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (!b) return;
            bonusAD += b.ad ?? 0;
            bonusAP += b.ap ?? 0;
            bonusHP += b.hp ?? 0;
            bonusAS += b.as ?? 0;
            bonusFlatMS += b.ms ?? 0;
        });

        selectedShards.forEach(id => {
            const b = RUNE_STAT_BONUSES[id];
            if (!b) return;
            bonusAD += b.ad ?? 0;
            bonusAP += b.ap ?? 0;
            bonusHP += b.hp ?? 0;
            bonusAS += b.as ?? 0;
            bonusFlatMS += b.ms ?? 0;
        });

        // Advanced math
        const baseAS = stats.attackspeed || 0.625;
        const totalAS = baseAS * (1 + bonusAS + ((stats.attackspeedperlevel || 0) / 100 * levelMultiplier));
        const totalMS = (stats.movespeed + bonusFlatMS) * (1 + bonusPercentMS);

        return {
            baseHP: Math.round(effectiveHP),
            bonusHP: Math.round(bonusHP),
            totalHP: Math.round(effectiveHP + bonusHP),

            baseAD: Math.round(effectiveAD),
            bonusAD: Math.round(bonusAD),
            totalAD: Math.round(effectiveAD + bonusAD),

            ap: Math.round(bonusAP),

            baseArmor: Math.round(effectiveArmor),
            bonusArmor: Math.round(bonusArmor),
            totalArmor: Math.round(effectiveArmor + bonusArmor),

            baseMR: Math.round(effectiveMR),
            bonusMR: Math.round(bonusMR),
            totalMR: Math.round(effectiveMR + bonusMR),

            baseAS: baseAS.toFixed(2),
            bonusAS: bonusAS,
            totalAS: totalAS.toFixed(2),

            crit: Math.min(Math.round(bonusCrit * 100), 100),
            bonusCrit: Math.round(bonusCrit * 100),

            bonusMS: Math.round(totalMS - stats.movespeed),
            totalMS: Math.round(totalMS),
        };
    }, [selectedChamp, level, equippedItems, selectedRunes, selectedShards]);

    // Format helper for rendering stats
    const StatValue = ({ total, bonus }: { total: string | number, bonus: number }) => {
        return (
            <span className="stat-value">
                {total}
                {bonus !== 0 && (
                    <span className={`stat-bonus ${bonus > 0 ? 'pos' : 'neg'}`}>
                        ({bonus > 0 ? '+' : ''}{bonus})
                    </span>
                )}
            </span>
        );
    };

    return (
        <div className="build-calculator">
            <div className="calc-layout">
                {/* LEFT COLUMN: Stats & Level */}
                <div className="calc-column">
                    <div className="level-control">
                        <span>Level:</span>
                        <input
                            type="range"
                            min="1"
                            max="18"
                            value={level}
                            onChange={(e) => setLevel(parseInt(e.target.value))}
                        />
                        <span className="level-badge">{level}</span>
                    </div>

                    <div className="stats-panel">
                        <div className="stat-grid">
                            <div className="stat-row"><span>Health:</span> <StatValue total={calculatedStats.totalHP} bonus={calculatedStats.bonusHP} /></div>
                            <div className="stat-row"><span>Attack Damage:</span> <StatValue total={calculatedStats.totalAD} bonus={calculatedStats.bonusAD} /></div>
                            <div className="stat-row"><span>Ability Power:</span> <StatValue total={calculatedStats.ap} bonus={calculatedStats.ap} /></div>
                            <div className="stat-row"><span>Armor:</span> <StatValue total={calculatedStats.totalArmor} bonus={calculatedStats.bonusArmor} /></div>
                            <div className="stat-row"><span>Magic Resist:</span> <StatValue total={calculatedStats.totalMR} bonus={calculatedStats.bonusMR} /></div>
                            <div className="stat-row"><span>Attack Speed:</span> <StatValue total={calculatedStats.totalAS} bonus={calculatedStats.bonusAS} /></div>
                            <div className="stat-row"><span>Crit Chance:</span> <StatValue total={`${calculatedStats.crit}%`} bonus={calculatedStats.bonusCrit} /></div>
                            <div className="stat-row"><span>Move Speed:</span> <StatValue total={calculatedStats.totalMS} bonus={calculatedStats.bonusMS} /></div>
                        </div>
                    </div>

                    {/* RUNE SUMMARY SECTION */}
                    <div className="rune-summary-box">
                        <h5>Active Runes</h5>
                        <div className="rune-mini-icons">
                            {selectedRunes.map(id => (
                                <div key={id} className="rune-mini-dot" title={RUNE_STAT_BONUSES[id]?.label || 'Rune'} />
                            ))}
                            {selectedShards.filter(s => s).map(id => (
                                <div key={id} className="shard-mini-dot" title={RUNE_STAT_BONUSES[id]?.label || 'Shard'} />
                            ))}
                            {selectedRunes.length === 0 && selectedShards.every(s => !s) && (
                                <span className="no-runes-msg">No runes selected</span>
                            )}
                        </div>
                    </div>

                    <div className="item-details-panel">
                        {hoveredItem ? (
                            <>
                                <div className="item-details-header">
                                    <img src={itemImgUrl(hoveredItem.id)} alt={hoveredItem.name} />
                                    <div>
                                        <h4>{hoveredItem.name}</h4>
                                        <span className="item-price">{hoveredItem.gold.total}g</span>
                                    </div>
                                </div>
                                <div className="item-description" dangerouslySetInnerHTML={{ __html: hoveredItem.description }} />
                            </>
                        ) : (
                            <p className="item-hint">Hover an item to see details</p>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Inventory & Catalog */}
                <div className="calc-column">
                    <div className="inventory-panel">
                        <h4>Equipped Items</h4>
                        <div className="inventory-slots">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="inventory-slot" onClick={() => removeEquippedItem(idx)}>
                                    {equippedItems[idx] && MOCK_ITEMS[equippedItems[idx]] ? (
                                        <img
                                            src={itemImgUrl(equippedItems[idx])}
                                            alt="Equipped"
                                            className="equipped-item"
                                            onMouseEnter={() => setHoveredItem(MOCK_ITEMS[equippedItems[idx]])}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            onError={(e: any) => {
                                                const t = e.target;
                                                if (t.dataset.retry === '1') {
                                                    t.dataset.retry = '2';
                                                    t.src = itemImgUrl(equippedItems[idx], DDRAGON_VERSIONS[1]);
                                                } else if (t.dataset.retry === '2') {
                                                    t.style.display = 'none';
                                                } else {
                                                    t.dataset.retry = '1';
                                                    t.src = itemImgUrl(equippedItems[idx], DDRAGON_VERSIONS[2]);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="empty-slot">+</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="item-catalog">
                        <div className="catalog-header">
                            <h4>Item Catalog</h4>
                            <div className="catalog-filters">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchItem}
                            onChange={(e) => setSearchItem(e.target.value)}
                            className="search-input calc-search"
                        />
                        <div className="item-grid calc-grid-scroll">
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    className="catalog-item"
                                    onClick={() => equipItem(item.id)}
                                    onMouseEnter={() => setHoveredItem(item)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <img
                                        src={itemImgUrl(item.id)}
                                        alt={item.name}
                                        loading="lazy"
                                        onError={(e: any) => {
                                            const t = e.target;
                                            if (t.dataset.retry === '1') {
                                                t.dataset.retry = '2';
                                                t.src = itemImgUrl(item.id, DDRAGON_VERSIONS[1]);
                                            } else if (t.dataset.retry === '2') {
                                                t.style.opacity = '0.3';
                                                t.style.filter = 'grayscale(1)';
                                                t.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect fill="%23222" width="48" height="48" rx="6"/><text x="24" y="28" text-anchor="middle" fill="%23666" font-size="10">?</text></svg>')}`;
                                            } else {
                                                t.dataset.retry = '1';
                                                t.src = itemImgUrl(item.id, DDRAGON_VERSIONS[2]);
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildCalculator;
