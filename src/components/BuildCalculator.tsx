import React, { useState, useMemo } from 'react';
import { MOCK_ITEMS } from '../../mockItems';

interface BuildCalculatorProps {
    selectedChamp: any;
    level: number;
    setLevel: (level: number) => void;
    equippedItems: string[];
    setEquippedItems: (items: string[]) => void;
}

const BuildCalculator: React.FC<BuildCalculatorProps> = ({
    selectedChamp,
    level,
    setLevel,
    equippedItems,
    setEquippedItems
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

        // Add per-level scaling (simplified formula for base game stats scaling)
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

            ap: Math.round(bonusAP), // AP is always bonus, base is 0

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
            lifesteal: Math.round(bonusLifeSteal * 100),

            baseMS: Math.round(stats.movespeed),
            bonusMS: Math.round(totalMS - stats.movespeed),
            totalMS: Math.round(totalMS),
        };
    }, [selectedChamp, level, equippedItems]);

    // Format helper for rendering stats
    const StatValue = ({ total, bonus }: { total: string | number, bonus: number }) => {
        if (bonus > 0) {
            return (
                <strong className="stat-highlight">
                    {total} <span className="stat-bonus">(+{typeof bonus === 'number' && bonus % 1 !== 0 ? bonus.toFixed(2) : bonus})</span>
                </strong>
            );
        }
        return <strong>{total}</strong>;
    };

    return (
        <div className="build-calculator">
            <h3>Build Calculator & Real-Time Stats</h3>

            <div className="level-slider-container">
                <label>Champion Level: {level}</label>
                <input
                    type="range"
                    min="1"
                    max="18"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="level-slider"
                />
            </div>

            <div className="calc-layout">
                {/* LEFT COLUMN: Stats & Hover Details */}
                <div className="calc-column">
                    <div className="stats-panel active-stats">
                        <h4>Calculated Stats (Level {level})</h4>
                        <div className="stat-row"><span>HP:</span> <StatValue total={calculatedStats.totalHP} bonus={calculatedStats.bonusHP} /></div>
                        <div className="stat-row"><span>Attack Damage:</span> <StatValue total={calculatedStats.totalAD} bonus={calculatedStats.bonusAD} /></div>
                        <div className="stat-row"><span>Ability Power:</span> <StatValue total={calculatedStats.ap} bonus={calculatedStats.ap} /></div>
                        <div className="stat-row"><span>Armor:</span> <StatValue total={calculatedStats.totalArmor} bonus={calculatedStats.bonusArmor} /></div>
                        <div className="stat-row"><span>Magic Resist:</span> <StatValue total={calculatedStats.totalMR} bonus={calculatedStats.bonusMR} /></div>
                        <div className="stat-row"><span>Attack Speed:</span> <StatValue total={calculatedStats.totalAS} bonus={calculatedStats.bonusAS} /></div>
                        <div className="stat-row"><span>Crit Chance:</span> <StatValue total={`${calculatedStats.crit}%`} bonus={calculatedStats.crit} /></div>
                        <div className="stat-row"><span>Life Steal:</span> <StatValue total={`${calculatedStats.lifesteal}%`} bonus={calculatedStats.lifesteal} /></div>
                        <div className="stat-row"><span>Move Speed:</span> <StatValue total={calculatedStats.totalMS} bonus={calculatedStats.bonusMS} /></div>
                    </div>

                    <div className="item-details-panel">
                        {hoveredItem ? (
                            <>
                                <div className="item-details-header">
                                    <img src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${hoveredItem.id}.png`} alt={hoveredItem.name} />
                                    <div>
                                        <h4>{hoveredItem.name}</h4>
                                        <span className="item-price">{hoveredItem.gold.total}G</span>
                                    </div>
                                </div>
                                <div className="item-description" dangerouslySetInnerHTML={{ __html: hoveredItem.description }} />
                            </>
                        ) : (
                            <p className="empty-text">Hover over any item in your catalog or inventory to see its passive effects and stats.</p>
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
                                            src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${equippedItems[idx]}.png`}
                                            alt="Equipped"
                                            className="equipped-item"
                                            onMouseEnter={() => setHoveredItem(MOCK_ITEMS[equippedItems[idx]])}
                                            onMouseLeave={() => setHoveredItem(null)}
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
                                        src={`https://ddragon.leagueoflegends.com/cdn/14.4.1/img/item/${item.id}.png`}
                                        alt={item.name}
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
