import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SchoolEditor from './components/SchoolEditor';
import { supabase } from './supabaseClient';

export default function App() {
    const [currentPath, setCurrentPath] = useState([]); // [] = root, [schoolId] = school view, [schoolId, franchiseId] = editor
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            if (!supabase) {
                // If no supabase key, fallback to local (dev mode without keys)
                const savedData = localStorage.getItem('uniform_manager_data');
                if (savedData) {
                    setSchools(JSON.parse(savedData));
                }
                setLoading(false);
                return;
            }

            // Fetch schools with their franchises
            const { data, error } = await supabase
                .from('schools')
                .select('*, franchises(*)');

            if (error) throw error;

            // Sort to keep order consistent
            const sortedData = (data || []).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));

            // Sort franchises within schools
            const schoolsWithSortedFranchises = sortedData.map(school => ({
                ...school,
                franchises: (school.franchises || []).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
            }));

            setSchools(schoolsWithSortedFranchises);
        } catch (err) {
            console.error("Error fetching data:", err);
            // Fallback to empty if error? Or keep previous state.
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path) => {
        setCurrentPath(path);
    };

    const handleAddFolder = async (name) => {
        if (!name) return;

        try {
            if (!supabase) {
                // Local Fallback Logic
                // ... (Previous local logic if needed, but assuming user wants supabase)
                alert("Configure as chaves do Supabase no arquivo .env para salvar na nuvem.");
                return;
            }

            // If at Root -> Add School
            if (currentPath.length === 0) {
                const { error } = await supabase
                    .from('schools')
                    .insert([{ name }]);

                if (error) throw error;
                fetchSchools();
            }
            // If at School -> Add Franchise
            else if (currentPath.length === 1) {
                const schoolId = currentPath[0];
                const { error } = await supabase
                    .from('franchises')
                    .insert([{
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

            fetchSchools(); // Refresh data
            // Go back up one level
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

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza? Essa ação não pode ser desfeita.")) return;

        try {
            if (!supabase) {
                alert("Configure as chaves do Supabase para excluir.");
                return;
            }

            // Determine if we are deleting a school (root View) or franchise (School View OR Editor View)
            let table = '';

            // Logic:
            // If currentPath is empty, we are at root, deleting a School (from the card click)
            if (currentPath.length === 0) {
                table = 'schools';
            }
            // If currentPath has 1 item, we are inside a school, deleting a Franchise (card)
            else if (currentPath.length === 1) {
                table = 'franchises';
            }
            // If currentPath has 2 items, we are inside editor, deleting the CURRENT Franchise
            else if (currentPath.length === 2) {
                table = 'franchises';
            }

            if (!table) return;

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;

            // If we were in editor, go back
            if (currentPath.length === 2) {
                setCurrentPath([currentPath[0]]);
            }

            fetchSchools();

        } catch (err) {
            console.error("Error deleting:", err);
            alert("Erro ao excluir: " + err.message);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;

    // Render View Logic
    // 1. Root Dashboard
    if (currentPath.length === 0) {
        return <Dashboard
            schools={schools}
            currentPath={[]}
            onNavigate={handleNavigate}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDelete}
            onUpdateSchool={handleUpdateSchool}
        />;
    }

    // 2. School Dashboard (Franchise List)
    if (currentPath.length === 1) {
        return <Dashboard
            schools={schools}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDelete}
            onUpdateSchool={handleUpdateSchool}
        />;
    }

    // 3. Editor (Franchise Detail)
    if (currentPath.length === 2) {
        const school = schools.find(s => s.id === currentPath[0]);
        const franchise = school?.franchises.find(f => f.id === currentPath[1]);

        if (!franchise) return <div>Erro: Franquia não encontrada (Recarregue a página)</div>;

        return <SchoolEditor
            school={school}
            franchise={franchise}
            onSave={handleSaveFranchise}
            onBack={() => setCurrentPath([school.id])}
            onDelete={handleDelete}
        />;
    }

    return <div>Estado desconhecido</div>;
}
