const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();
const r = require('rethinkdb')
const server = require('http').createServer(app).listen(4000);
const io = require('socket.io').listen(server);
io.set('transports', [ 'websocket' ]);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

io.on('connection', (socket) => {
	console.log('New client connected');
	socket.on('disconnect', () => console.log('Client disconnected'));
	socket.on('error', () => console.log('errors'));
	//socket.on('convertWin10', (data) => convertwin10csv(data, (data) => socket.emit('returnConvert', data)));
}); // end io.ON


r.connect({ host: 'localhost', port: 28015 }, (err, conn) => {
  if(err) throw err;

//GET ALL
  r.table('tv_shows')
    .run(conn, (err, cursor) => {
      if (err) throw err;
       console.log(cursor.toArray((err, res) => err ? console.log(err) : console.log(res)))
});


// Get Single Record
  r.table('tv_shows').filter(r.row("name").eq("Family Guy"))
    .run(conn, (err, cursor) => {
      if (err) throw err;
       console.log(cursor.toArray((err, res) => err ? console.log(err) : console.log(res)))
});
 
//GET REALTIME
  r.table('tv_shows').changes()
    .run(conn, (err, cursor) => {
      if (err) throw err;
       console.log(cursor.each((err, res) => err ? console.log(err) : console.log("something Changed", res)))
});
//INSERT
      r.table('tv_shows').insert({ name: 'American Dad' }).run(conn, function(err, res)
    {
      if(err) throw err;
      console.log(res);
    });  
});