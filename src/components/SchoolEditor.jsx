import React, { useState, useEffect, memo } from 'react';
import { ArrowLeft, Save, Trash2, Edit2, Check, X, FileText, Shirt, DollarSign, Copy } from 'lucide-react';

const PRODUCT_OPTIONS = ['Camisetas', 'Bermudas', 'Shorts Saia', 'Moletom', 'Calça'];

// Optimized Product Row Component
const ProductRow = memo(({ product, sizes, onRemove, onEditStart, editingItem, editValue, setEditValue, onEditSave, onEditCancel, onDuplicateProduct, onDuplicateItem, onRenameProductStart, editingProduct, productEditValue, setProductEditValue, onRenameProductSave, onRenameProductCancel, onRenameSizeStart, editingSizeLabel, sizeLabelEditValue, setSizeLabelEditValue, onRenameSizeSave, onRenameSizeCancel, onRemoveProduct }) => {
    // Sort sizes logically
    const sizeKeys = Object.keys(sizes).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
    });

    const totalQty = Object.values(sizes).reduce((acc, qty) => acc + (parseInt(qty) || 0), 0);
    const isEditingProduct = editingProduct === product;

    return (
        <div className="card" style={{
            marginBottom: '1rem',
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                paddingBottom: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shirt size={18} color="var(--primary)" />
                    {isEditingProduct ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                autoFocus
                                className="input"
                                style={{ fontSize: '1rem', fontWeight: 700, padding: '4px 8px', width: '200px' }}
                                value={productEditValue}
                                onChange={e => setProductEditValue(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') onRenameProductSave();
                                    if (e.key === 'Escape') onRenameProductCancel();
                                }}
                            />
                            <button onClick={onRenameProductSave} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--success)' }}><Check size={16} /></button>
                            <button onClick={onRenameProductCancel} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={16} /></button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{product}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={() => onRenameProductStart(product)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                                    title="Renomear Categoria"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button
                                    onClick={() => onDuplicateProduct(product)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary-light)', display: 'flex', padding: 2 }}
                                    title="Duplicar Categoria"
                                >
                                    <Copy size={12} />
                                </button>
                                <button
                                    onClick={() => onRemoveProduct(product)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', padding: 2 }}
                                    title="Excluir Categoria"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: 600, background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                    Total: {totalQty}
                </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {sizeKeys.map(size => {
                    const isEditingQty = editingItem?.product === product && editingItem?.size === size;
                    const isEditingLabel = editingSizeLabel?.product === product && editingSizeLabel?.size === size;

                    return (
                        <div key={size} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.2s'
                        }}>
                            {isEditingLabel ? (
                                <>
                                    <input
                                        autoFocus
                                        className="input"
                                        style={{ width: '40px', padding: '2px 4px', height: 'auto', fontSize: '0.8rem', textAlign: 'center' }}
                                        value={sizeLabelEditValue}
                                        onChange={e => setSizeLabelEditValue(e.target.value.toUpperCase())}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') onRenameSizeSave();
                                            if (e.key === 'Escape') onRenameSizeCancel();
                                        }}
                                    />
                                    <button onClick={onRenameSizeSave} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--success)', display: 'flex' }}><Check size={12} /></button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span
                                        style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}
                                        onClick={() => onRenameSizeStart(product, size)}
                                        title="Clique para renomear o tamanho"
                                    >
                                        {size}:
                                    </span>
                                </div>
                            )}

                            {isEditingQty ? (
                                <>
                                    <input
                                        autoFocus={!isEditingLabel}
                                        className="input"
                                        style={{ width: '50px', padding: '2px 6px', height: 'auto', fontSize: '0.9rem', textAlign: 'center' }}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onEditSave();
                                            if (e.key === 'Escape') onEditCancel();
                                        }}
                                    />
                                    <button onClick={onEditSave} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--success)', display: 'flex' }}>
                                        <Check size={14} />
                                    </button>
                                    <button onClick={onEditCancel} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}>
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sizes[size]}</span>
                                    <div style={{ display: 'flex', gap: '4px', marginLeft: '4px', opacity: 0.5 }} className="hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => onEditStart(product, size, sizes[size])}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                                            title="Editar Quantidade"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDuplicateItem(product, size)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary-light)', display: 'flex', padding: 2 }}
                                            title="Duplicar Item"
                                        >
                                            <Copy size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onRemove(product, size)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', padding: 2 }}
                                            title="Remover"
                                        >
                                            <Trash2 size={12} />
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
});

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

    // Renaming Product State
    const [editingProduct, setEditingProduct] = useState(null); // product name
    const [productEditValue, setProductEditValue] = useState('');

    // Renaming Size State
    const [editingSizeLabel, setEditingSizeLabel] = useState(null); // { product, size }
    const [sizeLabelEditValue, setSizeLabelEditValue] = useState('');

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
        setFormData(prev => {
            const currentInventory = prev.inventory || {};
            const productInventory = currentInventory[newItemProduct] || {};
            const currentQty = productInventory[newItemSize] || 0;
            const newQty = currentQty + qty;

            return {
                ...prev,
                inventory: {
                    ...prev.inventory,
                    [newItemProduct]: {
                        ...(prev.inventory[newItemProduct] || {}),
                        [newItemSize]: newQty
                    }
                }
            };
        });

        setIsDirty(true);
        setNewItemSize('');
        setNewItemQty('');
    };

    const handleRemoveItem = (product, size) => {
        setFormData(prev => {
            const newInventory = { ...prev.inventory };
            if (newInventory[product]) {
                const newSizes = { ...newInventory[product] };
                delete newSizes[size];
                if (Object.keys(newSizes).length === 0) {
                    delete newInventory[product];
                } else {
                    newInventory[product] = newSizes;
                }
                return { ...prev, inventory: newInventory };
            }
            return prev;
        });
        setIsDirty(true);
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

    const handleRemoveProductCategory = (product) => {
        if (!window.confirm(`Excluir toda a categoria "${product}"?`)) return;
        setFormData(prev => {
            const newInventory = { ...prev.inventory };
            delete newInventory[product];
            return { ...prev, inventory: newInventory };
        });
        setIsDirty(true);
    };

    // Duplication Logic
    const handleDuplicateProduct = (productName) => {
        setFormData(prev => {
            const newInventory = { ...prev.inventory };
            const originalData = newInventory[productName];
            const baseName = productName.includes(' (Cópia)') ? productName.split(' (Cópia)')[0] : productName;
            let copyName = `${baseName} (Cópia)`;
            let counter = 1;

            while (newInventory[copyName]) {
                copyName = `${baseName} (Cópia ${counter})`;
                counter++;
            }

            return {
                ...prev,
                inventory: {
                    ...newInventory,
                    [copyName]: { ...originalData }
                }
            };
        });
        setIsDirty(true);
    };

    const handleDuplicateSize = (product, size) => {
        setFormData(prev => {
            const newInventory = { ...prev.inventory };
            const productInventory = { ...newInventory[product] };
            const qty = productInventory[size];
            const baseSize = size.includes(' (Cópia)') ? size.split(' (Cópia)')[0] : size;
            let copySize = `${baseSize} (Cópia)`;
            let counter = 1;

            while (productInventory[copySize]) {
                copySize = `${baseSize} (Cópia ${counter})`;
                counter++;
            }

            productInventory[copySize] = qty;
            newInventory[product] = productInventory;

            return { ...prev, inventory: newInventory };
        });
        setIsDirty(true);
    };

    // Renaming Categories
    const handleRenameProductStart = (name) => {
        setEditingProduct(name);
        setProductEditValue(name);
    };

    const handleRenameProductSave = () => {
        if (!editingProduct || !productEditValue || editingProduct === productEditValue) {
            setEditingProduct(null);
            return;
        }

        setFormData(prev => {
            const newInventory = { ...prev.inventory };
            const data = newInventory[editingProduct];
            delete newInventory[editingProduct];
            newInventory[productEditValue] = data;
            return { ...prev, inventory: newInventory };
        });

        setIsDirty(true);
        setEditingProduct(null);
    };

    const handleRenameProductCancel = () => {
        setEditingProduct(null);
    };

    // Renaming Size Labels
    const handleRenameSizeStart = (product, size) => {
        setEditingSizeLabel({ product, size });
        setSizeLabelEditValue(size);
    };

    const handleRenameSizeSave = () => {
        if (!editingSizeLabel || !sizeLabelEditValue) return;
        const { product, size } = editingSizeLabel;
        if (size === sizeLabelEditValue) {
            setEditingSizeLabel(null);
            return;
        }

        setFormData(prev => {
            const newInventory = { ...prev.inventory };
            const productInventory = { ...newInventory[product] };
            const qty = productInventory[size];

            if (productInventory[sizeLabelEditValue]) {
                alert("Este tamanho já existe neste produto.");
                return prev;
            }

            delete productInventory[size];
            productInventory[sizeLabelEditValue] = qty;
            newInventory[product] = productInventory;

            return { ...prev, inventory: newInventory };
        });

        setIsDirty(true);
        setEditingSizeLabel(null);
    };

    const handleRenameSizeCancel = () => {
        setEditingSizeLabel(null);
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

    const [showReport, setShowReport] = useState(false);
    const [reportText, setReportText] = useState('');

    const generateReport = () => {
        let text = `PEDIDO UNIFORME - ${formData.name.toUpperCase()}\n\n`;

        const formatBlock = (productName, colorField) => {
            const sizes = formData.inventory[productName] || {};
            const entries = Object.entries(sizes).filter(([_, qty]) => parseInt(qty) > 0);

            if (entries.length === 0) return '';

            const sortedEntries = entries.sort((a, b) => {
                const numA = parseInt(a[0]);
                const numB = parseInt(b[0]);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a[0].localeCompare(b[0]);
            });

            let color = '';
            if (colorField && formData.financials[colorField]) {
                color = formData.financials[colorField].toUpperCase();
            }

            let block = `${productName.toUpperCase()}`;
            if (color) block += ` ${color}`;
            block += '\n\n';

            sortedEntries.forEach(([size, qty]) => {
                block += `TAM ${size}: ${qty}\n`;
            });

            return block + '\n';
        };

        PRODUCT_OPTIONS.forEach(prod => {
            let colorField = null;
            if (prod === 'Camisetas') colorField = 'tshirt_color';
            if (prod === 'Bermudas') colorField = 'shorts_color';
            if (prod === 'Shorts Saia') colorField = 'skort_color';

            const block = formatBlock(prod, colorField);
            if (block) text += block;
        });

        setReportText(text);
        setShowReport(true);
    };

    const currentProducts = Object.keys(formData.inventory);
    const totalItems = currentProducts.reduce((acc, prod) => acc + calculateProductTotal(prod), 0);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Header */}
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button className="btn btn-secondary" onClick={onBack} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Editando Unidade</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{school.name} /</span>
                            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {formData.name || 'Nova Unidade'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={generateReport}>
                        <FileText size={18} /> Relatório
                    </button>
                    {franchise.id && (
                        <button className="btn btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' }} onClick={() => onDelete(franchise.id)}>
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button className="btn" onClick={handleSubmit} disabled={!isDirty}>
                        <Save size={18} /> Salvar
                    </button>
                </div>
            </div>

            {showReport && (
                <div className="modal-overlay" onClick={() => setShowReport(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Relatório para Copiar</h3>
                            <button onClick={() => setShowReport(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <textarea
                            readOnly
                            value={reportText}
                            className="input"
                            style={{
                                height: '300px',
                                fontFamily: 'monospace', fontSize: '0.85rem',
                                resize: 'none',
                                background: '#0f172a', /* Darker integration */
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button className="btn" onClick={() => {
                                navigator.clipboard.writeText(reportText);
                                alert("Copiado!");
                            }}>
                                Copiar Texto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem' }}>

                {/* DO NOT ADD FORM TAG HERE TO AVOID NESTING ISSUES IF SUB-FORMS EXIST - USING DIVS */}

                {/* LEFT COLUMN: IDENTIFICATION & PRODUCTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Identity Card */}
                    <div className="card" style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(4px)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>NOME DA UNIDADE (Ex: Pedido 01)</label>
                            <input
                                className="input"
                                style={{ fontSize: '1.25rem', fontWeight: 600, padding: '1rem' }}
                                name="name"
                                value={formData.name || ''}
                                onChange={handleNameChange}
                                placeholder="Identificação da Unidade"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>COR CAMISETA</label>
                                <input
                                    className="input"
                                    value={formData.financials.tshirt_color || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, financials: { ...prev.financials, tshirt_color: e.target.value } }));
                                        setIsDirty(true);
                                    }}
                                    placeholder="Ex: Branca"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>COR BERMUDA</label>
                                <input
                                    className="input"
                                    value={formData.financials.shorts_color || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, financials: { ...prev.financials, shorts_color: e.target.value } }));
                                        setIsDirty(true);
                                    }}
                                    placeholder="Ex: Azul"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>COR SHORTS SAIA</label>
                                <input
                                    className="input"
                                    value={formData.financials.skort_color || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, financials: { ...prev.financials, skort_color: e.target.value } }));
                                        setIsDirty(true);
                                    }}
                                    placeholder="Ex: Azul"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'var(--gradient-primary)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            width: 'fit-content'
                        }}>
                            Produção <span style={{ fontSize: '1rem', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>({totalItems} itens)</span>
                        </h3>

                        {/* Add Item Form */}
                        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary-glow)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>PRODUTO</label>
                                    <select
                                        className="input"
                                        value={newItemProduct}
                                        onChange={e => setNewItemProduct(e.target.value)}
                                        style={{ height: '42px' }}
                                    >
                                        <option value="">Selecione...</option>
                                        {PRODUCT_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>TAMANHO</label>
                                    <input
                                        className="input" // Using class for consistency
                                        placeholder="Ex: 10, G..."
                                        value={newItemSize}
                                        onChange={e => setNewItemSize(e.target.value.toUpperCase())}
                                        style={{ height: '42px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>QTD</label>
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="0"
                                        value={newItemQty}
                                        onChange={e => setNewItemQty(e.target.value)}
                                        style={{ height: '42px' }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleAddItem}
                                    disabled={!newItemProduct || !newItemSize || !newItemQty}
                                    style={{ height: '42px' }}
                                >
                                    + Adicionar
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentProducts.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                                    <Shirt size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>Nenhum item adicionado ainda.</p>
                                </div>
                            )}

                            {currentProducts.map(product => (
                                <ProductRow
                                    key={product}
                                    product={product}
                                    sizes={formData.inventory[product]}
                                    onRemove={handleRemoveItem}
                                    onEditStart={handleEditStart}
                                    editingItem={editingItem}
                                    editValue={editValue}
                                    setEditValue={setEditValue}
                                    onEditSave={handleEditSave}
                                    onEditCancel={handleEditCancel}
                                    onDuplicateProduct={handleDuplicateProduct}
                                    onDuplicateItem={handleDuplicateSize}
                                    onRenameProductStart={handleRenameProductStart}
                                    editingProduct={editingProduct}
                                    productEditValue={productEditValue}
                                    setProductEditValue={setProductEditValue}
                                    onRenameProductSave={handleRenameProductSave}
                                    onRenameProductCancel={handleRenameProductCancel}
                                    onRenameSizeStart={handleRenameSizeStart}
                                    editingSizeLabel={editingSizeLabel}
                                    sizeLabelEditValue={sizeLabelEditValue}
                                    setSizeLabelEditValue={setSizeLabelEditValue}
                                    onRenameSizeSave={handleRenameSizeSave}
                                    onRenameSizeCancel={handleRenameSizeCancel}
                                    onRemoveProduct={handleRemoveProductCategory}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: FINANCIALS */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '2rem', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <DollarSign size={20} /> Financeiro
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>VALOR COBRADO (TOTAL)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>R$</span>
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
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>VALOR PAGO (SINAL)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>R$</span>
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
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CUSTO DE PRODUÇÃO</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>R$</span>
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

                            <div style={{
                                marginTop: '1rem',
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%)',
                                borderRadius: '16px',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: '#6ee7b7', fontWeight: 600, marginBottom: '0.5rem' }}>LUCRO ESTIMADO</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', textShadow: '0 2px 10px rgba(16, 185, 129, 0.3)' }}>
                                    R$ {profit.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
