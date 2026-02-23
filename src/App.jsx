import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SchoolEditor from './components/SchoolEditor';
import InvestmentFund from './components/InvestmentFund';
import { supabase } from './supabaseClient';
import {
    LayoutDashboard,
    Folders,
    TrendingUp,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';

export default function App() {
    const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'schools', 'investment'
    const [currentPath, setCurrentPath] = useState([]); // [] = root, [schoolId] = school view, [schoolId, franchiseId] = editor
    const [schools, setSchools] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        fetchSchools();
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('investment_transactions')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setTransactions(data || []);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            // Don't alert here to avoid spamming if table doesn't exist yet
        }
    };

    const fetchSchools = async () => {
        setLoading(true);
        try {
            if (!supabase) {
                const savedData = localStorage.getItem('uniform_manager_data');
                if (savedData) {
                    setSchools(JSON.parse(savedData));
                }
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

    const handleAddTransaction = async (newTransaction) => {
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('investment_transactions')
                .insert([newTransaction]);
            if (error) throw error;
            fetchTransactions();
        } catch (err) {
            console.error("Error adding transaction:", err);
            alert("Erro ao registrar movimentação. Verifique se a tabela 'investment_transactions' existe no seu banco de dados.");
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (!window.confirm("Deseja realmente excluir esta movimentação?")) return;
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('investment_transactions')
                .delete()
                .eq('id', transactionId);
            if (error) throw error;
            fetchTransactions();
        } catch (err) {
            console.error("Error deleting transaction:", err);
            alert("Erro ao excluir movimentação.");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;

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
                // For now, reuse Dashboard but with dashboard view props
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
            case 'investment':
                return (
                    <InvestmentFund
                        transactions={transactions}
                        schools={schools}
                        onAddTransaction={handleAddTransaction}
                        onDeleteTransaction={handleDeleteTransaction}
                    />
                );
            default:
                return <div>Selecione uma opção</div>;
        }
    };

    return (
        <div id="root">
            <aside className="sidebar">
                <div className="sidebar-logo">UNIFORM MANAGER</div>

                <nav className="nav-group">
                    <div
                        className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveView('dashboard'); setCurrentPath([]); }}
                    >
                        <LayoutDashboard size={20} />
                        Visão Geral
                    </div>
                    <div
                        className={`nav-item ${activeView === 'schools' ? 'active' : ''}`}
                        onClick={() => { setActiveView('schools'); setCurrentPath([]); }}
                    >
                        <Folders size={20} />
                        Minhas Escolas
                    </div>
                    <div
                        className={`nav-item ${activeView === 'investment' ? 'active' : ''}`}
                        onClick={() => { setActiveView('investment'); setCurrentPath([]); }}
                    >
                        <TrendingUp size={20} />
                        Fundo de Investimento
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <p>© 2026 GESTÃO DE UNIFORMES</p>
                    <p>Versão 2.5.0</p>
                </div>
            </aside>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}
