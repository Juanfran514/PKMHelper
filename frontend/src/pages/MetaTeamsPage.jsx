import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMetaTeams } from '../../services/teamService';
import '../styles/MetaTeamsPage.css';

const TAGS = ['ALL', 'WEATHER', 'TR', 'HYPEROFF', 'BALANCED'];

export default function MetaTeamsPage() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('ALL');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, [selectedTag]);

    // Handle search on enter or when search term changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTeams();
        }, 300); // 300ms debounce
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const data = await getMetaTeams(selectedTag, searchTerm);
            setTeams(data);
        } catch (error) {
            console.error("Error fetching meta teams:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meta-teams-container">
            <div className="meta-teams-header">
                <div className="search-section">
                    <label>SEARCH POKEMON OR ARCHETYPE</label>
                    <div className="search-input-wrapper">
                        <i className="search-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '8px' }}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                            </svg>
                        </i>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="meta-teams-filters">
                {TAGS.map(tag => (
                    <button 
                        key={tag}
                        className={`filter-btn ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <div className="meta-teams-grid">
                {loading ? (
                    <p className="loading-text">Loading teams...</p>
                ) : teams.length === 0 ? (
                    <p className="no-results">No teams found.</p>
                ) : (
                    teams.map(team => (
                        <div className="meta-team-card" key={team.id}>
                            <div className="team-pokemon-grid">
                                {/* 3x2 grid of pokemon slots */}
                                {[0, 1, 2, 3, 4, 5].map(index => {
                                    const poke = team.pokemon && team.pokemon[index] ? team.pokemon[index] : null;
                                    return (
                                        <div className="mini-poke-slot" key={index}>
                                            {poke && poke.sprite && (
                                                <img src={poke.sprite} alt={poke.name} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="team-info-section">
                                <div className="team-tags">
                                    <span className="info-label">TAGS</span>
                                    <div className="tags-list">
                                        {team.archetype ? team.archetype.split(' / ').map((tag, i) => (
                                            <span key={i} className="tag-item">{tag.toUpperCase()}</span>
                                        )) : <span className="tag-item">UNKNOWN</span>}
                                    </div>
                                </div>
                                <div className="team-standings">
                                    <span className="info-label">SOURCE</span>
                                    <div className="standings-list">
                                        {(() => {
                                            const urlMatch = team.teamName ? team.teamName.match(/https?:\/\/[^\s]+/) : null;
                                            if (urlMatch) {
                                                const url = urlMatch[0];
                                                
                                                let displaySource = team.trainerName;
                                                if (!displaySource || displaySource === 'Unknown Trainer') {
                                                    if (url.includes('limitless')) displaySource = 'Limitless';
                                                    else if (url.includes('pokepast')) displaySource = 'Pokepaste';
                                                    else displaySource = 'Source Link';
                                                }

                                                return (
                                                    <a href={url} target="_blank" rel="noreferrer" className="standing-item source-link" style={{ color: '#4facfe', textDecoration: 'none' }}>
                                                        {displaySource}
                                                    </a>
                                                );
                                            }
                                            
                                            let fallbackSource = team.trainerName || team.teamName || 'Unknown Source';
                                            if (fallbackSource === 'Unknown Trainer') fallbackSource = 'Unknown Source';
                                            
                                            return (
                                                <span className="standing-item">{fallbackSource}</span>
                                            );
                                        })()}
                                        {team.likes > 0 && <span className="standing-item" style={{ color: '#a0a0b5', fontSize: '0.8rem' }}>{team.likes} Likes</span>}
                                    </div>
                                </div>
                                <button className="view-btn" onClick={() => navigate(`/teambuilder?teamId=${team.id}`)}>
                                    VIEW
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
