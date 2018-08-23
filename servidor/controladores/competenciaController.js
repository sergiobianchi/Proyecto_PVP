const conexion = require('../lib/conexionbd');

function buscarCompetencias(req, res) {
    const sql = "SELECT * FROM competencia"
    
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        res.send(JSON.stringify(resultado));
    });
}

function buscarOpciones(req, res) {
    const idCompetencia = req.params.id; 
    let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
    
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        const competencia = resultado[0];

        let sql = "SELECT pelicula.id,pelicula.poster,pelicula.titulo FROM pelicula", join = "", where = "";
            
        if (competencia.actor_id){
            join += " INNER JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id" ;
            where += " WHERE actor_pelicula.actor_id = " + competencia.actor_id;
        } 
        
        if (competencia.director_id){
            join += " INNER JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id" ;

            if (where.length > 0){
                where += " and ";
            } else {
                where += " WHERE ";
            }

            where +=  "director_pelicula.director_id = " + competencia.director_id;
        } 
        
        if (competencia.genero_id){
            if (where.length > 0){
                where += " and ";
            } else {
                where += " WHERE ";
            }

            where += "pelicula.genero_id = " + competencia.genero_id;
        }

        if (competencia.anio){
            if (where.length > 0){
                where += " and ";
            } else {
                where += " WHERE ";
            }

            where += "pelicula.anio = " + competencia.anio;
        }

        sql += join + where + " ORDER BY FLOOR(1 + RAND() * 100000)";
        
        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }

            const response = {
                'competencia': competencia.nombre,
                'peliculas': resultado
            };
            
            res.send(JSON.stringify(response));    
        });             
    });
}

function buscarResultados(req, res) {
    const idCompetencia = req.params.id; 
    let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
    
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        const competencia = resultado[0];

        let sql = "SELECT voto.pelicula_id, pelicula.poster, pelicula.titulo, COUNT(pelicula_id) As votos FROM voto INNER JOIN pelicula ON voto.pelicula_id = pelicula.id WHERE voto.competencia_id = " + idCompetencia + " GROUP BY voto.pelicula_id ORDER BY COUNT(pelicula_id) DESC LIMIT 3";

        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }

            const response = {
                'competencia': competencia.nombre,
                'resultados': resultado
            };
           
            res.send(JSON.stringify(response));    
        });             
    });
}

function agregarVoto(req, res) {
    const idCompetencia = req.params.id,
    idPelicula = req.body.idPelicula;     
    let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
    
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        sql = "SELECT * FROM pelicula WHERE id = " + idPelicula;
    
        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
    
            if (resultado.length === 0) {
                console.log("No se encontro ninguna pelicula con este id");
                return res.status(404).send("No se encontro ninguna pelicula con este id");
            }

            sql = "INSERT INTO voto ( competencia_id, pelicula_id ) VALUES (" + idCompetencia + "," + idPelicula + ")";

            conexion.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la insercion", error.message);
                    return res.status(500).JSON(error);
                }

                res.status(200).send();    
            });        
        });        
    });
}

function agregarCompetencias(req, res) {
    const nombreCompetencia = req.body.nombre,
    idGenero = req.body.genero,
    idDirector = req.body.director,
    idActor = req.body.actor,
    anio = parseInt(req.body.anio);    

    if (!nombreCompetencia) {
        console.log("Debe completar el nombre de la competencia");
        return res.status(422).send("Debe completar el nombre de la competencia");    
    }

    let sql = "SELECT * FROM competencia WHERE nombre = '" + nombreCompetencia + "'";

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 1) {
            console.log("Ya hay una competencia con este nomnbre");
            return res.status(422).send("Ya hay una competencia con este nomnbre");
        }

        let sql = "SELECT count(pelicula.id) As cantidad FROM pelicula", join = "", where = "", campos = "nombre", valores = ") VALUES ('" + nombreCompetencia + "'";

        if (idGenero > 0) {
            if (where.length > 0){
                where += " and ";
            } else {
                where += " WHERE ";
            }

            where += "pelicula.genero_id = " + idGenero;
            campos += ",genero_id";
            valores += "," + idGenero;
        }
    
        if (idDirector > 0) {
            join += " INNER JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id" ;

            if (where.length > 0){
                where += " and ";
            } else {
                where += " WHERE ";
            }

            where +=  "director_pelicula.director_id = " + idDirector;
            campos += ",director_id";
            valores += "," + idDirector;
        }
    
        if (idActor > 0) {
            join += " INNER JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id" ;

            if (where.length > 0){
                where += " and ";
            } else {
                where += " WHERE ";
            }

            where += "actor_pelicula.actor_id = " + idActor;
            campos += ",actor_id";
            valores += "," + idActor;
        }

        if (anio > 0) {
            if (where.length > 0){
                where += " and ";
            } else {
                where += " WHERE ";
            }

            where += "pelicula.anio = " + anio;
            campos += ",anio";
            valores += "," + anio;
        }

        sql += join + where;
        
        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
            
            if (resultado.length === 0 || resultado[0].cantidad <= 1) {
                console.log("Con este criterio no hay 2 peliculas como minimo");
                return res.status(422).send("Con este criterio no hay 2 peliculas como minimo");
            }
    
            sql = "INSERT INTO competencia ("+ campos + valores + ")";

            conexion.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la consulta", error.message);
                    return res.status(404).send("Hubo un error en la consulta");
                }
    
                res.status(200).send();    
            });                
        });        
    });
}

