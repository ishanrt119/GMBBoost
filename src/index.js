require('dotenv').config();
const express = require('express');
const webhookRoutes = require('./routes/webhook.routes');
const debugRoutes = require('./routes/debug.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/whatsapp', webhookRoutes);
app.use('/api/debug', debugRoutes);        // ← debug routes

app.get('/', (req, res) => res.send('WhatsApp Agent running ✅'));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));