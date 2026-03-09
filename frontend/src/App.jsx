import React, { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard/ProductCard';
import { api, authApi } from './api';

function App() {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        loadProducts();
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (localStorage.getItem('token')) {
            try {
                const data = await authApi.getMe();
                setUser(data.user);
            } catch (e) {
                console.log("Не авторизован");
            }
        }
    };

    const loadProducts = async () => {
        try {
            const data = await api.getProducts();
            setProducts(data);
        } catch (e) {
            console.error("Ошибка загрузки товаров", e);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await authApi.login(email, password);
            setUser(data.user);
            alert("Успешный вход!");
        } catch (error) {
            alert(error.response?.data?.error || "Ошибка входа");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await authApi.register(email, password);
            alert("Успешная регистрация! Теперь выполните вход.");
        } catch (error) {
            alert(error.response?.data?.error || "Ошибка регистрации");
        }
    };

    const handleLogout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteProduct(id);
            loadProducts();
        } catch (error) {
            alert(error.response?.data?.error || "Ошибка удаления");
        }
    };

    const handleAdd = async () => {
        try {
            const newProduct = {
                name: 'Новый товар',
                category: 'Разное',
                description: 'Описание товара',
                price: 9990,
                stock: 5
            };
            await api.createProduct(newProduct);
            loadProducts();
        } catch (error) {
            alert(error.response?.data?.error || "Ошибка создания");
        }
    };

    return (
        <div style={{ padding: '50px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
                {user ? (
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3>Привет, {user.email}! (Роль: {user.role})</h3>
                        <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px'}}>
                            Выйти
                        </button>
                    </div>
                ) : (
                    <form style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <h3>Вход / Регистрация</h3>
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{padding: '8px'}}/>
                        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} style={{padding: '8px'}}/>
                        <button onClick={handleLogin} style={{ padding: '8px 15px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px'}}>Войти</button>
                        <button onClick={handleRegister} style={{ padding: '8px 15px', cursor: 'pointer', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px'}}>Регистрация</button>
                    </form>
                )}
            </div>

            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                Мой интернет магазин
            </h1>

            {user && user.role === 'admin' && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <button onClick={handleAdd} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#28a745', color: 'white', fontWeight: 'bold' }}>
                        + Добавить товар
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {products.map(p => (
                    <ProductCard 
                        key={p.id} 
                        product={p} 
                        onDelete={handleDelete} 
                        isAdmin={user && user.role === 'admin'} 
                    />
                ))}
            </div>
        </div>
    );
}

export default App;