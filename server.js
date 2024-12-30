const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const apiKey = process.env.WEATHER_API_KEY;
const apiUrlWeather = 'https://api.openweathermap.org/data/2.5/weather';

// Servir archivos estáticos para el frontend
app.use(express.static('public'));

// Escuchar conexiones de WebSocket
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    socket.on('consultarClima', async (ciudad) => {
        try {
            const response = await axios.get(apiUrlWeather, {
                params: {
                    q: ciudad,
                    appid: apiKey,
                    units: 'metric',
                    lang: 'es',
                }
            });

            const data = response.data;
            const clima = {
                ciudad,
                descripcion: data.weather[0].description,
                temp: data.main.temp,
                tempMax: data.main.temp_max,
                tempMin: data.main.temp_min,
            };


            socket.emit('climaActualizado', clima);

        } catch (error) {
            console.log('Error al consultar:' , error.message);
            socket.emit('errorClima', 'No se pudo obtener el clima')
        }
    })

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
