import { initClient } from '@ts-rest/core';
import { contract } from './contract';

export const api = initClient(contract, {
  baseUrl: '',
  baseHeaders: {
    'Content-Type': 'application/json',
  },
}); 