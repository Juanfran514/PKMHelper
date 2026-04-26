import '../styles/ArchetypeCard.css';

// Asumimos que 'usage' te llega como un string tipo "60%" o un número 60
function ArchetypeCard({ name, usage }) {
    const displayName = name.toUpperCase(); 
    
    const usagePercent = typeof usage === 'number' ? `${usage}%` : usage;

    return (
        <div className="archetype-card">
            <div className="archetype-icon"></div>
            
            <div className="archetype-info">
                <h4 className="archetype-title">{displayName}</h4>
                
                <div className="progress-track">
                    <div 
                        className="progress-fill" 
                        style={{ width: usage }} 
                    ></div>
                </div>
            </div>
        </div>
    );
}

export default ArchetypeCard;