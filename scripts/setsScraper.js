const puppeteer = require ('puppeteer');
const writeFile = require('node:fs/promises').writeFile;
const path = require('node:path');

// --- CONFIGURACIÓN ---
const URL_BASE = "https://www.pikalytics.com/pokedex/gen9vgc2026regf/";
const CANTIDAD_POKEMON = 100; 
const RUTA_SALIDA = path.join('..', 'backend', 'data', 'competitive_sets.json'); 

async function runFullScraper() {
    const browser = await puppeteer.launch({
    });

    try {
        // Usage
        const pageList = await browser.newPage();
        await pageList.setViewport({ width: 1920, height: 1080 });

        await pageList.goto(URL_BASE);
        await pageList.waitForSelector("span.pokemon-name");
        
        let scrollCont = 0;
        await pageList.mouse.move(0, 500);
        while (scrollCont < 27) {
            await pageList.mouse.wheel({ deltaY: 3 * CANTIDAD_POKEMON });
            scrollCont += 1;
        }

        const pickList = await pageList.evaluate((listSize) => {
            const results = [];
            const pkmns = document.querySelectorAll("#min_list > a");
            for (let i = 0; i < pkmns.length; i++) {
                if (i > listSize - 1) break;
                const pkm = pkmns[i];
                const divInfo = pkm.querySelectorAll("a > div");
                const spanInfo = pkm.querySelectorAll("a > span");

                const name = divInfo[1].innerText.trim();
                const probability = spanInfo[0].innerText.trim();

                if (probability < "0.01%") break;
                if (name && probability) {
                    results.push({ name, usage: probability });
                }
            }
            return results;
        }, CANTIDAD_POKEMON);

        await pageList.close();
        console.log("Lista de uso obtenida:", pickList);

        // Sets
        const finalData = [];

        for (const pkm of pickList) {
            console.log(`Obteniendo: ${pkm.name}...`);
            const pokemonFormatted = encodeURIComponent(pkm.name);
            const urlSet = URL_BASE + pokemonFormatted;

            const pageSet = await browser.newPage();
            await pageSet.setViewport({ width: 1920, height: 1080 });
            await pageSet.goto(urlSet);
            if (pageSet.url() !== urlSet) {
                console.warn(`${pkm.name} no tiene página.`);
                await pageSet.close();
                continue;
            }

            const setDetails = await pageSet.evaluate(() => {
                const data = {
                    moves: {},
                    teammates: {},
                    items: {},
                    ability: {},
                    evs: {}
                };

                // Moves
                const moveEntries = document.querySelectorAll("#moves_wrapper .pokedex-move-entry-new");
                moveEntries.forEach(entry => {
                    const children = entry.children;
                    const name = children[0].innerText.trim();
                    const usage = children[2].innerText.trim();
                    if (name) data.moves[name] = usage;
                });

                // Teammates
                const teammateEntries = document.querySelectorAll("#dex_team_wrapper > a");
                teammateEntries.forEach(entry => {
                    const children = entry.children;
                    const name = children[1].innerText.trim();
                    const usage = children[3].innerText.trim();
                    if (name) data.teammates[name] = usage;
                });

                // Items
                const itemEntries = document.querySelectorAll("#items_wrapper .pokedex-move-entry-new");
                itemEntries.forEach(entry => {
                    const children = entry.children;
                    const name = children[1].innerText.trim();
                    const usage = children[2].innerText.trim();
                    if (name) data.items[name] = usage;
                });

                // Abilities
                const abilityEntries = document.querySelectorAll("#abilities_wrapper .pokedex-move-entry-new");
                abilityEntries.forEach(entry => {
                    const children = entry.children;
                    const name = children[0].innerText.trim();
                    const usage = children[1].innerText.trim();
                    if (name) data.ability[name] = usage;
                });

                // EVs
                const evEntries = document.querySelectorAll("#dex_spreads_wrapper .pokedex-move-entry-new");
                evEntries.forEach(entry => {
                    const children = entry.children;
                    const nature = children[0].innerText.trim();
                    const hp = children[1].innerText.trim();
                    const atk = children[2].innerText.trim();
                    const def = children[3].innerText.trim();
                    const spa = children[4].innerText.trim();
                    const spd = children[5].innerText.trim();
                    const spe = children[6].innerText.trim();
                    const evs = hp + "/" + atk + "/" + def + "/" + spa + "/" + spd + "/" + spe;
                    data.evs[nature] = evs;
                });

                return data;
            });

            finalData.push({
                name: pkm.name,
                usage: pkm.usage,
                set: setDetails
            });

            await pageSet.close();
        }

        // Guardar en JSON
        const jsonData = JSON.stringify(finalData, null, 2);
        await writeFile(RUTA_SALIDA, jsonData);
        console.log(`${RUTA_SALIDA} generado`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}


runFullScraper();