const fs = require('fs');
const https = require('https');

https.get('https://ddragon.leagueoflegends.com/cdn/16.4.1/data/en_US/item.json', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            const items = parsedData.data;
            let validItemsCount = 0;

            let tsCode = `import type { Item } from '../types';\n\n// Comprehensive item data for League of Legends (Patch 16.4.1)\nexport const MOCK_ITEMS: { [key: string]: Item } = {\n`;

            for (const [id, item] of Object.entries(items)) {
                // Summoner's Rift map id is typically 11. We can filter for things that exist on 11.
                if (item.maps && item.maps["11"] === false) continue;
                // Exclude some internal or unpurchasable items to keep it clean, if you want.
                // Or just keep all data. Let's keep everything purchasable on SR plus some standard rules.

                let mapsStr = JSON.stringify(item.maps || { "11": true });
                let tagsStr = JSON.stringify(item.tags || []);
                let intoStr = item.into ? JSON.stringify(item.into) : "undefined";
                let fromStr = item.from ? JSON.stringify(item.from) : "undefined";
                let statsStr = JSON.stringify(item.stats || {});
                let imageStr = JSON.stringify(item.image || {});
                let goldStr = JSON.stringify(item.gold || {});

                let desc = (item.description || '').replace(/'/g, "\\'").replace(/\n/g, "");
                let plain = (item.plaintext || '').replace(/'/g, "\\'").replace(/\n/g, "");
                let name = (item.name || '').replace(/'/g, "\\'");

                tsCode += `  '${id}': {
    id: '${id}',
    name: '${name}',
    description: '${desc}',
    plaintext: '${plain}',
`;
                if (item.into) tsCode += `    into: ${intoStr},\n`;
                if (item.from) tsCode += `    from: ${fromStr},\n`;
                if (item.depth) tsCode += `    depth: ${item.depth},\n`;

                tsCode += `    image: ${imageStr},
    gold: ${goldStr},
    tags: ${tagsStr},
    stats: ${statsStr},
    inStore: ${item.inStore === false ? 'false' : 'true'},
    maps: ${mapsStr},
  },
`;
                validItemsCount++;
            }

            tsCode += `};\n`;
            fs.writeFileSync('c:/Users/Pc/Desktop/mockItems.ts', tsCode, 'utf8');
            console.log("Successfully generated mockItems.ts with " + validItemsCount + " items.");
        } catch (e) {
            console.error("Error parsing JSON", e);
        }
    });
}).on('error', (e) => {
    console.error("Got error: " + e.message);
});
