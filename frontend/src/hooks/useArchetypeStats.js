import {useMemo} from 'react';
import teamsData from '../../../backend/data/classified_teams.json'

export const useArchetypeStats = () => {
    return useMemo(() => {
        if (!teamsData || teamsData.length === 0) return [];

        const totalTeams = teamsData.length;
        const tagCounts = {};

        teamsData.forEach(team => {
            if (team.tags) {
                team.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const statsArray = Object.keys(tagCounts).map(tag => {
            const count = tagCounts[tag];
            const percentage = ((count / totalTeams) * 100).toFixed(1); 
            
            return {
                name: tag,
                count: count,
                usage: Number(percentage)
            };
        });

        return statsArray.sort((a, b) => b.usage - a.usage);

    }, []); 
    }