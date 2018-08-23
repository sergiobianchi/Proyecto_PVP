//paquetes necesarios para el proyecto
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const competenciaController = require('./controladores/competenciaController');
const generoController = require('./controladores/generoController');
const directorController = require('./controladores/directorController');
const actorController = require('./controladores/actorController');
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/competencias', competenciaController.buscarCompetencias);
app.post('/competencias', competenciaController.agregarCompetencias);
app.delete('/competencias/:id', competenciaController.eliminarCompetencias);
app.get('/competencias/:id', competenciaController.buscarCompetencia);
app.put('/competencias/:id', competenciaController.editarCompetencias);
app.get('/competencias/:id/peliculas', competenciaController.buscarOpciones);
app.get('/competencias/:id/resultados', competenciaController.buscarResultados);
app.delete('/competencias/:id/votos', competenciaController.eliminarVotos);
app.post('/competencias/:id/voto', competenciaController.agregarVoto);
app.get('/generos', generoController.buscarGeneros);
app.get('/directores', directorController.buscarDirectores);
app.get('/actores', actorController.buscarActores);

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
const puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});

