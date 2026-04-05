const puppeteer = require('puppeteer');
const fs = require('node:fs/promises');
const path = require('path');

// --- CONFIGURACIÓN ---
const URL_BASE = "https://limitlessvgc.com/teams?time=all&type=regional&format=all&region=all";
const PAGES_NUM = 1; 
const RUTA_SALIDA = path.join(__dirname, '..', 'backend', 'data', 'teams_data.json');

async function runTeamScrapper() {
    const browser = await puppeteer.launch({
        headless: false, 
    });

    try {
        const teamsPage = await browser.newPage();
        await teamsPage.setViewport({ width: 1920, height: 1080 });

        console.log("Accediendo a la lista de equipos...");
        await teamsPage.goto(URL_BASE, { waitUntil: 'networkidle0' });
        await teamsPage.waitForSelector(".data-table.striped");

        const allTeamLinks = [];

        // --- BSUCAR ENLACES EQUIPOS---
        for (let i = 1; i <= PAGES_NUM; i++) {
            const pageLinks = await teamsPage.evaluate(() => {
                const teamRows = document.querySelectorAll("a.vgc-team");
                return Array.from(teamRows).map(a => a.href);
            });
            allTeamLinks.push(...pageLinks);

            if (i < PAGES_NUM) {
                const nextPage = i + 1;
                const nextPageButton = `ul.pagination li[data-target="${nextPage}"]`;
                await teamsPage.waitForSelector(nextPageButton);
                await teamsPage.click(nextPageButton);
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        const finalData = [];

        // --- SACAR DATOS EQUIPOS ---
        for (const teamLink of allTeamLinks) {
            console.log(`Enlace Equipo: ${teamLink}`);

            const teamDetailsPage = await browser.newPage();
            await teamDetailsPage.setViewport({ width: 1920, height: 1080 });
            
            await teamDetailsPage.goto(teamLink, { waitUntil: 'networkidle0', timeout: 60000 });

            const fullTeam = await teamDetailsPage.evaluate(() => {
                const pokemonBlocks = document.querySelectorAll(".teamlist-pokemon .pkmn");
                
                return Array.from(pokemonBlocks).map(block => {
                    const rawAbility = block.querySelector(".details .ability")?.innerText.trim() || "None";
                    const rawTera = block.querySelector(".details .tera")?.innerText.trim() || "None";

                    const cleanAbility = rawAbility.replace(/^Ability:\s*/i, "");
                    const cleanTera = rawTera.replace(/^Tera Type:\s*/i, "");

                    const pokemonObj = {
                        name: block.querySelector(".name a")?.innerText.trim() || "Unknown",
                        item: block.querySelector(".details .item")?.innerText.trim() || "None",
                        ability: cleanAbility,
                        tera: cleanTera,
                        moves: {}
                    };

                    const movesList = block.querySelectorAll("ul.moves li");
                    movesList.forEach((move, index) => {
                        const moveName = move.innerText.trim();
                        if (moveName) {
                            pokemonObj.moves[`move${index + 1}`] = moveName;
                        }
                    });

                    return pokemonObj;
                });
            });

            finalData.push({
                TeamSource: teamLink,
                TEAM: fullTeam
            });

            console.log(`   -> OK: ${fullTeam.length} Pokémon detectados.`);
            await teamDetailsPage.close();
        }

        // --- 3. GUARDAR JSON ---
        const dir = path.dirname(RUTA_SALIDA);
        await fs.mkdir(dir, { recursive: true });

        await fs.writeFile(RUTA_SALIDA, JSON.stringify(finalData, null, 2));
        console.log(`Equipos competitivos guardados en: ${RUTA_SALIDA}`);

    } catch (error) {
        console.error("Error scrappear equipos:", error);
    } finally {
        await browser.close();
    }
}

runTeamScrapper();