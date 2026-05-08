import React from 'react';

export const PokemonEditorTabs = ({ activeTab, setActiveTab, team = [] }) => {
    return (
        <div className="editor-tabs">
            {[0, 1, 2, 3, 4, 5].map((index) => {
                const poke = team[index];
                return (
                    <div 
                        key={index} 
                        className={`editor-tab ${activeTab === index ? 'active' : ''}`} 
                        onClick={() => setActiveTab(index)}
                    >
                        <div className="tab-circle">
                            {poke && poke.sprite && (
                                <img 
                                    src={poke.sprite} 
                                    alt={poke.name || 'Pokemon'} 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
