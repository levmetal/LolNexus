import React, { createContext, useContext, useState, useEffect } from 'react';
import MerakiAPI, { MerakiChampion } from '../../features/champions/services/meraki';
import DDragon from '../services/ddragon';
import { MOCK_ITEMS } from '../../data/mockItems';

interface DataContextType {
    version: string;
    champions: Record<string, MerakiChampion>;
    runes: any[];
    items: Record<string, any>;
    isLoading: boolean;
    error: Error | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<DataContextType>({
        version: '',
        champions: {},
        runes: [],
        items: MOCK_ITEMS,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true;
        async function loadAllData() {
            try {
                // Fetch version, champions, and runes concurrently
                const [version, championsData, runesData] = await Promise.all([
                    DDragon.getLatestVersion(),
                    MerakiAPI.getChampions(),
                    DDragon.getRunes()
                ]);

                if (isMounted) {
                    setState({
                        version,
                        champions: championsData,
                        runes: runesData,
                        items: MOCK_ITEMS, // Still load locally but serve centrally for consistency if desired
                        isLoading: false,
                        error: null,
                    });
                }
            } catch (error: any) {
                console.error("Failed to load global data", error);
                if (isMounted) {
                    setState(prev => ({ ...prev, isLoading: false, error }));
                }
            }
        }
        loadAllData();
        return () => { isMounted = false; };
    }, []);

    return (
        <DataContext.Provider value={state}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
