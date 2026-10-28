import React from 'react';

export const PokemonAttributes = ({
    currentPokemon, setCurrentPokemon, handleInputChange,
    isItemMenuOpen, setIsItemMenuOpen, itemSearchTerm, setItemSearchTerm,
    topItems, allItems, setActiveMoveSlot,
    isAbilityMenuOpen, setIsAbilityMenuOpen, availableAbilities,
    setIsNatureMenuOpen
}) => {
    return (
        <div className="editor-top-inputs" style={{ display: 'flex', gap: '10px' }}>
            {/* ITEM */}
            <div style={{ position: 'relative', flex: 1 }}>
                <input 
                    type="text" 
                    name="item" 
                    className="pill-input w-100" 
                    placeholder="ITEM" 
                    value={isItemMenuOpen ? itemSearchTerm : currentPokemon.item} 
                    onChange={(e) => {
                        if (isItemMenuOpen) {
                            setItemSearchTerm(e.target.value);
                        } else {
                            handleInputChange(e);
                        }
                    }} 
                    onClick={() => {
                        setIsItemMenuOpen(true);
                        setItemSearchTerm("");
                        setActiveMoveSlot(null);
                    }}
                    autoComplete="off" 
                />

                {isItemMenuOpen && (
                    <div className="move-dropdown" style={{ zIndex: 100 }}>
                        <div className="move-list-container">
                            {topItems.filter(i => i.name.includes(itemSearchTerm.toUpperCase())).length > 0 && (
                                <>
                                    <div className="move-category-title">⭐ OBJETOS MÁS USADOS</div>
                                    {topItems
                                        .filter(i => i.name.includes(itemSearchTerm.toUpperCase()))
                                        .map(i => (
                                            <div 
                                                key={i.name} 
                                                className="move-item top-move" 
                                                onClick={() => {
                                                    setCurrentPokemon(prev => ({ ...prev, item: i.name }));
                                                    setIsItemMenuOpen(false);
                                                }}
                                            >
                                                <span>{i.name}</span>
                                                <span className="move-usage">{i.usage}</span>
                                            </div>
                                        ))
                                    }
                                </>
                            )}

                            <div className="move-category-title">RESTO DE OBJETOS</div>
                            {allItems
                                .filter(item => 
                                    item.includes(itemSearchTerm.toUpperCase()) && 
                                    !topItems.some(top => top.name === item) 
                                )
                                .map(item => (
                                    <div 
                                        key={item} 
                                        className="move-item" 
                                        onClick={() => {
                                            setCurrentPokemon(prev => ({ ...prev, item: item }));
                                            setIsItemMenuOpen(false);
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))
                            }
                            <div className="move-item" style={{ textAlign: 'center', color: '#ff6b6b', marginTop: '10px' }} onClick={() => setIsItemMenuOpen(false)}>
                                ✖ Cerrar menú
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TERA TYPE */}
            <input 
                type="text" name="teraType" className="pill-input" 
                placeholder="TERA TYPE" value={currentPokemon.teraType} 
                onChange={handleInputChange} autoComplete="off" style={{ flex: 1 }} 
            />
            
            {/* ABILITY */}
            <div style={{ position: 'relative', flex: 1 }}>
                <input 
                    type="text" name="ability" className="pill-input w-100" 
                    placeholder="ABILITY" value={currentPokemon.ability} 
                    onChange={handleInputChange} 
                    onClick={() => {
                        setIsAbilityMenuOpen(true);
                        setIsItemMenuOpen(false);
                        setIsNatureMenuOpen(false);
                        setActiveMoveSlot(null);
                    }}
                    autoComplete="off"
                />
                {isAbilityMenuOpen && availableAbilities && availableAbilities.length > 0 && (
                    <div className="move-dropdown" style={{ zIndex: 100 }}>
                        <div className="move-list-container">
                            {availableAbilities.map(ab => (
                                <div 
                                    key={ab.name} className="move-item" 
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}
                                    onClick={() => {
                                        setCurrentPokemon(prev => ({ ...prev, ability: ab.name }));
                                        setIsAbilityMenuOpen(false);
                                    }}
                                >
                                    <span>{ab.name}</span>
                                    {ab.isHidden && <span style={{ fontSize: '0.7rem', color: '#ffb84d' }}>Hidden</span>}
                                </div>
                            ))}
                            <div className="move-item" style={{ textAlign: 'center', color: '#ff6b6b', marginTop: '5px' }} onClick={() => setIsAbilityMenuOpen(false)}>
                                ✖ Cerrar
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
