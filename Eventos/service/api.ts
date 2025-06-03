// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://parseapi.back4app.com',
  headers: {
    'X-Parse-Application-Id': 'y252xv9Jnq4yizmwdMoY9zmbrxOOLZVL3GHtEZYZ', // Substitua pela sua App ID
    'X-Parse-REST-API-Key': 'ufZphZCaRGrpPEHErZtPKQ67mwnGlduk2aUqrAxI', // Substitua pela sua REST API Key
    'Content-Type': 'application/json',
  },
});

export default api;