const fetch = require('node-fetch');

async function searchBrave(query) {
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': 'BSAusdaIY2y2gJBvxuJiGzWBKW3kQIE'
    }
  });

  const data = await response.json();
  return data;
}

// Example usage:
searchBrave('OpenAI GPT-4')
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));
