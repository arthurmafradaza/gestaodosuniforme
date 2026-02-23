import React, { useState } from 'react';
import { Plus, Folder, DollarSign, TrendingUp, Shirt, ChevronRight, Home, Building2, Trash2, Wallet, Calculator, Pencil, Check, X } from 'lucide-react';
import BudgetCalculator from './BudgetCalculator';

export default function Dashboard({ schools, currentPath, onNavigate, onAddFolder, onDeleteFolder, onUpdateSchool, onRenameSchool, isEmbedded = false }) {
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
        // Single School OR List View
        const stats = getSchoolFinancials(parentSchool);
        totalRevenue = stats.revenue;
        totalCost = stats.cost;
        totalProfit = stats.profit;
        totalEntryValue = stats.entryValue;
        isSchoolOverride = stats.isOverride;
    }

    // --- Analytics Data Calculation ---
    const getGlobalCostBreakdown = () => {
        let malha = 0, talhacao = 0, costura = 0, embalagem = 0, estampa = 0, variavel = 0;
        schools.forEach(s => {
            const f = s.financials || {};
            malha += parseFloat(f.cost_malha || 0);
            talhacao += parseFloat(f.cost_talhacao || 0);
            costura += parseFloat(f.cost_costura || 0);
            embalagem += parseFloat(f.cost_embalagem || 0);
            estampa += parseFloat(f.cost_estampa || 0);
            variavel += parseFloat(f.cost_variavel || 0);
        });
        const total = malha + talhacao + costura + embalagem + estampa + variavel;
        return { total, malha, talhacao, costura, embalagem, estampa, variavel };
    };

    const costData = getGlobalCostBreakdown();
    const productionBySchool = schools.map(s => ({
        name: s.name,
        count: (s.franchises || []).reduce((acc, f) => acc + calculateTotalItems(f.inventory), 0)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // --- Components ---
    const DonutChart = ({ data }) => {
        const total = data.total || 1;
        const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];
        const segments = [
            { label: 'Malha', val: data.malha },
            { label: 'Talhação', val: data.talhacao },
            { label: 'Costura', val: data.costura },
            { label: 'Embalagem', val: data.embalagem },
            { label: 'Estampa', val: data.estampa },
            { label: 'Variável', val: data.variavel }
        ].filter(s => s.val > 0);

        let currentOffset = 0;
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const hasData = segments.length > 0;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'center' }}>
                <div className="donut-container">
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        {!hasData ? (
                            <circle
                                cx="50" cy="50" r={radius}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="12"
                                fill="transparent"
                            />
                        ) : (
                            segments.map((s, i) => {
                                const percent = (s.val / total);
                                const dashArrayValue = percent * circumference;
                                const offset = (currentOffset / 100) * circumference;

                                const segment = (
                                    <circle
                                        key={i}
                                        className="donut-segment"
                                        cx="50" cy="50" r={radius}
                                        stroke={colors[i % colors.length]}
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={`${dashArrayValue} ${circumference}`}
                                        style={{
                                            strokeDashoffset: -offset,
                                            transition: 'all 0.5s ease'
                                        }}
                                    />
                                );
                                currentOffset += (percent * 100);
                                return segment;
                            })
                        )}
                        <circle cx="50" cy="50" r="32" fill="#1e293b" />
                    </svg>
                    <div className="progress-text" style={{ pointerEvents: 'none', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '2px' }}>Total</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
                            R$ {data.total >= 1000 ? (data.total / 1000).toFixed(1) + 'k' : data.total.toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="chart-legend">
                    {!hasData ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aguardando dados...</p>
                    ) : (
                        segments.map((s, i) => (
                            <div key={i} className="legend-item" style={{ gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="legend-color" style={{ background: colors[i % colors.length], width: '10px', height: '100%', borderRadius: '2px' }} />
                                    <span style={{ fontSize: '0.85rem' }}>{s.label}</span>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>R$ {s.val.toLocaleString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const BarChart = ({ data }) => {
        const hasData = data.some(d => d.count > 0);
        const max = Math.max(...data.map(d => d.count), 1);

        if (!hasData) {
            return (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Aguardando lançamento de produção...
                </div>
            );
        }

        return (
            <div className="bar-chart">
                {data.filter(d => d.count > 0).map((d, i) => (
                    <div
                        key={i}
                        className="bar-item"
                        style={{ height: `${(d.count / max) * 100}%` }}
                    >
                        <span className="bar-value">{d.count}</span>
                        <span className="bar-label">{d.name}</span>
                    </div>
                ))}
            </div>
        );
    };

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
    const [schoolPaymentTerms, setSchoolPaymentTerms] = useState('');
    const [schoolPaymentHistory, setSchoolPaymentHistory] = useState('');

    // Granular Cost States
    const [costMalha, setCostMalha] = useState('');
    const [costTalhacao, setCostTalhacao] = useState('');
    const [costCostura, setCostCostura] = useState('');
    const [costEmbalagem, setCostEmbalagem] = useState('');
    const [costEstampa, setCostEstampa] = useState('');
    const [costVariavel, setCostVariavel] = useState('');

    // School Renaming State
    const [isRenamingSchool, setIsRenamingSchool] = useState(false);
    const [schoolNameEditValue, setSchoolNameEditValue] = useState('');

    const openEditSchoolModal = (field = null) => {
        if (!parentSchool) return;
        setEditingField(field);

        const f = parentSchool.financials || {};
        setSchoolTotalValue(f.total_value || '');
        setSchoolProductionCost(f.production_cost || '');
        setSchoolEntryValueInput(f.entry_value || '');
        setSchoolPaymentTerms(f.payment_terms || '');
        setSchoolPaymentHistory(f.payment_history || '');

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
            payment_terms: schoolPaymentTerms,
            payment_history: schoolPaymentHistory,
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

    const handleSaveSchoolName = (e) => {
        e.preventDefault();
        if (!schoolNameEditValue || !parentSchool) return;
        onRenameSchool(parentSchool.id, schoolNameEditValue);
        setIsRenamingSchool(false);
    };

    return (
        <div>
            {/* Header & Breadcrumbs */}
            {/* Main Layout Toggling */}
            {isEmbedded ? (
                /* ANALYTICS VIEW (Visão Geral) */
                <div className="analytics-view">
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Painel Executivo</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Monitoramento de saúde financeira e fluxo de produção.</p>
                    </div>

                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2.5rem' }}>
                        <div className="card stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
                            <div className="stat-label"><DollarSign size={14} style={{ marginRight: '6px' }} /> FATURAMENTO</div>
                            <div className="stat-value">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div className="stat-icon-bg"><DollarSign size={80} /></div>
                        </div>
                        <div className="card stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                            <div className="stat-label"><TrendingUp size={14} style={{ marginRight: '6px' }} /> CUSTO TOTAL</div>
                            <div className="stat-value">R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div className="stat-icon-bg"><TrendingUp size={80} /></div>
                        </div>
                        <div className="card stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                            <div className="stat-label"><Wallet size={14} style={{ marginRight: '6px' }} /> LUCRO LÍQUIDO</div>
                            <div className="stat-value" style={{ color: '#10b981' }}>R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div className="stat-icon-bg"><Wallet size={80} /></div>
                        </div>
                        <div className="card stat-card" style={{ borderLeft: '4px solid #ec4899' }}>
                            <div className="stat-label"><Shirt size={14} style={{ marginRight: '6px' }} /> EM PRODUÇÃO</div>
                            <div className="stat-value">{totalItemsCount.toLocaleString()} <span style={{ fontSize: '1rem', opacity: 0.6 }}>PÇS</span></div>
                            <div className="stat-icon-bg"><Shirt size={80} /></div>
                        </div>
                    </div>

                    <div className="analytics-container">
                        <div className="card chart-card">
                            <h3 className="stat-label" style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>DRE - COMPOSIÇÃO DE CUSTOS</h3>
                            <DonutChart data={costData} />
                        </div>
                        <div className="card chart-card">
                            <h3 className="stat-label" style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>PRODUÇÃO POR ESCOLA (TOP 5)</h3>
                            <BarChart data={productionBySchool} />
                        </div>
                    </div>
                </div>
            ) : (
                /* MANAGEMENT VIEW (Minhas Escolas / Unidades) */
                <div className="management-view">
                    <div className="header" style={{ flexDirection: 'row', alignItems: 'flex-start', borderBottom: 'none', marginBottom: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <div className="breadcrumb-nav">
                                <span className="breadcrumb-item" onClick={() => onNavigate([])}><Home size={14} /> Início</span>
                                {parentSchool && (
                                    <>
                                        <ChevronRight size={14} style={{ opacity: 0.5 }} />
                                        <span className="breadcrumb-item" style={{ color: 'var(--primary-light)', background: 'rgba(99, 102, 241, 0.1)' }}>{parentSchool.name}</span>
                                    </>
                                )}
                            </div>

                            {currentLevel === 'school' && isRenamingSchool ? (
                                <form onSubmit={handleSaveSchoolName} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                                    <input
                                        autoFocus
                                        className="input"
                                        style={{ fontSize: '1.5rem', fontWeight: 700, padding: '4px 12px', width: '300px' }}
                                        value={schoolNameEditValue}
                                        onChange={e => setSchoolNameEditValue(e.target.value)}
                                        onKeyDown={e => e.key === 'Escape' && setIsRenamingSchool(false)}
                                    />
                                    <button type="submit" className="btn-icon" style={{ color: 'var(--success)' }}><Check size={20} /></button>
                                    <button type="button" className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setIsRenamingSchool(false)}><X size={20} /></button>
                                </form>
                            ) : (
                                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {currentLevel === 'root' ? 'Gestão de Escolas' : parentSchool?.name}
                                    {currentLevel === 'school' && (
                                        <button
                                            onClick={() => {
                                                setIsRenamingSchool(true);
                                                setSchoolNameEditValue(parentSchool.name);
                                            }}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                                            title="Renomear Escola"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    )}
                                </h1>
                            )}
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{currentLevel === 'root' ? 'Organize e gerencie suas instituições parceiras' : 'Unidades e faturamento desta escola.'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button className="btn btn-secondary" onClick={() => setIsBudgetOpen(true)}><Calculator size={20} /> Orçamento</button>
                            <button className="btn" onClick={() => setIsModalOpen(true)}><Plus size={20} /> {currentLevel === 'root' ? 'Nova Escola' : 'Nova Unidade'}</button>
                        </div>
                    </div>

                    {/* Stats mini-cards for school view */}
                    {currentLevel === 'school' && (
                        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
                            <div className="card stat-card" onClick={() => openEditSchoolModal('total_value')} style={{ cursor: 'pointer', borderLeft: '4px solid #6366f1' }}>
                                <div className="stat-label">FATURAMENTO <Pencil size={12} style={{ marginLeft: 'auto' }} /></div>
                                <div className="stat-value">R$ {totalRevenue.toLocaleString()}</div>
                            </div>
                            <div className="card stat-card" onClick={() => openEditSchoolModal('entry_value')} style={{ cursor: 'pointer', borderLeft: '4px solid #06b6d4' }}>
                                <div className="stat-label">VALOR ENTRADA <Pencil size={12} style={{ marginLeft: 'auto' }} /></div>
                                <div className="stat-value">R$ {totalEntryValue.toLocaleString()}</div>
                            </div>
                            <div className="card stat-card" onClick={() => openEditSchoolModal('production_cost')} style={{ cursor: 'pointer', borderLeft: '4px solid #ef4444' }}>
                                <div className="stat-label">CUSTO <Pencil size={12} style={{ marginLeft: 'auto' }} /></div>
                                <div className="stat-value">R$ {totalCost.toLocaleString()}</div>
                            </div>
                            <div className="card stat-card" style={{ borderLeft: '4px solid #ec4899' }}>
                                <div className="stat-label">PRODUÇÃO</div>
                                <div className="stat-value">{totalItemsCount} <span style={{ fontSize: '0.8rem' }}>PÇS</span></div>
                            </div>
                        </div>
                    )}

                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {currentLevel === 'root' ? <Building2 size={18} /> : <Folder size={18} />}
                        {currentLevel === 'root' ? 'Instituições Cadastradas' : 'Unidades desta Franquia'}
                    </h2>

                    {itemsToDisplay.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.1)' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Folder size={32} opacity={0.5} />
                            </div>
                            <p>Nenhuma {currentLevel === 'root' ? 'escola' : 'unidade'} encontrada.</p>
                        </div>
                    ) : (
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
                                        {currentLevel === 'root' && (
                                            <div className="folder-stats">
                                                <div className="mini-badge revenue" title="Faturamento">
                                                    <DollarSign size={10} /> R$ {getSchoolFinancials(item).revenue.toLocaleString()}
                                                </div>
                                                <div className="mini-badge cost" title="Custos">
                                                    <TrendingUp size={10} /> R$ {getSchoolFinancials(item).cost.toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
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

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Acordo de Pagamento</label>
                                        <textarea
                                            className="input"
                                            style={{ minHeight: '80px', resize: 'vertical', fontSize: '0.9rem' }}
                                            value={schoolPaymentTerms}
                                            onChange={e => setSchoolPaymentTerms(e.target.value)}
                                            placeholder="Ex: 50% entrada + 2x boleto 30/60 dias"
                                        />
                                    </div>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Histórico de Recebimento</label>
                                        <textarea
                                            className="input"
                                            style={{ minHeight: '80px', resize: 'vertical', fontSize: '0.9rem' }}
                                            value={schoolPaymentHistory}
                                            onChange={e => setSchoolPaymentHistory(e.target.value)}
                                            placeholder="Ex: 23/02 - R$ 500,00 via PIX"
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
