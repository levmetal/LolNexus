import { useState } from 'react';
import Navbar from './shared/components/Navbar';
import ChampionsView from './features/champions/ChampionsView';
import ItemsView from './features/items/ItemsView';
import RunesView from './features/runes/RunesView';
import StatSummaryBar from './shared/components/StatSummaryBar';
import { useBuildStore } from './features/build/useBuildStore';
import { useData } from './shared/context/DataContext';

function App() {
    const [currentView, setCurrentView] = useState<'champions' | 'items' | 'runes'>('champions');
    const [selectedChamp, setSelectedChamp] = useState<any>(null);

    const resetBuild = useBuildStore(state => state.resetBuild);
    const { champions: championsData, isLoading: loading } = useData();

    const handleChampSelect = (champ: any) => {
        resetBuild();
        setSelectedChamp(champ);
    };

    return (
        <div className="app-container">
            <Navbar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onClearChamp={() => handleChampSelect(null)}
            />

            <main className="main-content">
                {loading ? (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p className="loading-text">Loading Champion Data...</p>
                    </div>
                ) : (
                    <>
                        {currentView === 'champions' && (
                            <ChampionsView
                                championsData={championsData}
                                selectedChamp={selectedChamp}
                                setSelectedChamp={handleChampSelect}
                            />
                        )}
                        {currentView === 'items' && <ItemsView />}
                        {currentView === 'runes' && <RunesView />}
                    </>
                )}
            </main>

            <StatSummaryBar
                selectedChamp={selectedChamp}
            />
        </div>
    );
}

export default App;
