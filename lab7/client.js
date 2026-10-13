
const BASE_URL = 'http://localhost:8080';

async function getExchangeRate(from, to) {
  const url = `${BASE_URL}/api/exchange-rate?from=${from}&to=${to}`;
  console.log(`Запрос к mock API: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Курс ${data.from} → ${data.to}: ${data.rate}`);
    console.log(`Ответ получен: ${data.timestamp}`);
    return data;
  } catch (error) {
    console.error('Ошибка получения курса:', error.message);
  }
}

// Тестовые вызовы
(async () => {
  await getExchangeRate('USD', 'EUR');
  await getExchangeRate('EUR', 'USD');
  await getExchangeRate('USD', 'RUB');
  await getExchangeRate('RUB', 'USD');
})();