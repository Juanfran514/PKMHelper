import React from 'react';
import '../styles/PokemonSlot.css';

export default function PokemonSlot({ pokemon, onClick }) {
    const imageUrl = pokemon ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png` : null;

    return (
        <div 
            className={`pokemon-slot ${!pokemon ? 'slot-empty' : ''}`} 
            onClick={onClick}
        >
            {pokemon ? (
                <>
                    {/* Fondo decorativo (en el futuro puedes cambiarlo según el tipo del Pokémon) */}
                    <div className="slot-bg-layer" style={{ background: 'linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%)' }}></div>
                    
                    {/* Imagen del Pokémon */}
                    <img src={imageUrl} alt={pokemon.name} className="pokemon-artwork" />
                </>
            ) : (
                <div className="add-btn-circle">+</div>
            )}
        </div>
    );
}