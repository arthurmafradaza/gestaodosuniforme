import React, { useState } from 'react';
import { Plus, Folder, DollarSign, TrendingUp, Shirt, ChevronRight, Home, Building2, Trash2, Wallet, Calculator, Pencil } from 'lucide-react';
import BudgetCalculator from './BudgetCalculator';

export default function Dashboard({ schools, currentPath, onNavigate, onAddFolder, onDeleteFolder, onUpdateSchool }) {
    // ... existing logic ...

    // [New State]
    const [isBudgetOpen, setIsBudgetOpen] = useState(false);

    // ... existing calculations ...

    // [End of State]

    // [Logic continues below inside the component]
    // currentPath is array of IDs: [] = root, [schoolId] = inside school

    const currentLevel = currentPath.length === 0 ? 'root' : 'school';
    const parentSchool = currentLevel === 'school' ? schools.find(s => s.id === currentPath[0]) : null;

    // Flatten all franchises to calculate global stats
    const allFranchises = schools.flatMap(s => s.franchises || []);

    // Calculate Stats based on current view
    const itemsToStats = currentLevel === 'root' ? allFranchises : (parentSchool?.franchises || []);



    const calculateTotalItems = (inventory) => {
        if (!inventory) return 0;
        let total = 0;
        Object.values(inventory).forEach(prodSizes => {
            total += Object.values(prodSizes).reduce((a, b) => a + b, 0);
        });
        return total;
    };

    const totalItemsCount = itemsToStats.reduce((acc, f) => acc + calculateTotalItems(f.inventory), 0);

    // Helper to calculate financials for a single school (handling overrides)
    const getSchoolFinancials = (school) => {
        if (!school) return { revenue: 0, cost: 0, profit: 0, entryValue: 0, isOverride: false };

        const schoolFranchises = school.franchises || [];
        const franchiseRevenue = schoolFranchises.reduce((acc, f) => acc + (parseFloat(f.financials?.total_value) || 0), 0);
        const franchiseCost = schoolFranchises.reduce((acc, f) => acc + (parseFloat(f.financials?.production_cost) || 0), 0);

        // Entry value is currently only manual at school level, or we could sum it if franchises had it.
        // For now, let's treat it as a manual override or global setting on the school.
        const schoolEntryValue = parseFloat(school.financials?.entry_value || 0);

        const schoolRevenueOverride = parseFloat(school.financials?.total_value || 0);
        const schoolCostOverride = parseFloat(school.financials?.production_cost || 0);

        // Override logic: If override values exist (> 0), use them.
        const hasOverride = schoolRevenueOverride > 0 || schoolCostOverride > 0;

        const revenue = hasOverride ? schoolRevenueOverride : franchiseRevenue;
        const cost = hasOverride ? schoolCostOverride : franchiseCost;

        return {
            revenue,
            cost,
            profit: revenue - cost,
            entryValue: schoolEntryValue,
            isOverride: hasOverride
        };
    };

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalEntryValue = 0;
    let isSchoolOverride = false;

    if (currentLevel === 'root') {
        schools.forEach(school => {
            const stats = getSchoolFinancials(school);
            totalRevenue += stats.revenue;
            totalCost += stats.cost;
            totalEntryValue += stats.entryValue;
        });
        totalProfit = totalRevenue - totalCost;
    } else {
        // Single School View
        const stats = getSchoolFinancials(parentSchool);
        totalRevenue = stats.revenue;
        totalCost = stats.cost;
        totalProfit = stats.profit;
        totalEntryValue = stats.entryValue;
        isSchoolOverride = stats.isOverride;
    }

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

    const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
    const [editingField, setEditingField] = useState(null); // null, 'total_value', 'production_cost', or 'entry_value'
    const [schoolTotalValue, setSchoolTotalValue] = useState('');
    const [schoolProductionCost, setSchoolProductionCost] = useState('');
    const [schoolEntryValueInput, setSchoolEntryValueInput] = useState('');

    // Granular Cost States
    const [costMalha, setCostMalha] = useState('');
    const [costTalhacao, setCostTalhacao] = useState('');
    const [costCostura, setCostCostura] = useState('');
    const [costEmbalagem, setCostEmbalagem] = useState('');
    const [costEstampa, setCostEstampa] = useState('');
    const [costVariavel, setCostVariavel] = useState('');

    const openEditSchoolModal = (field = null) => {
        if (!parentSchool) return;
        setEditingField(field);

        const f = parentSchool.financials || {};
        setSchoolTotalValue(f.total_value || '');
        setSchoolProductionCost(f.production_cost || '');
        setSchoolEntryValueInput(f.entry_value || '');

        // Initialize granular costs
        setCostMalha(f.cost_malha || '');
        setCostTalhacao(f.cost_talhacao || '');
        setCostCostura(f.cost_costura || '');
        setCostEmbalagem(f.cost_embalagem || '');
        setCostEstampa(f.cost_estampa || '');
        setCostVariavel(f.cost_variavel || '');

        setIsEditSchoolModalOpen(true);
    };

    // Auto-calculate total in modal when parts change
    const calculatedTotalCost = (
        parseFloat(costMalha || 0) +
        parseFloat(costTalhacao || 0) +
        parseFloat(costCostura || 0) +
        parseFloat(costEmbalagem || 0) +
        parseFloat(costEstampa || 0) +
        parseFloat(costVariavel || 0)
    );

    const handleSaveSchoolFinancials = (e) => {
        e.preventDefault();

        // If editing production_cost granularly, use the calculated total
        const finalProductionCost = editingField === 'production_cost'
            ? calculatedTotalCost
            : schoolProductionCost;

        onUpdateSchool(parentSchool.id, {
            total_value: schoolTotalValue,
            production_cost: finalProductionCost,
            entry_value: schoolEntryValueInput,
            // Save granular items as well
            cost_malha: costMalha,
            cost_talhacao: costTalhacao,
            cost_costura: costCostura,
            cost_embalagem: costEmbalagem,
            cost_estampa: costEstampa,
            cost_variavel: costVariavel
        });
        setIsEditSchoolModalOpen(false);
    };

    return (
        <div>
            {/* Header & Breadcrumbs */}
            <div className="header">
                <div>
                    <div className="breadcrumb-nav">
                        <span
                            className="breadcrumb-item"
                            onClick={() => onNavigate([])}
                        >
                            <Home size={14} /> Início
                        </span>
                        {parentSchool && (
                            <>
                                <ChevronRight size={14} style={{ opacity: 0.5 }} />
                                <span className="breadcrumb-item" style={{ color: 'var(--primary-light)', background: 'rgba(99, 102, 241, 0.1)' }}>
                                    {parentSchool.name}
                                </span>
                            </>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <h1 className="page-title">
                            {currentLevel === 'root' ? 'Visão Geral' : parentSchool?.name}
                        </h1>
                        {currentLevel === 'school' && (
                            <button className="btn btn-secondary" onClick={() => openEditSchoolModal(null)} style={{ padding: '6px 16px', fontSize: '0.8rem', height: 'auto', borderRadius: '20px' }}>
                                <DollarSign size={14} /> Editar Financeiro
                            </button>
                        )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
                        {currentLevel === 'root'
                            ? 'Gerencie todas as escolas e franquias em um só lugar.'
                            : 'Gerenciamento de unidades desta escola.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* New Budget Button - Ensure visibility */}
                    <button className="btn btn-secondary" onClick={() => setIsBudgetOpen(true)} style={{ whiteSpace: 'nowrap' }}>
                        <Calculator size={20} />
                        Orçamento
                    </button>
                    <button className="btn" onClick={() => setIsModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
                        <Plus size={20} />
                        {currentLevel === 'root' ? 'Nova Escola' : 'Nova Unidade'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div
                    className="card stat-card"
                    onClick={() => currentLevel === 'school' && openEditSchoolModal('total_value')}
                    style={{ cursor: currentLevel === 'school' ? 'pointer' : 'default' }}
                >
                    <div className="stat-label">
                        <DollarSign size={14} style={{ marginRight: '6px', color: '#818cf8' }} />
                        Faturamento
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isSchoolOverride && <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '10px' }}>MANUAL</span>}
                            {currentLevel === 'school' && (
                                <Pencil
                                    size={14}
                                    className="edit-icon"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="stat-value">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <DollarSign className="stat-icon-bg" size={100} color="#818cf8" />
                </div>

                {currentLevel === 'school' && (
                    <div
                        className="card stat-card"
                        onClick={() => openEditSchoolModal('entry_value')}
                        style={{ borderTop: '4px solid #06b6d4', cursor: 'pointer' }}
                    >
                        <div className="stat-label">
                            <DollarSign size={14} style={{ marginRight: '6px', color: '#22d3ee' }} />
                            Valor de Entrada
                            <Pencil
                                size={14}
                                className="edit-icon"
                                style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}
                            />
                        </div>
                        <div className="stat-value" style={{ background: 'none', color: '#67e8f9', webkitTextFillColor: 'initial' }}>
                            R$ {totalEntryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <DollarSign className="stat-icon-bg" size={100} color="#06b6d4" />
                    </div>
                )}

                <div
                    className="card stat-card"
                    onClick={() => currentLevel === 'school' && openEditSchoolModal('production_cost')}
                    style={{ borderTop: '4px solid #ef4444', cursor: currentLevel === 'school' ? 'pointer' : 'default' }}
                >
                    <div className="stat-label">
                        <Wallet size={14} style={{ marginRight: '6px', color: '#f87171' }} />
                        Custos
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isSchoolOverride && <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '10px' }}>MANUAL</span>}
                            {currentLevel === 'school' && (
                                <Pencil
                                    size={14}
                                    className="edit-icon"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="stat-value" style={{ background: 'none', color: '#fca5a5', webkitTextFillColor: 'initial' }}>
                        R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <Wallet className="stat-icon-bg" size={100} color="#ef4444" />
                </div>

                <div className="card stat-card" style={{ borderTop: '4px solid #10b981' }}>
                    <div className="stat-label">
                        <TrendingUp size={14} style={{ marginRight: '6px', color: '#34d399' }} />
                        Lucro Líquido
                    </div>
                    <div className="stat-value" style={{ background: 'none', color: '#6ee7b7', webkitTextFillColor: 'initial' }}>
                        R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <TrendingUp className="stat-icon-bg" size={100} color="#10b981" />
                </div>

                <div className="card stat-card" style={{ borderTop: '4px solid #ec4899' }}>
                    <div className="stat-label">
                        <Shirt size={14} style={{ marginRight: '6px', color: '#f472b6' }} />
                        Produção
                    </div>
                    <div className="stat-value" style={{ background: 'none', color: '#f9a8d4', webkitTextFillColor: 'initial' }}>
                        {totalItemsCount} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#fbcfe8' }}>peças</span>
                    </div>
                    <Shirt className="stat-icon-bg" size={100} color="#ec4899" />
                </div>
            </div>

            {/* Folder Grid */}
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentLevel === 'root' ? <Building2 color="var(--primary)" /> : <Folder color="var(--accent)" />}
                {currentLevel === 'root' ? 'Escolas Cadastradas' : 'Unidades da Franquia'}
            </h2>

            {itemsToDisplay.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Folder size={32} opacity={0.5} />
                    </div>
                    <p>Nenhuma {currentLevel === 'root' ? 'escola' : 'unidade'} encontrada.</p>
                    <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '1rem' }}>
                        Criar Agora
                    </button>
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
                            title="Excluir"
                        >
                            <Trash2 size={16} />
                        </button>

                        {currentLevel === 'root' ?
                            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', marginBottom: '1rem' }}>
                                <Building2 size={32} color="#818cf8" />
                            </div>
                            :
                            <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', marginBottom: '1rem' }}>
                                <Folder size={32} color="#f472b6" />
                            </div>
                        }

                        <div>
                            <div className="folder-title">{item.name}</div>
                            <div className="folder-meta">
                                {currentLevel === 'root'
                                    ? <><Folder size={12} /> {item.franchises?.length || 0} unidades</>
                                    : <><Shirt size={12} /> {calculateTotalItems(item.inventory)} peças</>
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>{currentLevel === 'root' ? 'Nova Escola' : 'Nova Unidade'}</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>Nome da Identificação</label>
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

            {isEditSchoolModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditSchoolModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>{editingField ? `Editar ${editingField === 'total_value' ? 'Faturamento' : editingField === 'entry_value' ? 'Valor de Entrada' : 'Custos'}` : 'Editar Financeiro da Escola'}</h3>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#fbbf24' }}>
                                <strong>Atenção:</strong> Ao definir valores aqui, o sistema ignorará a soma automática das unidades e usará estes valores fixos.
                            </p>
                        </div>
                        <form onSubmit={handleSaveSchoolFinancials}>
                            {(editingField === null || editingField === 'total_value') && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>Faturamento Total (Contrato)</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}>R$</span>
                                        <input
                                            type="number"
                                            className="input"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={schoolTotalValue}
                                            onChange={e => setSchoolTotalValue(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}
                            {(editingField === null || editingField === 'entry_value') && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>Valor de Entrada (Sinal)</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}>R$</span>
                                        <input
                                            type="number"
                                            className="input"
                                            style={{ paddingLeft: '2.5rem' }}
                                            value={schoolEntryValueInput}
                                            onChange={e => setSchoolEntryValueInput(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}
                            {(editingField === null || editingField === 'production_cost') && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', paddingBottom: '4px' }}>
                                        Detalhamento de Custos
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        {[
                                            { label: 'Malha', state: costMalha, setter: setCostMalha },
                                            { label: 'Talhação', state: costTalhacao, setter: setCostTalhacao },
                                            { label: 'Costura', state: costCostura, setter: setCostCostura },
                                            { label: 'Embalagem', state: costEmbalagem, setter: setCostEmbalagem },
                                            { label: 'Estampa/DTF', state: costEstampa, setter: setCostEstampa },
                                            { label: 'Custo Variável', state: costVariavel, setter: setCostVariavel }
                                        ].map(field => (
                                            <div key={field.label}>
                                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{field.label}</label>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '8px', top: '8px', color: '#64748b', fontSize: '0.8rem' }}>R$</span>
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        style={{ paddingLeft: '2rem', paddingVertical: '0.5rem', fontSize: '0.9rem' }}
                                                        value={field.state}
                                                        onChange={e => field.setter(e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Total Calculado:</span>
                                        <span style={{ fontWeight: 800, color: '#10b981' }}>R$ {calculatedTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <input type="hidden" value={schoolProductionCost} />
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsEditSchoolModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isBudgetOpen && (
                <BudgetCalculator onClose={() => setIsBudgetOpen(false)} />
            )}
        </div>
    );
}
