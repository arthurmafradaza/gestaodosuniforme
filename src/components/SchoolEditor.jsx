import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Calculator, Edit2, Check, X } from 'lucide-react';

const PRODUCT_OPTIONS = ['Camisetas', 'Bermudas', 'Shorts Saia', 'Moletom', 'Calça'];

export default function SchoolEditor({ school, franchise, onSave, onBack, onDelete }) {
    const [formData, setFormData] = useState({
        name: franchise.name || '',
        inventory: franchise.inventory || {},
        financials: franchise.financials || {}
    });

    const [isDirty, setIsDirty] = useState(false);

    // Local state for the "Add Item" form
    const [newItemProduct, setNewItemProduct] = useState('');
    const [newItemSize, setNewItemSize] = useState('');
    const [newItemQty, setNewItemQty] = useState('');

    // Editing State
    const [editingItem, setEditingItem] = useState(null); // { product, size }
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        setFormData({
            name: franchise.name || '',
            inventory: franchise.inventory || {},
            financials: franchise.financials || {}
        });
    }, [franchise]);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemProduct || !newItemSize || !newItemQty) return;

        const qty = parseInt(newItemQty);
        if (isNaN(qty) || qty <= 0) return;

        // Ensure inventory structure exists
        const currentInventory = formData.inventory || {};
        const productInventory = currentInventory[newItemProduct] || {};
        const currentQty = productInventory[newItemSize] || 0;

        const newQty = currentQty + qty;

        setFormData(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                [newItemProduct]: {
                    ...(prev.inventory[newItemProduct] || {}),
                    [newItemSize]: newQty
                }
            }
        }));

        setIsDirty(true);
        setNewItemSize('');
        setNewItemQty('');
        // Keep product selected for faster entry of next size
    };

    const handleRemoveItem = (product, size) => {
        const newInventory = { ...formData.inventory };
        if (newInventory[product]) {
            const newSizes = { ...newInventory[product] };
            delete newSizes[size];
            if (Object.keys(newSizes).length === 0) {
                delete newInventory[product];
            } else {
                newInventory[product] = newSizes;
            }
            setFormData(prev => ({ ...prev, inventory: newInventory }));
            setIsDirty(true);
        }
    };

    const handleEditStart = (product, size, currentQty) => {
        setEditingItem({ product, size });
        setEditValue(currentQty.toString());
    };

    const handleEditSave = () => {
        if (!editingItem) return;

        const { product, size } = editingItem;
        const newQty = parseInt(editValue);

        if (isNaN(newQty) || newQty <= 0) {
            alert("Quantidade inválida");
            return;
        }

        setFormData(prev => ({
            ...prev,
            inventory: {
                ...prev.inventory,
                [product]: {
                    ...(prev.inventory[product] || {}),
                    [size]: newQty
                }
            }
        }));

        setIsDirty(true);
        setEditingItem(null);
        setEditValue('');
    };

    const handleEditCancel = () => {
        setEditingItem(null);
        setEditValue('');
    };

    const handleFinancialChange = (e) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                financials: { ...prev.financials, [name]: value }
            }));
            setIsDirty(true);
        }
    };

    const handleNameChange = (e) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...franchise, ...formData });
        setIsDirty(false);
    };

    // Calculations
    const revenue = parseFloat(formData.financials.total_value) || 0;
    const cost = parseFloat(formData.financials.production_cost) || 0;
    const profit = revenue - cost;

    const calculateProductTotal = (product) => {
        const sizes = formData.inventory[product] || {};
        return Object.values(sizes).reduce((acc, qty) => acc + (parseInt(qty) || 0), 0);
    };

    const currentProducts = Object.keys(formData.inventory);
    const totalItems = currentProducts.reduce((acc, prod) => acc + calculateProductTotal(prod), 0);

    return (
        <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={onBack}>
                        <ArrowLeft size={18} /> Voltar
                    </button>
                    <div>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{school.name} / </span>
                        <span style={{ fontWeight: 600 }}>{formData.name}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {franchise.id && (
                        <button className="btn btn-secondary" style={{ color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => onDelete(franchise.id)}>
                            <Trash2 size={18} /> Excluir Unidade
                        </button>
                    )}
                    <button className="btn" onClick={handleSubmit} disabled={!isDirty}>
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>NOME DA UNIDADE / FRANQUIA</label>
                    <input
                        className="input"
                        style={{ fontSize: '1.5rem', fontWeight: 600 }}
                        name="name"
                        value={formData.name || ''}
                        onChange={handleNameChange}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                    {/* Products Section */}
                    <div>
                        <div style={{ borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>
                                Produção ({totalItems} itens)
                            </h3>
                        </div>

                        {/* Add Item Form */}
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: '#64748b' }}>PRODUTO</label>
                                    <select
                                        className="input"
                                        value={newItemProduct}
                                        onChange={e => setNewItemProduct(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {PRODUCT_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: '#64748b' }}>TAMANHO</label>
                                    <input
                                        className="input"
                                        placeholder="Ex: 10, GG..."
                                        value={newItemSize}
                                        onChange={e => setNewItemSize(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: '#64748b' }}>QTD</label>
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="0"
                                        value={newItemQty}
                                        onChange={e => setNewItemQty(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleAddItem}
                                    disabled={!newItemProduct || !newItemSize || !newItemQty}
                                >
                                    + Adicionar
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {currentProducts.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
                                    Nenhum item adicionado.
                                </div>
                            )}

                            {currentProducts.map(product => {
                                const sizes = formData.inventory[product] || {};
                                // Sort sizes logically if possible, otherwise alpha
                                const sizeKeys = Object.keys(sizes).sort((a, b) => {
                                    const numA = parseInt(a);
                                    const numB = parseInt(b);
                                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                                    return a.localeCompare(b);
                                });

                                return (
                                    <div key={product} className="product-row" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#334155' }}>{product}</span>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, background: '#e0e7ff', padding: '2px 8px', borderRadius: '99px' }}>
                                                Total: {calculateProductTotal(product)}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            {sizeKeys.map(size => {
                                                const isEditing = editingItem?.product === product && editingItem?.size === size;

                                                return (
                                                    <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                        <span style={{ fontWeight: 600, color: '#475569' }}>{size}:</span>

                                                        {isEditing ? (
                                                            <>
                                                                <input
                                                                    autoFocus
                                                                    className="input"
                                                                    style={{ width: '60px', padding: '2px 4px', height: 'auto', fontSize: '0.9rem' }}
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleEditSave();
                                                                        if (e.key === 'Escape') handleEditCancel();
                                                                    }}
                                                                />
                                                                <button onClick={handleEditSave} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}>
                                                                    <Check size={16} />
                                                                </button>
                                                                <button onClick={handleEditCancel} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{sizes[size]}</span>
                                                                <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleEditStart(product, size, sizes[size])}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }}
                                                                        title="Editar Quantidade"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveItem(product, size)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', padding: 0 }}
                                                                        title="Remover"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financials Section */}
                    <div>
                        <h3 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                            Financeiro
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>Valor Cobrado (Total)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}>R$</span>
                                    <input
                                        className="input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        name="total_value"
                                        value={formData.financials.total_value || ''}
                                        onChange={handleFinancialChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>Valor Pago (Sinal)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}>R$</span>
                                    <input
                                        className="input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        name="value_paid"
                                        value={formData.financials.value_paid || ''}
                                        onChange={handleFinancialChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>Custo de Produção</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}>R$</span>
                                    <input
                                        className="input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        name="production_cost"
                                        value={formData.financials.production_cost || ''}
                                        onChange={handleFinancialChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>Lucro Estimado</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>
                                    R$ {profit.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
