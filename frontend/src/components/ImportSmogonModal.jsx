import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTeamContext } from '../context/TeamContext';

// Convertir EVs de Smogon (0-252) a Puntos internos (0-32)
function evToPoints(evStr) {
    const val = parseInt(evStr, 10);
    if (isNaN(val) || val <= 0) return 0;
    let points = Math.floor((val - 4) / 8) + 1;
    if (points > 32) points = 32;
    return points;
}

export const parseSmogonImport = (text) => {
    // Separa el texto por líneas en blanco (cada bloque es un pokemon)
    const blocks = text.trim().split(/\n\s*\n/);
    const team = [];

    blocks.forEach(block => {
        if (!block.trim() || team.length >= 6) return;
        const lines = block.split('\n').map(l => l.trim());
        
        const pokemon = {
            name: "",
            item: "",
            ability: "",
            teraType: "",
            nature: "Serious",
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            moves: ["", "", "", ""]
        };
        let moveIndex = 0;

        lines.forEach((line, index) => {
            if (index === 0) {
                // Name @ Item
                const parts = line.split('@');
                let rawName = parts[0].trim();
                
                // Limpiar genero y nicknames (Nick (Species) (M) @ Item)
                rawName = rawName.replace(/\s*\([MF]\)\s*/gi, '');
                if (rawName.includes('(') && rawName.includes(')')) {
                    const match = rawName.match(/\(([^)]+)\)/);
                    if (match) {
                        rawName = match[1];
                    }
                }
                pokemon.name = rawName.trim().toUpperCase();
                
                if (parts.length > 1) {
                    pokemon.item = parts[1].trim();
                }
            } else if (line.startsWith('Ability:')) {
                pokemon.ability = line.replace('Ability:', '').trim();
            } else if (line.startsWith('Tera Type:')) {
                pokemon.teraType = line.replace('Tera Type:', '').trim();
            } else if (line.startsWith('EVs:')) {
                const evParts = line.replace('EVs:', '').split('/');
                evParts.forEach(part => {
                    const [val, stat] = part.trim().split(' ');
                    if (val && stat) {
                        const s = stat.toLowerCase();
                        if (s === 'hp') pokemon.evs.hp = evToPoints(val);
                        else if (s === 'atk') pokemon.evs.atk = evToPoints(val);
                        else if (s === 'def') pokemon.evs.def = evToPoints(val);
                        else if (s === 'spa') pokemon.evs.spa = evToPoints(val);
                        else if (s === 'spd') pokemon.evs.spd = evToPoints(val);
                        else if (s === 'spe') pokemon.evs.spe = evToPoints(val);
                    }
                });
            } else if (line.startsWith('IVs:')) {
                const ivParts = line.replace('IVs:', '').split('/');
                ivParts.forEach(part => {
                    const [val, stat] = part.trim().split(' ');
                    if (val && stat) {
                        const s = stat.toLowerCase();
                        const ivVal = parseInt(val, 10);
                        if (s === 'hp') pokemon.ivs.hp = ivVal;
                        else if (s === 'atk') pokemon.ivs.atk = ivVal;
                        else if (s === 'def') pokemon.ivs.def = ivVal;
                        else if (s === 'spa') pokemon.ivs.spa = ivVal;
                        else if (s === 'spd') pokemon.ivs.spd = ivVal;
                        else if (s === 'spe') pokemon.ivs.spe = ivVal;
                    }
                });
            } else if (line.includes('Nature')) {
                pokemon.nature = line.replace('Nature', '').trim();
            } else if (line.startsWith('-')) {
                if (moveIndex < 4) {
                    pokemon.moves[moveIndex] = line.replace('-', '').trim();
                    moveIndex++;
                }
            }
        });

        team.push(pokemon);
    });

    // Rellenar hasta 6 con nulls si es necesario
    while(team.length < 6) {
        team.push(null);
    }

    return team;
};

export default function ImportSmogonModal({ show, onHide }) {
    const { teamData, setTeamData } = useTeamContext();
    const [pasteText, setPasteText] = useState("");

    const handleImport = async () => {
        try {
            const parsedPokemonList = parseSmogonImport(pasteText);
            
            // Obtener sprites de la PokeAPI
            for (let pkmn of parsedPokemonList) {
                if (pkmn && pkmn.name) {
                    try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stats/sprite/${pkmn.name}`);
                        if (res.ok) {
                            const data = await res.json();
                            pkmn.sprite = data.sprite;
                        }
                    } catch (e) {
                        console.error("No se pudo cargar el sprite de", pkmn.name);
                    }
                }
            }

            setTeamData(prev => ({
                ...prev,
                pokemon: parsedPokemonList
            }));
            setPasteText("");
            onHide();
        } catch (error) {
            console.error("Error importando paste:", error);
            alert("No se pudo parsear el texto. Asegúrate de que está en formato Showdown/Smogon.");
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            contentClassName="analytics-modal-content"
        >
            <Modal.Header closeButton className="analytics-modal-header">
                <Modal.Title>Importar Equipo (Formato Showdown)</Modal.Title>
            </Modal.Header>
            <Modal.Body className="analytics-modal-body">
                <textarea 
                    value={pasteText} 
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Pega aquí tu equipo copiado desde Pokémon Showdown o Pokepaste..."
                    style={{
                        width: '100%',
                        height: '300px',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '8px',
                        padding: '15px',
                        fontFamily: 'monospace',
                        resize: 'none',
                        outline: 'none'
                    }}
                />
            </Modal.Body>
            <Modal.Footer style={{ borderTop: '1px solid #444', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                <Button variant="secondary" onClick={onHide} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleImport} style={{ backgroundColor: '#10b981', border: 'none' }}>
                    Importar Equipo
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
