import React, { useState } from 'react';
import { X, Calculator, Copy, Check } from 'lucide-react';

const PRICES = {
    'Camiseta': 11.90,
    'Bermuda': 10.25,
    'Shorts Saia': 10.25,
    'Moletom': 20.50,
    'Calça': 18.50
};

export default function BudgetCalculator({ onClose }) {
    const [quantities, setQuantities] = useState({
        'Camiseta': '',
        'Bermuda': '',
        'Shorts Saia': '',
        'Moletom': '',
        'Calça': ''
    });

    const [copied, setCopied] = useState(false);

    const handleQtyChange = (item, value) => {
        if (value === '' || /^\d+$/.test(value)) {
            setQuantities(prev => ({ ...prev, [item]: value }));
        }
    };

    const calculateTotal = () => {
        return Object.entries(quantities).reduce((acc, [item, qty]) => {
            return acc + (parseInt(qty || 0) * PRICES[item]);
        }, 0);
    };

    const total = calculateTotal();
    const totalItems = Object.values(quantities).reduce((acc, qty) => acc + (parseInt(qty || 0)), 0);

    const generateReport = () => {
        let text = "*ORÇAMENTO UNIFORME*\n\n";

        Object.entries(quantities).forEach(([item, qty]) => {
            const quantity = parseInt(qty || 0);
            if (quantity > 0) {
                const subtotal = quantity * PRICES[item];
                text += `${quantity}x ${item} (R$ ${PRICES[item].toFixed(2).replace('.', ',')}) = R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
            }
        });

        text += `\n*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
        return text;
    };

    const handleCopy = () => {
        const text = generateReport();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '500px',
                    width: '90%',
                    background: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calculator size={24} color="var(--primary)" />
                        Simular Orçamento
                    </h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(PRICES).map(([item, price]) => (
                        <div key={item} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{item}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>R$ {price.toFixed(2).replace('.', ',')} /un</div>
                            </div>
                            <input
                                className="input"
                                type="number"
                                placeholder="Qtd"
                                value={quantities[item]}
                                onChange={e => handleQtyChange(item, e.target.value)}
                                style={{ textAlign: 'center' }}
                            />
                            <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                                R$ {((parseInt(quantities[item] || 0) * price).toFixed(2).replace('.', ','))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {totalItems} itens selecionados
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Valor Total</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
                                R$ {total.toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn"
                        style={{ width: '100%', justifyContent: 'center', background: copied ? '#10b981' : 'var(--primary)' }}
                        onClick={handleCopy}
                        disabled={total === 0}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Copiado para WhatsApp!' : 'Copiar Orçamento'}
                    </button>
                </div>
            </div>
        </div>
    );
}
