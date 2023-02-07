const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

//creando la conexion a la base de datos
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'login',
	password : 'inicio24',
	database : 'farmaciajohanna_db'
});

//instanciando app con express para usarla 
const app = express();

//seteando los default de las rutas, setea views como default de carpeta y el engine para leer la extension ejs
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//encripta los datos 
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));


// http://localhost:3000/   - - - -Redirecciona a login cuando se abre la pagina 
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth - - - - - un point que se usa solo para la comprobacion de datos, no tiene html como tal 
app.post('/auth', function(request, response) {
	// Captura los input en las variables
	let username = request.body.username;
	let password = request.body.password;

	// Se asegura si los campos existen 
	if (username && password) {
		// Ejecuta la query para consultar en sql si existen esos datos ingresados 
		connection.query('SELECT * FROM usuarios WHERE usuario = ? AND password = ?', [username, password], function(error, results, fields) {
			// Si hay algun problema con la query devuelve error
			if (error) throw error;
			// Si la cuenta existe se fija si no esta el campo vacio
			if (results.length > 0) {
				// Autentica al usuario, guardando una variable True para saber que el usario esta en estado logeado 
				// Guarda el usuario en variable para futuro uso
				request.session.loggedin = true;
				request.session.username = username;
				// Redirecciona al point home
				response.redirect('/home');
			} else {
				response.send('Usuario o contraseña incorrectos');
			}			
			response.end();
		});
	} else {
		response.send('Por favor ingrese usuario y contraseña');
		response.end();
	}
});

// http://localhost:3000/home - - - -- - Point del home 
app.get('/home', function(request, response) {
	// Si el usuario esta logueado
	if (request.session.loggedin) {
		// renderiza la pagina panelcontrol que esta en views
	    response.render('panelcontrol');
	} else {
		// si no esta logueado 
		response.send('Para ver esta pagina primero debe loguearse');
	}
	response.end();
});

app.listen(3000);