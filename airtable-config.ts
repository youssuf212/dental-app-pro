import Airtable from 'airtable';

const API_KEY = 'patt3AKTBs6hgArEC.a6f8e1d7cdcb8af79d889baf4fa158a51ea5bb293533d60fd4945141b44b12f4';
const BASE_ID = 'appbEb9gNci6ilGXg';

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: API_KEY
});

export const base = Airtable.base(BASE_ID);

export const TABLE_NAMES = {
    CASES: 'Cases',
    TECHNICIANS: 'Technicians',
    PAYMENTS: 'Payments',
    NOTIFICATIONS: 'Notifications',
    USERS: 'Users',
    MILLING_CENTERS: 'MillingCenters',
};