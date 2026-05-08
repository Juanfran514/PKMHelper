import React from 'react';
import { useParams } from 'react-router-dom';
import { usePokemonEditorState } from '../hooks/usePokemonEditorState';
import { PokemonEditorTabs } from '../components/PokemonEditor/PokemonEditorTabs';
import { PokemonSearchPanel } from '../components/PokemonEditor/PokemonSearchPanel';
import { PokemonAttributes } from '../components/PokemonEditor/PokemonAttributes';
import { PokemonMoves } from '../components/PokemonEditor/PokemonMoves';
import { PokemonEvStats } from '../components/PokemonEditor/PokemonEvStats';
import '../styles/PokemonEditor.css';

export default function PokemonEditor() {
    const { slotIndex } = useParams();
    const activeIndex = Number(slotIndex) || 0;
    
    const state = usePokemonEditorState(activeIndex);

    let topItems = [];
    if (state.pokemonStats && state.pokemonStats.set && state.pokemonStats.set.items) {
        const itemsObj = state.pokemonStats.set.items;
        topItems = Object.keys(itemsObj)
            .filter(i => i !== "Other")
            .map(i => ({
                name: i.toUpperCase(),
                usage: itemsObj[i]
            }))
            .sort((a, b) => parseFloat(b.usage) - parseFloat(a.usage));
    }

    return (
        <div className="container-fluid px-4 py-3 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="editor-panel">
                
                <PokemonEditorTabs 
                    activeTab={state.activeTab} 
                    setActiveTab={state.setActiveTab} 
                    team={state.teamData?.pokemon || []}
                />

                <div className="editor-body">
                    <PokemonSearchPanel 
                        currentPokemon={state.currentPokemon}
                        handleNameChange={state.handleNameChange}
                        isSearchOpen={state.isSearchOpen}
                        setIsSearchOpen={state.setIsSearchOpen}
                        filteredPokemon={state.getFilteredList(state.currentPokemon.name)}
                        handleSelectPokemon={state.handleSelectPokemon}
                        pokemonSprite={state.pokemonSprite}
                    />

                    <div className="editor-right">
                        <PokemonAttributes 
                            currentPokemon={state.currentPokemon}
                            setCurrentPokemon={state.setCurrentPokemon}
                            handleInputChange={state.handleInputChange}
                            isItemMenuOpen={state.isItemMenuOpen}
                            setIsItemMenuOpen={state.setIsItemMenuOpen}
                            itemSearchTerm={state.itemSearchTerm}
                            setItemSearchTerm={state.setItemSearchTerm}
                            topItems={topItems}
                            allItems={state.allItems}
                            setActiveMoveSlot={state.setActiveMoveSlot}
                            isAbilityMenuOpen={state.isAbilityMenuOpen}
                            setIsAbilityMenuOpen={state.setIsAbilityMenuOpen}
                            availableAbilities={state.availableAbilities}
                            setIsNatureMenuOpen={state.setIsNatureMenuOpen}
                        />

                        <PokemonMoves 
                            currentPokemon={state.currentPokemon}
                            handleMoveClick={state.handleMoveClick}
                            activeMoveSlot={state.activeMoveSlot}
                            moveSearchTerm={state.moveSearchTerm}
                            setMoveSearchTerm={state.setMoveSearchTerm}
                            availableMoves={state.availableMoves}
                            selectMove={state.selectMove}
                        />

                        <PokemonEvStats 
                            currentPokemon={state.currentPokemon}
                            setCurrentPokemon={state.setCurrentPokemon}
                            handleEvChange={state.handleEvChange}
                            handleInputChange={state.handleInputChange}
                            baseStats={state.baseStats}
                            isNatureMenuOpen={state.isNatureMenuOpen}
                            setIsNatureMenuOpen={state.setIsNatureMenuOpen}
                            natureSearchTerm={state.natureSearchTerm}
                            setNatureSearchTerm={state.setNatureSearchTerm}
                            setIsItemMenuOpen={state.setIsItemMenuOpen}
                            setActiveMoveSlot={state.setActiveMoveSlot}
                            handleDone={state.handleDone}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}