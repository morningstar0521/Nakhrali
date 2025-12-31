const { protect } = require('./middleware/auth');
const { admin } = require('./middleware/admin');
const controller = require('./controllers/hamperController');

console.log('--- Debugging Imports ---');
console.log('protect type:', typeof protect);
console.log('admin type:', typeof admin);
console.log('controller type:', typeof controller);
console.log('getAllHampers type:', typeof controller.getAllHampers);
console.log('getActiveHampers type:', typeof controller.getActiveHampers);
console.log('-------------------------');
