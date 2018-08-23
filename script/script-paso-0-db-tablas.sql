USE competencias;

DROP TABLE IF EXISTS competencia;

CREATE TABLE competencia (
  id int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL ,
  actor_id int(11) unsigned ,
  director_id int(11)  unsigned,  
  genero_id int(11)  unsigned,  
  anio decimal(5,0), 
  PRIMARY KEY (id),
  FOREIGN KEY (actor_id) REFERENCES actor(id),
  FOREIGN KEY (director_id) REFERENCES director(id),
  FOREIGN KEY (genero_id) REFERENCES genero(id)
);

LOCK TABLES competencia WRITE;
INSERT INTO competencia VALUES (1,'Mejor Director',4,3295,1);
UNLOCK TABLES;

CREATE TABLE voto (
  id int(11) NOT NULL AUTO_INCREMENT,
  competencia_id int(11) ,
  pelicula_id int(11) unsigned , 
  PRIMARY KEY (id),
  FOREIGN KEY (competencia_id) REFERENCES competencia(id),
  FOREIGN KEY (pelicula_id) REFERENCES pelicula(id)
);