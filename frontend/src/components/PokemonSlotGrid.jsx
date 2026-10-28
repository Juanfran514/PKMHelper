import React from 'react';
import PokemonSlot from './PokemonSlot';
import '../styles/PokemonSlotGrid.css';

export default function PokemonSlotGrid({ currentPokemonList, onSlotClick }) {
    const slots = Array.from({ length: 6 });

    return (
        <div className="slot-grid-container">
            {slots.map((_, index) => {
                const pokemonData = currentPokemonList[index] || null;
                return (
                    <PokemonSlot 
                        key={index}
                        pokemon={pokemonData} 
                        onClick={() => onSlotClick(index, pokemonData)} 
                    />
                );
            })}
        </div>
    );
}