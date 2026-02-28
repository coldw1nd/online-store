import React, { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard/ProductCard';
import { api } from './api';

function App() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await api.getProducts();
        setProducts(data);
    };

    const handleDelete = async (id) => {
        await api.deleteProduct(id);
        loadProducts();
    };

    const handleAdd = async () => {
        const newProduct = {
            name: 'Новый товар',
            category: 'Разное',
            description: 'Описание товара',
            price: 9990,
            stock: 5
        };
        await api.createProduct(newProduct);
        loadProducts();
    };

    return (
        <div style={{ padding: '50px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontFamily: 'Arial' }}>
                Мой интернет магазин
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <button onClick={handleAdd} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#28a745', color: 'white', fontWeight: 'bold' }}>
                    + Добавить товар
                </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {products.map(p => (
                    <ProductCard key={p.id} product={p} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
}

export default App;