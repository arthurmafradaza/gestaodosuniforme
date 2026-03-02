import React from 'react';

const PrintableInventory = ({ school, franchises }) => {
    const today = new Date().toLocaleDateString('pt-BR');

    if (!school || !franchises) return null;

    return (
        <div className="printable-content">
            <header className="print-header">
                <div>
                    <h1>Relatório de Inventário de Peças</h1>
                    <h2>{school.name}</h2>
                </div>
                <div className="print-date">Data: {today}</div>
            </header>

            {franchises.map((franchise) => {
                const inventory = franchise.inventory || {};
                const products = Object.keys(inventory);

                if (products.length === 0) return null;

                let unitTotal = 0;

                return (
                    <section key={franchise.id} className="print-section">
                        <h3 className="unit-name">Unidade: {franchise.name}</h3>
                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Cores / Tamanhos</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const sizes = inventory[product] || {};
                                    const productTotal = Object.values(sizes).reduce((a, b) => a + (parseInt(b) || 0), 0);
                                    unitTotal += productTotal;

                                    if (productTotal === 0) return null;

                                    return (
                                        <tr key={product}>
                                            <td><strong>{product}</strong></td>
                                            <td>
                                                <div className="sizes-list">
                                                    {Object.entries(sizes).map(([size, qty]) => (
                                                        parseInt(qty) > 0 && (
                                                            <span key={size} className="size-item">
                                                                {size}: {qty}
                                                            </span>
                                                        )
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="qty-cell">{productTotal}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total da Unidade:</td>
                                    <td className="qty-cell" style={{ fontWeight: 'bold' }}>{unitTotal}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </section>
                );
            })}

            <footer className="print-footer">
                <p>Uniform Manager - Sistema de Gestão de Uniformes Escolares</p>
            </footer>
        </div>
    );
};

export default PrintableInventory;
