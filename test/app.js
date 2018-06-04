const fetch = require('node-fetch');
fetch('http://reqres.in/api/users/2')
	.then(function (response) {
		console.log(`response: ${response}`);
		return response.json();
	})
	.then(function (data) {
		console.log(`data: ${data}`);
	})
	.catch(e => console.log(`error recebido: ${e}`));