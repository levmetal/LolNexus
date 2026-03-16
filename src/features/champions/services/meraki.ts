export interface MerakiChampion {
    id: number;
    key: string;
    name: string;
    title: string;
    icon: string;
    stats: {
        health: { flat: number, perLevel: number };
        mana: { flat: number, perLevel: number };
        armor: { flat: number, perLevel: number };
        magicResistance: { flat: number, perLevel: number };
        attackDamage: { flat: number, perLevel: number };
        attackSpeed: { flat: number, perLevel: number };
        movespeed: { flat: number };
    };
    roles: string[];
    abilities: {
        P: any[];
        Q: any[];
        W: any[];
        E: any[];
        R: any[];
    };
}

const MerakiAPI = {
    async getChampions(): Promise<Record<string, MerakiChampion>> {
        try {
            const res = await fetch('/meraki-api/riot/lol/resources/latest/en-US/champions.json');
            const data = await res.json();
            return data;
        } catch (e) {
            console.error('Failed to fetch Meraki champions data', e);
            throw e;
        }
    }
};

export default MerakiAPI;
