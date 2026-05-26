import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SchoolEditor from './components/SchoolEditor';
import { supabase } from './supabaseClient';
import { LayoutDashboard, Folders } from 'lucide-react';

export default function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [currentPath, setCurrentPath] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            if (!supabase) {
                const savedData = localStorage.getItem('uniform_manager_data');
                if (savedData) setSchools(JSON.parse(savedData));
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('schools')
                .select('*, franchises(*)');

            if (error) throw error;

            const sortedData = (data || []).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
            const schoolsWithSortedFranchises = sortedData.map(school => ({
                ...school,
                franchises: (school.franchises || []).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
            }));

            setSchools(schoolsWithSortedFranchises);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path) => {
        setCurrentPath(path);
        if (path.length > 0) setActiveView('schools');
    };

    const handleAddFolder = async (name) => {
        if (!name) return;
        try {
            if (!supabase) {
                alert("Configure as chaves do Supabase no arquivo .env para salvar na nuvem.");
                return;
            }
            if (currentPath.length === 0) {
                const { error } = await supabase.from('schools').insert([{ name }]);
                if (error) throw error;
                fetchSchools();
            } else if (currentPath.length === 1) {
                const schoolId = currentPath[0];
                const { error } = await supabase.from('franchises').insert([{
                    name,
                    school_id: schoolId,
                    inventory: {},
                    financials: {}
                }]);
                if (error) throw error;
                fetchSchools();
            }
        } catch (err) {
            console.error("Error adding folder:", err);
            alert("Erro ao criar pasta: " + err.message);
        }
    };

    const handleSaveFranchise = async (updatedFranchise) => {
        try {
            if (!supabase) {
                alert("Configure as chaves do Supabase para salvar.");
                return;
            }
            const { error } = await supabase
                .from('franchises')
                .update({
                    name: updatedFranchise.name,
                    inventory: updatedFranchise.inventory,
                    financials: updatedFranchise.financials
                })
                .eq('id', updatedFranchise.id);
            if (error) throw error;
            fetchSchools();
            setCurrentPath([currentPath[0]]);
        } catch (err) {
            console.error("Error saving franchise:", err);
            alert("Erro ao salvar: " + err.message);
        }
    };

    const handleUpdateSchool = async (schoolId, financials) => {
        try {
            if (!supabase) {
                alert("Configure as chaves do Supabase para salvar.");
                return;
            }
            const { error } = await supabase
                .from('schools')
                .update({ financials })
                .eq('id', schoolId);
            if (error) throw error;
            fetchSchools();
        } catch (err) {
            console.error("Error updating school:", err);
            alert("Erro ao atualizar escola: " + err.message);
        }
    };

    const handleRenameSchool = async (schoolId, newName) => {
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('schools')
                .update({ name: newName })
                .eq('id', schoolId);
            if (error) throw error;
            fetchSchools();
        } catch (err) {
            console.error("Error renaming school:", err);
            alert("Erro ao renomear escola.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza? Essa ação não pode ser desfeita.")) return;
        try {
            if (!supabase) {
                alert("Configure as chaves do Supabase para excluir.");
                return;
            }
            let table = currentPath.length === 0 ? 'schools' : 'franchises';
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            if (currentPath.length === 2) setCurrentPath([currentPath[0]]);
            fetchSchools();
        } catch (err) {
            console.error("Error deleting:", err);
            alert("Erro ao excluir: " + err.message);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f2f2f7', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e5e5ea', borderTopColor: '#0071e3', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <span style={{ fontSize: '0.875rem', color: '#6e6e73', fontWeight: 500 }}>Carregando...</span>
        </div>
    );

    const renderContent = () => {
        if (currentPath.length === 2) {
            const school = schools.find(s => s.id === currentPath[0]);
            const franchise = school?.franchises.find(f => f.id === currentPath[1]);
            if (!franchise) return <div>Erro: Franquia não encontrada (Recarregue a página)</div>;
            return (
                <SchoolEditor
                    school={school}
                    franchise={franchise}
                    onSave={handleSaveFranchise}
                    onBack={() => setCurrentPath([school.id])}
                    onDelete={handleDelete}
                />
            );
        }

        switch (activeView) {
            case 'dashboard':
                return <Dashboard
                    schools={schools}
                    currentPath={[]}
                    onNavigate={handleNavigate}
                    onAddFolder={handleAddFolder}
                    onDeleteFolder={handleDelete}
                    onUpdateSchool={handleUpdateSchool}
                    onRenameSchool={handleRenameSchool}
                    isEmbedded={true}
                />;
            case 'schools':
                return <Dashboard
                    schools={schools}
                    currentPath={currentPath}
                    onNavigate={handleNavigate}
                    onAddFolder={handleAddFolder}
                    onDeleteFolder={handleDelete}
                    onUpdateSchool={handleUpdateSchool}
                    onRenameSchool={handleRenameSchool}
                />;
            default:
                return null;
        }
    };

    return (
        <div id="root">
            <aside className="sidebar">
                <div style={{ padding: '0 0.5rem', marginBottom: '2rem' }}>
                    <img
                        src="/logo.png"
                        alt="Gestão de Uniformes"
                        style={{ width: '100%', maxWidth: '160px', display: 'block' }}
                    />
                </div>

                <nav className="nav-group">
                    <div
                        className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveView('dashboard'); setCurrentPath([]); }}
                    >
                        <LayoutDashboard size={18} />
                        Visão Geral
                    </div>
                    <div
                        className={`nav-item ${activeView === 'schools' ? 'active' : ''}`}
                        onClick={() => { setActiveView('schools'); setCurrentPath([]); }}
                    >
                        <Folders size={18} />
                        Minhas Escolas
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <p style={{ margin: '0 0 2px' }}>© 2026 Gestão de Uniformes</p>
                    <p style={{ margin: 0 }}>Versão 2.5.0</p>
                </div>
            </aside>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}
