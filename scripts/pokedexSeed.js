const { pool } = require('../backend/dbManager');

async function runPokedexScraper() {
    try {
        console.log("Obteniendo la lista de Pokémon desde PokeAPI...");
        const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1500');
        const listData = await listResponse.json();
        const results = listData.results;

        console.log(`Se encontraron ${results.length} Pokémon. Empezando a procesar...`);

        for (const [index, pkm] of results.entries()) {
            console.log(`[${index + 1}/${results.length}] Obteniendo datos de: ${pkm.name}`);

            try {
                const pkmResponse = await fetch(pkm.url);
                if (!pkmResponse.ok) {
                    console.error(`Error al obtener ${pkm.name}: ${pkmResponse.statusText}`);
                    continue;
                }
                const data = await pkmResponse.json();

                const id = data.id;
                const name = data.name;

                const showdown_name = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');

                let hp = 0, atk = 0, def = 0, spAtk = 0, spDef = 0, spe = 0;

                if (data.stats && Array.isArray(data.stats)) {
                    data.stats.forEach(s => {
                        if (s.stat.name === 'hp') hp = s.base_stat;
                        if (s.stat.name === 'attack') atk = s.base_stat;
                        if (s.stat.name === 'defense') def = s.base_stat;
                        if (s.stat.name === 'special-attack') spAtk = s.base_stat;
                        if (s.stat.name === 'special-defense') spDef = s.base_stat;
                        if (s.stat.name === 'speed') spe = s.base_stat;
                    });
                }

                const sprite = data.sprites?.front_default || "";

                const legal_moves = data.moves ? data.moves.map(m => m.move.name) : [];
                const abilities = data.abilities ? data.abilities.map(a => a.ability.name) : [];
                const legal_items = data.held_items ? data.held_items.map(i => i.item.name) : [];

                const query = `
                    INSERT INTO pokedex (
                        id, name, showdown_name, hp, atk, def, "spAtk", "spDef", spe, 
                        sprite, legal_moves, abilities, legal_items
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        showdown_name = EXCLUDED.showdown_name,
                        hp = EXCLUDED.hp,
                        atk = EXCLUDED.atk,
                        def = EXCLUDED.def,
                        "spAtk" = EXCLUDED."spAtk",
                        "spDef" = EXCLUDED."spDef",
                        spe = EXCLUDED.spe,
                        sprite = EXCLUDED.sprite,
                        legal_moves = EXCLUDED.legal_moves,
                        abilities = EXCLUDED.abilities,
                        legal_items = EXCLUDED.legal_items;
                `;

                const values = [
                    id, name, showdown_name, hp, atk, def, spAtk, spDef, spe,
                    sprite, JSON.stringify(legal_moves), JSON.stringify(abilities), JSON.stringify(legal_items)
                ];

                await pool.query(query, values);

                await new Promise(r => setTimeout(r, 50));
            } catch (err) {
                console.error(`Excepción al procesar a ${pkm.name}:`, err.message);
            }
        }

        console.log("¡Pokedex Poblada!");
    } catch (error) {
        console.error("Error durante población:", error);
    } finally {
        process.exit(0);
    }
}

runPokedexScraper();
