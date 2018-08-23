const conexion = require('../lib/conexionbd');

function buscarActores(req, res) {
    const sql = "SELECT * FROM actor"

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.send(JSON.stringify(resultado));
    });
}

module.exports = {
    buscarActores : buscarActores
};
