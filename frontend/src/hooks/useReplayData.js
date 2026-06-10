import { useState, useEffect } from 'react';
import { fetchMatchLog } from '../services/api';
import { parseShowdownLog } from '../utils/replayParser';

export function useReplayData(matchId) {
    const [parsedLog, setParsedLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setLoading(true);
            setError('');
            try {
                const logText = await fetchMatchLog(matchId);
                const parsed = parseShowdownLog(logText);
                
                if (isMounted) {
                    setParsedLog(parsed);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Error al procesar el replay.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (matchId) {
            loadData();
        }

        return () => {
            isMounted = false;
        };
    }, [matchId]);

    return { parsedLog, loading, error };
}
