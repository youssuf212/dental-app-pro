import { Order } from './types';

export const SERVICE_PRICES: { [key: string]: number } = {
    'Kram Crown implant Titanium': 220,
    'Doycineum Crown': 200,
    'Zirconia Crown': 155,
    'E-Max Crown': 175,
    'E-Max Veneers': 175,
    'Denture Repair': 75,
    'Implant Abutment': 250,
};

export function deriveOrdersFromCaseName(caseName: string): Order[] {
    const orders: Order[] = [];
    if (!caseName) return orders;

    const lowerCaseName = caseName.toLowerCase();
    
    const quantityMatch = lowerCaseName.match(/(\d+)\s*x/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;

    for (const service in SERVICE_PRICES) {
        const simplifiedServiceName = service.toLowerCase().replace(' crown', '').replace(' implant', '').replace(' titanium', '').trim();
        if (lowerCaseName.includes(simplifiedServiceName)) {
            // Fix: Added missing 'teeth' property to the Order object to match the type definition.
             orders.push({
                serviceName: service,
                price: SERVICE_PRICES[service],
                quantity,
                teeth: [],
            });
            // assume one service type per case name for simplicity
            return orders;
        }
    }
    
    // Fallback for generic terms
    if (orders.length === 0 && lowerCaseName.includes('crown')) {
        // Fix: Added missing 'teeth' property to the Order object to match the type definition.
         orders.push({ serviceName: 'Zirconia Crown', price: SERVICE_PRICES['Zirconia Crown'], quantity: 1, teeth: [] });
    }
     if (orders.length === 0 && lowerCaseName.includes('veneer')) {
        // Fix: Added missing 'teeth' property to the Order object to match the type definition.
         orders.push({ serviceName: 'E-Max Veneers', price: SERVICE_PRICES['E-Max Veneers'], quantity: quantity, teeth: [] });
    }
    
    return orders;
}