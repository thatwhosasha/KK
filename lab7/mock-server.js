const mb = require('mountebank');

const settings = {
  port: 2525,
  allowInjection: true 
};

mb.create(settings).then(() => {
  console.log('Mountebank запущен на http://localhost:2525');

  const imposter = {
    port: 8080,
    protocol: 'http',
    stubs: [
      {
        predicates: [
          {
            equals: {
              method: 'GET',
              path: '/api/exchange-rate'
            }
          }
        ],
        responses: [
          {
            is: {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' }
            },
            behaviors: [
              {
                decorate: `function(request, response) {
                  const url = new URL(request.path, 'http://localhost');
                  const from = url.searchParams.get('from') || 'USD';
                  const to = url.searchParams.get('to') || 'EUR';

                  const rates = {
                    'USDEUR': 0.85,
                    'EURUSD': 1.18,
                    'USDRUB': 75.0,
                    'RUBUSD': 0.0133
                  };
                  const key = from + to;
                  const rate = rates[key] || (Math.random() * 1.5 + 0.5).toFixed(4);

                  response.body = JSON.stringify({
                    from: from,
                    to: to,
                    rate: rate,
                    timestamp: new Date().toISOString()
                  });
                }`
              }
            ]
          }
        ]
      }
    ]
  };

  return fetch('http://localhost:2525/imposters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imposter)
  });
})
.then(response => {
  if (response.ok) {
    console.log('Mock API запущен: http://localhost:8080/api/exchange-rate?from=USD&to=EUR');
  } else {
    console.error('Ошибка создания заглушки, статус:', response.status);
  }
})
.catch(err => console.error('Ошибка:', err));