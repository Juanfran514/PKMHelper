import React from 'react';

export const PokemonSearchPanel = ({
    currentPokemon,
    handleNameChange,
    isSearchOpen,
    setIsSearchOpen,
    filteredPokemon,
    handleSelectPokemon,
    pokemonSprite
}) => {
    return (
        <div className="editor-left">
            <div className="pokemon-search-container">
                <input 
                    type="text" 
                    name="name" 
                    className="pill-input full-width" 
                    style={{ marginBottom: 0 }}
                    placeholder="POKEMON NAME" 
                    value={currentPokemon.name} 
                    onChange={handleNameChange}
                    onFocus={() => currentPokemon.name && setIsSearchOpen(true)}
                    autoComplete="off"
                />
                
                {isSearchOpen && filteredPokemon.length > 0 && (
                    <div className="autocomplete-dropdown">
                        {filteredPokemon.map(p => (
                            <div key={p.name} className="autocomplete-item" onClick={() => handleSelectPokemon(p.name)}>
                                {p.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="editor-image-box" style={{ marginTop: '20px', cursor: 'default' }}>
                {pokemonSprite && (
                    <img src={pokemonSprite} alt={currentPokemon.name} className="poke-sprite" />
                )}
            </div>
        </div>
    );
};
