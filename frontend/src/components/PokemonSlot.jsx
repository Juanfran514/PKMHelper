import React from 'react';
import '../styles/PokemonSlot.css';

export default function PokemonSlot({ pokemon, onClick }) {
    // AHORA SÍ: Cogemos la foto exacta que le mandamos desde el Editor
    const imageUrl = pokemon && pokemon.name ? pokemon.sprite : null;

    return (
        <div 
            className={`pokemon-slot ${!pokemon || !pokemon.name ? 'slot-empty' : ''}`} 
            onClick={onClick}
        >
            {pokemon && pokemon.name ? (
                <>
                    {/* Fondo decorativo */}
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