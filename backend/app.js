const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let products = [
    { id: 1, name: 'Умные часы Apple Watch', category: 'Электроника', description: 'Стильные часы', price: 35000, stock: 10 },
    { id: 2, name: 'Беспроводные наушники', category: 'Аудио', description: 'Хороший звук', price: 12000, stock: 25 },
    { id: 3, name: 'Смартфон iPhone 15', category: 'Электроника', description: 'Новинка', price: 90000, stock: 5 },
    { id: 4, name: 'Игровая приставка PS5', category: 'Игры', description: 'Лучшая консоль', price: 55000, stock: 3 },
    { id: 5, name: 'Клавиатура механика', category: 'Аксессуары', description: 'RGB подсветка', price: 5000, stock: 15 },
    { id: 6, name: 'Игровая мышь', category: 'Аксессуары', description: 'Высокая точность', price: 3000, stock: 20 },
    { id: 7, name: 'Монитор 4K', category: 'Электроника', description: 'Яркие цвета', price: 30000, stock: 7 },
    { id: 8, name: 'Ноутбук для работы', category: 'Компьютеры', description: 'Легкий и мощный', price: 65000, stock: 4 },
    { id: 9, name: 'Колонки 2.1', category: 'Аудио', description: 'Громкий бас', price: 7000, stock: 12 },
    { id: 10, name: 'Зарядное устройство', category: 'Аксессуары', description: 'Быстрая зарядка', price: 1500, stock: 50 }
];

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Online Store API', version: '1.0.0' },
        servers: [{ url: `http://localhost:${port}` }],
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар создан
 */
app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock } = req.body;
    const newProduct = { id: Date.now(), name, category, description, price, stock };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Товар удален
 */
app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.status(200).json({ message: 'Deleted' });
});

app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
});