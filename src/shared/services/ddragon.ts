// Service to fetch Data Dragon data from Riot Games
const DDragon = {
    version: '14.4.1', // Will be dynamically updated

    async getLatestVersion() {
        try {
            const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
            const versions = await res.json();
            this.version = versions[0];
            return versions[0];
        } catch (e) {
            console.error('Failed to get latest ddragon version', e);
            return this.version; // Fallback
        }
    },

    async getChampions() {
        const version = await this.getLatestVersion();
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/championFull.json`);
        const data = await res.json();
        return data.data; // Dictionary of champions
    },

    async getRunes() {
        const version = await this.getLatestVersion();
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`);
        const data = await res.json();
        return data; // Array of rune trees
    }
};

export default DDragon;
