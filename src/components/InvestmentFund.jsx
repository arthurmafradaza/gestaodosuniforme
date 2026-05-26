import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Building2, Calendar, Plus, X, Trash2 } from 'lucide-react';

export default function InvestmentFund({ transactions, schools, onAddTransaction, onDeleteTransaction }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [type, setType] = useState('in'); // 'in' or 'out'
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [sourceSchoolId, setSourceSchoolId] = useState('');
    const [category, setCategory] = useState('reinvestment');

    const totalIn = transactions.filter(t => t.type === 'in').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const totalOut = transactions.filter(t => t.type === 'out').reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const balance = totalIn - totalOut;
    const target = 27000; // Example target
    const progress = Math.min((balance / target) * 100, 100);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddTransaction({
            amount: parseFloat(amount),
            type,
            description,
            source_school_id: sourceSchoolId || null,
            category,
            created_at: new Date().toISOString()
        });
        setIsModalOpen(false);
        setAmount('');
        setDescription('');
        setSourceSchoolId('');
    };

    return (
        <div className="investment-fund-view">
            <h1 className="page-title">Fundo de Investimento</h1>
            <p style={{ color: 'var(--text-muted)' }}>Traceabilidade total de capital de giro e aportes por escola.</p>

            <div className="analytics-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
                {/* Main Fund Display */}
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div className="circular-progress" style={{ width: '180px', height: '180px' }}>
                        <svg viewBox="0 0 214 214">
                            <circle cx="107" cy="107" r="95" strokeWidth="12" fill="none" stroke="rgba(255,255,255,0.05)" />
                            <circle
                                className="progress-bar"
                                cx="107" cy="107" r="95"
                                strokeWidth="12"
                                fill="none"
                                stroke="var(--primary)"
                                strokeDasharray="597"
                                strokeDashoffset={597 * (1 - progress / 100)}
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                        </svg>
                        <div className="progress-text">
                            <span className="progress-percentage" style={{ fontSize: '2.5rem' }}>{Math.round(progress)}%</span>
                            <span className="progress-label" style={{ fontSize: '0.7rem' }}>Meta</span>
                        </div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '2rem', margin: '1rem 0' }}>
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button className="btn" style={{ flex: 1 }} onClick={() => { setType('in'); setIsModalOpen(true); }}>
                            <ArrowUpRight size={18} /> Entrada
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setType('out'); setIsModalOpen(true); }}>
                            <ArrowDownRight size={18} /> Saída
                        </button>
                    </div>
                </div>

                {/* Legend / Quick Stats */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Resumo de Fluxo</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Entradas</span>
                            <span style={{ color: '#10b981', fontWeight: 800 }}>R$ {totalIn.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Saídas</span>
                            <span style={{ color: '#ef4444', fontWeight: 800 }}>- R$ {totalOut.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Saldo Atual</span>
                            <span style={{ fontWeight: 800, color: 'white' }}>R$ {balance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Histórico de Movimentações</h3>
                {transactions.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhuma movimentação registrada.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Data</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Descrição</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Origem/Destino</th>
                                    <th style={{ textAlign: 'right', padding: '1rem' }}>Valor</th>
                                    <th style={{ textAlign: 'right', padding: '1rem' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((t, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                                <Calendar size={14} opacity={0.5} />
                                                {new Date(t.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{t.description}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {t.source_school_id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                                                    <Building2 size={14} />
                                                    {schools.find(s => s.id === t.source_school_id)?.name || 'Escola Removida'}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem italic' }}>Geral</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: t.type === 'in' ? '#10b981' : '#ef4444' }}>
                                            {t.type === 'in' ? '+' : '-'} R$ {parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => onDeleteTransaction(t.id)}
                                                style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px' }}
                                                title="Excluir movimentação"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for New Transaction */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>{type === 'in' ? 'Nova Entrada' : 'Nova Saída'}</h3>
                            <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="stat-label">Valor (R$)</label>
                                <input
                                    type="number"
                                    className="input"
                                    required
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="stat-label">Descrição</label>
                                <input
                                    type="text"
                                    className="input"
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Ex: Lucro Colégio Beth"
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="stat-label">Fonte (Escola)</label>
                                <select
                                    className="input"
                                    value={sourceSchoolId}
                                    onChange={e => setSourceSchoolId(e.target.value)}
                                >
                                    <option value="">Nenhuma / Geral</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="stat-label">Categoria</label>
                                <select
                                    className="input"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option value="reinvestment">Reinvestimento</option>
                                    <option value="material">Compra de Material</option>
                                    <option value="labor">Mão de Obra</option>
                                    <option value="other">Outros</option>
                                </select>
                            </div>
                            <button type="submit" className="btn" style={{ width: '100%' }}>
                                Registrar {type === 'in' ? 'Entrada' : 'Saída'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
