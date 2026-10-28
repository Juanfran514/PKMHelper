import ArchetypeCard from './ArchetypeCard'; 
import {useArchetypeStats} from '../hooks/useArchetypeStats.js';

export default function ArchetypeList() {
    
    const archetypeStats = useArchetypeStats();
    return (
        <div className="archetype-list-container">
            {archetypeStats.map((stat, index) => (
                <ArchetypeCard 
                    key={index} 
                    name={stat.name} 
                    usage={`${stat.usage}%`}
                />
            ))}
        </div>
    );
}