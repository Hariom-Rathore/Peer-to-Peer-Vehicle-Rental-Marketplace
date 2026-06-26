const routes = require('../routes/listing.js');
const stack = routes.stack || routes.router && routes.router.stack || routes._router && routes._router.stack || routes;
if (!stack) { console.log('No stack object'); process.exit(1);} 
console.log('Listing router layers:');
if (Array.isArray(stack)) {
  stack.forEach((layer, i) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',');
      console.log(i, 'route', layer.route.path, methods);
    } else if (layer.name === 'router') {
      console.log(i, 'nested router', layer.regexp && layer.regexp.toString());
    } else {
      console.log(i, 'middleware', layer.name || '(anonymous)');
    }
  });
} else {
  console.log(stack);
}
