const express = require('express');
const path = require('path');
const app = express();

// Settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Routes
const indexRoutes = require('./src/routes/index');
app.use('/', indexRoutes);

// Start server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