function eliminarVotos(req, res) {
    const idCompetencia = req.params.id; 
    let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
    
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        let sql = "DELETE FROM voto WHERE voto.competencia_id = " + idCompetencia;

        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la eliminacion de los votos", error.message);
                return res.status(500).send("Hubo un error en la eliminacion de los votos");
            }

            res.status(200).send();    
        });             
    });
}

function buscarCompetencia(req, res) {
    
    const idCompetencia = req.params.id; 
    let sql = "SELECT competencia.nombre, competencia.anio, genero.nombre AS genero_nombre, actor.nombre AS actor_nombre, director.nombre AS director_nombre FROM competencia LEFT JOIN genero ON competencia.genero_id = genero.id LEFT JOIN actor ON competencia.actor_id = actor.id LEFT JOIN director ON competencia.director_id = director.id WHERE competencia.id = " + idCompetencia;
    
    conexion.query(sql, function(error, resultado, fields) {
        
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        res.send(JSON.stringify( resultado[0] ));    
    });
}

function eliminarCompetencias(req, res) {
    const idCompetencia = req.params.id; 
    let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
    
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        let sql = "DELETE FROM voto WHERE voto.competencia_id = " + idCompetencia;

        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la eliminacion de los votos", error.message);
                return res.status(500).send("Hubo un error en la eliminacion de los votos");
            }

            let sql = "DELETE FROM competencia WHERE id = " + idCompetencia;

            conexion.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la eliminacion de la competencia", error.message);
                    return res.status(500).send("Hubo un error en la eliminacion de la competencia");
                }
    
                res.status(200).send();    
            });                
        });             
    });
}

function editarCompetencias(req, res) {
    const idCompetencia = req.params.id, 
    nombreCompetencia = req.body.nombre;

    if (!nombreCompetencia) {
        console.log("Debe completar el nombre de la competencia");
        return res.status(422).send("Debe completar el nombre de la competencia");    
    }

    let sql = "SELECT * FROM competencia WHERE nombre = '" + nombreCompetencia + "' and id <> " + idCompetencia;

    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 1) {
            console.log("Ya hay otra competencia con este nomnbre");
            return res.status(422).send("Ya hay otra competencia con este nomnbre");
        }

        let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
    
        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }

            if (resultado.length === 0) {
                console.log("No se encontro ninguna competencia con este id");
                return res.status(404).send("No se encontro ninguna competencia con este id");
            }
        
            let sql = "UPDATE competencia SET nombre = '" + nombreCompetencia + "' WHERE id = " + idCompetencia;

            conexion.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la modificacion de la competencia", error.message);
                    return res.status(500).send("Hubo un error en la modificacion de la competencia");
                }

                res.status(200).send();    
            });                
        });             
    });
}

module.exports = {
    buscarCompetencias : buscarCompetencias,
    buscarOpciones : buscarOpciones,
    buscarResultados : buscarResultados,    
    agregarVoto : agregarVoto,
    agregarCompetencias : agregarCompetencias,
    eliminarCompetencias : eliminarCompetencias,
    buscarCompetencia : buscarCompetencia,    
    editarCompetencias : editarCompetencias,
    eliminarVotos : eliminarVotos,
};
