const NodeGeocoder = require("node-geocoder");
const dotenv = require("dotenv");
dotenv.config();

const axios = require('axios');

let geocoder;
if (process.env.OPENCAGE_API_KEY) {
  geocoder = NodeGeocoder({ provider: 'opencage', apiKey: process.env.OPENCAGE_API_KEY });
} else {
  // Fallback to OpenStreetMap (no API key required) for local/dev
  geocoder = NodeGeocoder({ provider: 'openstreetmap' });
}

// geocodeAddress accepts either a string (postalCode) or an object { street, city, state, postalCode }
const geocodeAddress = async (addressInput) => {
  try {
    const queries = [];
    if (!addressInput) return [];

    if (typeof addressInput === 'string') {
      queries.push(`${addressInput} India`);
      queries.push(addressInput);
    } else if (typeof addressInput === 'object') {
      const { postalCode, street, city, state } = addressInput;
      if (postalCode) {
        queries.push(`${postalCode} India`);
        queries.push(postalCode);
      }
      const parts = [street, city, state].filter(Boolean).join(' ');
      if (parts) {
        queries.push(`${parts} India`);
        queries.push(parts);
      }
      if (city && state) queries.push(`${city}, ${state}, India`);
    }

    // Try NodeGeocoder first with generated queries
    for (const q of queries) {
      try {
        console.log('Geocoder: trying query ->', q);
        const res = await geocoder.geocode(q);
        if (res && res.length) {
          console.log('Geocoder: provider returned', res.length, 'results for', q);
          return res;
        }
      } catch (err) {
        // continue to next query
        console.warn('Geocoder provider error for query', q, (err && err.message) || err);
      }
    }

    // Fallback to direct Nominatim lookup (OpenStreetMap) to increase chance of match
    // Build a fallback query string using available fields
    let fallbackQuery = '';
    if (typeof addressInput === 'string') {
      fallbackQuery = `${addressInput} India`;
    } else {
      const { postalCode, street, city, state } = addressInput;
      fallbackQuery = [postalCode, street, city, state, 'India'].filter(Boolean).join(' ');
    }

    if (fallbackQuery) {
      try {
        // Try several Nominatim permutations to improve match rates
        const url = `https://nominatim.openstreetmap.org/search`;
        const nominatimParamsList = [
          { q: fallbackQuery, format: 'json', addressdetails: 1, limit: 10 },
          { q: fallbackQuery + ' India', format: 'json', addressdetails: 1, limit: 10 },
        ];

        for (const params of nominatimParamsList) {
          try {
            console.log('Nominatim: trying', params.q);
            const res = await axios.get(url, {
              params,
              headers: { 'User-Agent': 'MedSync/1.0 (+https://example.com)' },
              timeout: 7000,
            });
            if (res.data && res.data.length) {
              const mapped = res.data.map((item) => ({
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                formattedAddress: item.display_name,
                raw: item,
              }));
              console.log('Nominatim: found', mapped.length, 'results for', params.q);
              return mapped;
            }
          } catch (errInner) {
            console.warn('Nominatim attempt failed for', params.q, (errInner && errInner.message) || errInner);
          }
        }
      } catch (err) {
        console.warn('Nominatim fallback error:', err.message || err);
      }
    }

    return [];
  } catch (err) {
    console.error('Geocoding error (unexpected):', err.message || err);
    return [];
  }
};

module.exports = { geocodeAddress };
