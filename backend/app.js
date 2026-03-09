const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

const JWT_ACCESS_SECRET = 'my_super_secret_access_key_123';
const JWT_REFRESH_SECRET = 'my_super_secret_refresh_key_456';

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

let users = [];
let refreshTokens = [];
let products = [
    { id: 1, name: 'Умные часы Apple Watch', category: 'Электроника', description: 'Стильные часы', price: 35000, stock: 10 },
    { id: 2, name: 'Беспроводные наушники', category: 'Аудио', description: 'Хороший звук', price: 12000, stock: 25 },
];

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Формат "Bearer TOKEN"

    if (!token) return res.status(401).json({ error: "Токен не предоставлен" });

    jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Токен недействителен или истек" });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Доступ запрещен. Требуются права администратора." });
    }
    next();
};

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Online Store API', version: '2.0.0', description: 'API с авторизацией JWT и RBAC' },
        servers: [{ url: `http://localhost:${port}` }],
        components: {
            securitySchemes: {
                BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        },
        security: [{ BearerAuth: [] }]
    },
    apis: ['./app.js'],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация (первый пользователь становится admin, остальные user)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Успешная регистрация }
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email и пароль обязательны" });

    if (users.find(u => u.email === email)) return res.status(400).json({ error: "Пользователь уже существует" });

    const passwordHash = await bcrypt.hash(password, 10);
    const role = users.length === 0 ? 'admin' : 'user'; 
    
    const newUser = { id: Date.now(), email, passwordHash, role };
    users.push(newUser);
    
    res.status(201).json({ message: "Пользователь создан", user: { id: newUser.id, email: newUser.email, role: newUser.role } });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему (Выдает Access Token и HttpOnly Cookie с Refresh Token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Успешный вход }
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    refreshTokens.push(refreshToken);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: payload });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов
 *     tags: [Auth]
 *     responses:
 *       200: { description: Новый Access Token }
 */
app.post('/api/auth/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) return res.status(403).json({ error: "Недействительный Refresh Token" });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Токен истек" });

        const payload = { id: user.id, email: user.email, role: user.role };
        const newAccessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
        
        refreshTokens = refreshTokens.filter(t => t !== refreshToken);
        const newRefreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        refreshTokens.push(newRefreshToken);

        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: false, sameSite: 'Strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ accessToken: newAccessToken });
    });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выход из системы (Blacklist токена)
 *     tags: [Auth]
 *     responses:
 *       200: { description: Успешный выход }
 */
app.post('/api/auth/logout', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    refreshTokens = refreshTokens.filter(t => t !== refreshToken); // Удаляем из массива валидных (Blacklist)
    res.clearCookie('refreshToken');
    res.json({ message: "Успешный выход" });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Данные пользователя }
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары (доступно всем)
 *     tags: [Products]
 */
app.get('/api/products', (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар (только Администратор)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 */
app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
    const { name, category, description, price, stock } = req.body;
    const newProduct = { id: Date.now(), name, category, description, price, stock };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (только Администратор)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 */
app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.status(200).json({ message: 'Deleted' });
});

app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});