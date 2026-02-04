import React, { useState } from 'react';
import { Plus, Folder, DollarSign, TrendingUp, Shirt, ChevronRight, Home, Building2, Trash2 } from 'lucide-react';

export default function Dashboard({ schools, currentPath, onNavigate, onAddFolder, onDeleteFolder }) {
    // currentPath is array of IDs: [] = root, [schoolId] = inside school

    const currentLevel = currentPath.length === 0 ? 'root' : 'school';
    const parentSchool = currentLevel === 'school' ? schools.find(s => s.id === currentPath[0]) : null;

    // Flatten all franchises to calculate global stats
    const allFranchises = schools.flatMap(s => s.franchises || []);

    // Calculate Stats based on current view
    const itemsToStats = currentLevel === 'root' ? allFranchises : (parentSchool?.franchises || []);

    const totalRevenue = itemsToStats.reduce((acc, f) => acc + (parseFloat(f.financials?.total_value) || 0), 0);
    const totalCost = itemsToStats.reduce((acc, f) => acc + (parseFloat(f.financials?.production_cost) || 0), 0);
    const totalProfit = totalRevenue - totalCost;

    const calculateTotalItems = (inventory) => {
        if (!inventory) return 0;
        let total = 0;
        Object.values(inventory).forEach(prodSizes => {
            total += Object.values(prodSizes).reduce((a, b) => a + b, 0);
        });
        return total;
    };

    const totalItemsCount = itemsToStats.reduce((acc, f) => acc + calculateTotalItems(f.inventory), 0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName) return;
        await onAddFolder(newName);
        setNewName('');
        setIsModalOpen(false);
    };

    const itemsToDisplay = currentLevel === 'root' ? schools : (parentSchool?.franchises || []);

    return (
        <div>
            {/* Header & Breadcrumbs */}
            <div className="header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                        <span
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => onNavigate([])}
                        >
                            <Home size={14} /> Início
                        </span>
                        {parentSchool && (
                            <>
                                <ChevronRight size={14} />
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{parentSchool.name}</span>
                            </>
                        )}
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>
                        {currentLevel === 'root' ? 'Todas as Escolas' : `Unidades: ${parentSchool?.name}`}
                    </h1>
                </div>
                <button className="btn" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    {currentLevel === 'root' ? 'Nova Escola' : 'Nova Unidade'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-label">Faturamento {currentLevel === 'school' ? 'da Escola' : 'Total'}</div>
                    <div className="stat-value">R$ {totalRevenue.toFixed(2)}</div>
                    <DollarSign className="absolute top-4 right-4 text-gray-200" size={40} strokeWidth={1} />
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Lucro {currentLevel === 'school' ? 'da Escola' : 'Total'}</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>R$ {totalProfit.toFixed(2)}</div>
                    <TrendingUp className="absolute top-4 right-4 text-green-100" size={40} strokeWidth={1} />
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Peças para Produzir</div>
                    <div className="stat-value" style={{ color: '#ec4899' }}>{totalItemsCount}</div>
                    <Shirt className="absolute top-4 right-4 text-pink-100" size={40} strokeWidth={1} />
                </div>
            </div>

            {/* Folder Grid */}
            <h2 style={{ marginBottom: '1.5rem' }}>{currentLevel === 'root' ? 'Escolas' : 'Franquias / Unidades'}</h2>

            {itemsToDisplay.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    Nenhuma {currentLevel === 'root' ? 'escola' : 'unidade'} cadastrada.
                </div>
            )}

            <div className="grid-folders">
                {itemsToDisplay.map((item) => (
                    <div
                        key={item.id}
                        className="card folder"
                        onClick={() => onNavigate(currentLevel === 'root' ? [item.id] : [...currentPath, item.id])}
                    >
                        <button
                            className="delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Tem certeza que deseja excluir?')) onDeleteFolder(item.id);
                            }}
                        >
                            <Trash2 size={16} />
                        </button>

                        {currentLevel === 'root' ?
                            <Folder className="folder-icon" strokeWidth={1.5} /> :
                            <Building2 className="folder-icon" strokeWidth={1.5} color="#ec4899" />
                        }
                        <div className="folder-title">{item.name}</div>

                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                            {currentLevel === 'root'
                                ? `${item.franchises?.length || 0} unidades`
                                : `${calculateTotalItems(item.inventory)} itens`
                            }
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>{currentLevel === 'root' ? 'Nova Escola' : 'Nova Unidade'}</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nome</label>
                                <input
                                    autoFocus
                                    className="input"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder={currentLevel === 'root' ? "Ex: Colégio Santa Maria" : "Ex: Unidade Centro"}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn">Criar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
