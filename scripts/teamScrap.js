const puppeteer = require('puppeteer');
const { pool } = require('../backend/dbManager');

// --- CONFIGURACIÓN ---
const URL_BASE = "https://limitlessvgc.com/teams?time=all&type=regional&format=all&region=all";
const PAGES_NUM = 5; 

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

        // --- BUSCAR ENLACES EQUIPOS---
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

        // --- GUARDAR EN POSTGRESQL ---
        console.log(`Guardando ${finalData.length} equipos en la base de datos...`);
        for (let i = 0; i < finalData.length; i++) {
            const teamData = finalData[i];
            const uniqueId = `scrapped_${Date.now()}_${i}`;
            const sourceUrl = teamData.TeamSource || 'Unknown Source';

            const query = `
                INSERT INTO teams (id, team_name, publicity, is_scrapped, pokemon_list, created_at, updated_at)
                VALUES ($1, $2, 'Public', true, $3, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING;
            `;
            
            const values = [
                uniqueId,
                `Source: ${sourceUrl}`, 
                JSON.stringify(teamData.TEAM || [])
            ];

            await pool.query(query, values);
        }
        console.log("¡Equipos competitivos guardados exitosamente en PostgreSQL!");

    } catch (error) {
        console.error("Error scrappear equipos:", error);
    } finally {
        await browser.close();
        process.exit(0);
    }
}

runTeamScrapper();