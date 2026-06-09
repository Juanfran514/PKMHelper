const puppeteer = require('puppeteer');
const { pool } = require('../backend/dbManager');
const { determineArchetype } = require('../backend/utils/archetypeUtils');

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

            const rawTeam = await teamDetailsPage.evaluate(() => {
                const pokemonBlocks = document.querySelectorAll(".teamlist-pokemon .pkmn");
                
                return Array.from(pokemonBlocks).map(block => {
                    const rawAbility = block.querySelector(".details .ability")?.innerText.trim() || "";
                    const rawTera = block.querySelector(".details .tera")?.innerText.trim() || "";

                    const cleanAbility = rawAbility.replace(/^Ability:\s*/i, "").toUpperCase();
                    const cleanTera = rawTera.replace(/^Tera Type:\s*/i, "").toUpperCase();

                    const name = block.querySelector(".name a")?.innerText.trim().toUpperCase() || "UNKNOWN";
                    let item = block.querySelector(".details .item")?.innerText.trim().toUpperCase() || "";
                    if (item === "NONE") item = "";

                    const movesList = block.querySelectorAll("ul.moves li");
                    let moves = ["", "", "", ""];
                    movesList.forEach((move, index) => {
                        const moveName = move.innerText.trim().toUpperCase();
                        if (index < 4 && moveName) {
                            moves[index] = moveName;
                        }
                    });

                    return {
                        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                        item: item,
                        name: name,
                        moves: moves,
                        nature: "",
                        sprite: "", // Will be filled from DB
                        ability: cleanAbility === "NONE" ? "" : cleanAbility,
                        teraType: cleanTera === "NONE" ? "" : cleanTera
                    };
                });
            });

            // Fill sprites from database
            for (let i = 0; i < rawTeam.length; i++) {
                const p = rawTeam[i];
                try {
                    const nameWithHyphen = p.name.replace(/\s+/g, '-');
                    const namePrefix = nameWithHyphen + '%';
                    
                    const query = `
                        SELECT sprite FROM pokedex 
                        WHERE name ILIKE $1 
                           OR showdown_name ILIKE $1 
                           OR REPLACE(name, '-', ' ') ILIKE $1
                           OR name ILIKE $2
                           OR name ILIKE $3
                        LIMIT 1
                    `;
                    const dbRes = await pool.query(query, [p.name, nameWithHyphen, namePrefix]);
                    
                    if (dbRes.rows.length > 0) {
                        p.sprite = dbRes.rows[0].sprite;
                    }
                } catch (err) {
                    console.error(`Error querying sprite for ${p.name}:`, err.message);
                }
            }

            // Pad the array to exactly 6 elements
            const formattedTeam = [...rawTeam];
            while (formattedTeam.length < 6) {
                formattedTeam.push(null);
            }

            finalData.push({
                TeamSource: teamLink,
                TEAM: formattedTeam
            });

            console.log(`   -> OK: ${rawTeam.length} Pokémon detectados y formateados a 6 slots.`);
            await teamDetailsPage.close();
        }

        // --- GUARDAR EN POSTGRESQL ---
        console.log(`Borrando equipos scrapeados antiguos...`);
        await pool.query('DELETE FROM teams WHERE is_scrapped = true');
        
        console.log(`Guardando ${finalData.length} equipos nuevos en la base de datos...`);
        for (let i = 0; i < finalData.length; i++) {
            const teamData = finalData[i];
            const uniqueId = `scrapped_${Date.now()}_${i}`;
            const sourceUrl = teamData.TeamSource || 'Unknown Source';
            const archetype = determineArchetype(teamData.TEAM);

            const query = `
                INSERT INTO teams (id, team_name, publicity, is_scrapped, pokemon_list, archetype, created_at, updated_at)
                VALUES ($1, $2, 'Public', true, $3, $4, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING;
            `;
            
            const values = [
                uniqueId,
                `Source: ${sourceUrl}`, 
                JSON.stringify(teamData.TEAM || []),
                archetype
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