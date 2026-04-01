const puppeteer = require('puppeteer');
const fs = require('node:fs/promises');

// --- CONFIGURACIÓN ---
const URL_BASE = "https://limitlessvgc.com/teams?time=all&type=regional&format=all&region=all";
const PAGES_NUM= 1;  //1 page = 25 Teams 
const RUTA_SALIDA = 'team_data.json'; 

async function runTeamScrapper(){
    const browser = await puppeteer.launch({
        headless:false,
    });

    try{

        const teamsPage = await browser.newPage();
        await teamsPage.setViewport({ width: 1920, height: 1080 });

        await teamsPage.goto(URL_BASE);
        await teamsPage.waitForSelector(".data-table.striped");

        let pagesNum = PAGES_NUM;
        const allTeamLinks = [];

        for (let i = 1; i <= pagesNum; i++) {
            const pageLinks = await teamsPage.evaluate(() => {
                const teamRows = document.querySelectorAll("a.vgc-team");
                return Array.from(teamRows).map(a => a.href);
            });
            allTeamLinks.push(...pageLinks);

            if(i<pagesNum){
                const nextPage = i+1;

                const nextPageButton = `ul.pagination li[data-target="${nextPage}"]`;

                await teamsPage.waitForSelector(nextPageButton);
                await teamsPage.click(nextPageButton);
                await new Promise(r => setTimeout(r, 500));
            }
        }

        
        console.log(`Total de enlaces capturados: ${allTeamLinks.length}`)
        console.log(allTeamLinks);


        const teamsData = [];

        for (const team of allTeamLinks){
            console.log("Procesando equipo");

            const teamDetailsPage = await browser.newPage();
            await teamDetailsPage.setViewport({ width: 1920, height: 1080 });

            await teamDetailsPage.goto(team);
            
            const pokemonData = await teamDetailsPage.evaluate(() => {
                const pokemons = {
                    name: document.querySelector("body > main > div > div.teamlist > div.teamlist-pokemon > div > div.name > a").innerText.trim(),
                    item: document.querySelector("body > main > div > div.teamlist > div.teamlist-pokemon > div > div.main > div > div > div.item").innerText.trim(),
                    ability: document.querySelector("body > main > div > div.teamlist > div.teamlist-pokemon > div > div.main > div > div > div.ability").innerText.trim(),
                    tera: document.querySelector("body > main > div > div.teamlist > div.teamlist-pokemon > div > div.main > div > div > div.tera").innerText.trim(),
                    moves: {}
                    
                };
                const pkmMoves = document.querySelector("body > main > div > div.teamlist > div.teamlist-pokemon > div > div.main > div > ul")
                const movesList = pkmMoves.querySelectorAll("li");
                movesList.forEach((move, index) => {
                    pokemons.moves[`move${index+1}`] = move.innerText.trim();
                });


                return pokemons;
            })
            teamsData.push(pokemonData);

            await teamDetailsPage.close();
            console.log("Equipos:");
            console.log(teamsData);
        }

    } catch(error){
        console.error("Error:",error);
    } finally {
        await browser.close();
    }
}

runTeamScrapper();