import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTeamContext } from '../context/TeamContext';

export const generateSmogonExport = (pokemonList) => {
    if (!pokemonList || !Array.isArray(pokemonList)) return "";

    return pokemonList.filter(p => p && p.name).map(pkmn => {
        let lines = [];
        
        let nameLine = pkmn.name;
        if (pkmn.item) {
            nameLine += ` @ ${pkmn.item}`;
        }
        lines.push(nameLine);

        if (pkmn.ability) {
            lines.push(`Ability: ${pkmn.ability}`);
        }

        if (pkmn.teraType) {
            lines.push(`Tera Type: ${pkmn.teraType}`);
        }

        if (pkmn.evs) {
            const evPairs = [];
            const evLabels = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
            for (const [key, label] of Object.entries(evLabels)) {
                if (pkmn.evs[key] > 0) {
                    const realEv = (pkmn.evs[key] - 1) * 8 + 4;
                    evPairs.push(`${realEv} ${label}`);
                }
            }
            if (evPairs.length > 0) {
                lines.push(`EVs: ${evPairs.join(' / ')}`);
            }
        }

        if (pkmn.nature) {
            lines.push(`${pkmn.nature} Nature`);
        }

        if (pkmn.ivs) {
            const ivPairs = [];
            const ivLabels = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
            for (const [key, label] of Object.entries(ivLabels)) {
                if (pkmn.ivs[key] !== undefined && pkmn.ivs[key] < 31) {
                    ivPairs.push(`${pkmn.ivs[key]} ${label}`);
                }
            }
            if (ivPairs.length > 0) {
                lines.push(`IVs: ${ivPairs.join(' / ')}`);
            }
        }

        if (pkmn.moves) {
            const moveValues = Array.isArray(pkmn.moves) ? pkmn.moves : Object.values(pkmn.moves);
            moveValues.forEach(move => {
                if (move) lines.push(`- ${move}`);
            });
        }

        return lines.join('\n');
    }).join('\n\n');
};

export default function ExportSmogonModal({ show, onHide }) {
    const { teamData } = useTeamContext();
    const [copied, setCopied] = useState(false);

    const smogonText = generateSmogonExport(teamData.pokemon);

    const handleCopy = () => {
        navigator.clipboard.writeText(smogonText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            contentClassName="analytics-modal-content" // Reusing styling from analytics modal
        >
            <Modal.Header closeButton className="analytics-modal-header">
                <Modal.Title>Exportar Equipo a Showdown</Modal.Title>
            </Modal.Header>
            <Modal.Body className="analytics-modal-body">
                <textarea 
                    value={smogonText} 
                    readOnly 
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
                    Cerrar
                </Button>
                <Button variant="primary" onClick={handleCopy} style={{ backgroundColor: '#3b82f6', border: 'none' }}>
                    {copied ? '¡Copiado!' : 'Copiar Portapapeles'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
