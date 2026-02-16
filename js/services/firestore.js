// firestore.js - Firestore Data Service

import { db } from '../firebase-config.js';
import {
    collection,
    doc,    
    getDocFromCache,
    getDocFromServer,
    getDocsFromCache,
    getDocsFromServer,
    setDoc,
    writeBatch,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class FirestoreService {
    static COLLECTIONS = {
        CONSTANTS: 'constants',
        PRODUCTS: 'products'
    };

    // Mapping for generating readable IDs
    static ID_MAPPINGS = {
        sector: {
            'Government/Public': 'gov',
            'Private': 'pr',
            'Not Specified': 'na'
        },
        payrollType: {
            'Contracted': 'c',
            'Non-Contracted': 'nc',
            'Not Specified': 'na'
        },
        companySegment: {
            'A+': 'aa',
            'A': 'a',
            'B': 'b',
            'C': 'c',
            'Not Specified': 'na'
        }
    };

    // Generate a readable Firestore document ID from product data
    static generateProductId(product) {
        const ubsCode = (product.ubsCode || '').trim();
        const sector = this.ID_MAPPINGS.sector[product.sector] || 'na';
        const payroll = this.ID_MAPPINGS.payrollType[product.payrollType] || 'na';
        const segment = this.ID_MAPPINGS.companySegment[product.companySegment] || 'na';

        return `${ubsCode}-${sector}-${payroll}-${segment}`.toLowerCase();
    }

    // Get constants (rates, margins, etc.)
    static async getConstants() {
        const docRef = doc(db, 'constants', 'global');

        // 1. If Offline: Strictly use Cache
        if (!navigator.onLine) {
            try {
                const cacheSnap = await getDocFromCache(docRef);
                return cacheSnap.data();
            } catch (e) {
                console.warn("Offline: Constants not found in cache. Using defaults.");
                return this.getDefaultConstants();
            }
        }

        // 2. If Online: Fetch from Server (this updates the cache automatically)
        try {
            const serverSnap = await getDocFromServer(docRef);
            return serverSnap.exists() ? serverSnap.data() : this.getDefaultConstants();
        } catch (e) {
            // Fallback to cache if server request fails (e.g. DNS issues)
            const fallbackSnap = await getDocFromCache(docRef).catch(() => null);
            return fallbackSnap ? fallbackSnap.data() : this.getDefaultConstants();
        }
    }

    // Get default constants
    static getDefaultConstants() {
        return {
            CD_RATE: 0.16,
            TD_MARGIN: 0.02,
            MIN_RATE: 0.18,
            MAX_LOAN_PERCENT: 0.90,
            MAX_DBR_RATIO: 0.50,
            STAMP_DUTY_RATE: 0.0005, // Stored as real ratio (0.5‰ = 0.0005)
            SCENARIOS: {
                INTEREST_UPFRONT_PERCENT: 36,
                LOAN_CERTIFICATE_PERCENT: 58
            },
            // Secured loan tenor limits
            SECURED_MIN_TENOR_MONTHS: 6,
            SECURED_MAX_TENOR_YEARS: 10,
            // Unsecured loan tenor limits
            UNSECURED_MAX_TENOR_8_PLUS_YEARS: 10,
            // Credit cards constants
            CREDIT_CARDS: {
                REGULAR_RATES: {
                    3: 0.0281,
                    6: 0.0277,
                    9: 0.0276,
                    12: 0.0273,
                    18: 0.0267,
                    24: 0.0263,
                    36: 0.0256
                },
                STAFF_RATE: 0.0225,
                ADMIN_FEES: {
                    3: 0.0485,
                    6: 0.084,
                    9: 0.115,
                    12: 0.145,
                    18: 0.1983,
                    24: 0.25,
                    36: 0.33
                }
            }
        };
    }

    // Update constants
    static async updateConstants(constants) {
        try {
            const docRef = doc(db, this.COLLECTIONS.CONSTANTS, 'global');

            // Add metadata
            const dataToSave = {
                ...constants,
                updatedAt: new Date().toISOString()
            };

            await setDoc(docRef, dataToSave, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error updating constants:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all products
    static async getProducts() {
        const colRef = collection(db, 'products');

        if (!navigator.onLine) {
            try {
                const cacheSnap = await getDocsFromCache(colRef);
                return cacheSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            } catch (e) {
                return [];
            }
        }

        try {
            const serverSnap = await getDocsFromServer(colRef);
            return serverSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            const fallbackSnap = await getDocsFromCache(colRef).catch(() => null);
            return fallbackSnap ? fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        }
    }

    // Get product by ID - FIXED to use proper offline-first logic
    static async getProduct(id) {
        const docRef = doc(db, this.COLLECTIONS.PRODUCTS, id);

        // 1. If Offline: Use Cache
        if (!navigator.onLine) {
            try {
                const cacheSnap = await getDocFromCache(docRef);
                return cacheSnap.exists() ? { id: cacheSnap.id, ...cacheSnap.data() } : null;
            } catch (e) {
                console.warn("Offline: Product not found in cache.");
                return null;
            }
        }

        // 2. If Online: Fetch from Server
        try {
            const serverSnap = await getDocFromServer(docRef);
            return serverSnap.exists() ? { id: serverSnap.id, ...serverSnap.data() } : null;
        } catch (e) {
            // Fallback to cache if server request fails
            const fallbackSnap = await getDocFromCache(docRef).catch(() => null);
            return fallbackSnap && fallbackSnap.exists() ? { id: fallbackSnap.id, ...fallbackSnap.data() } : null;
        }
    }

    // Validate product data before saving
    static validateProduct(productData) {
        const errors = [];

        // Required fields
        if (!productData.ubsCode || !productData.ubsCode.trim()) {
            errors.push('UBS Code is required');
        }
        if (!productData.nameEn || !productData.nameEn.trim()) {
            errors.push('Product Name (EN) is required');
        }

        // Rate validation: If rate8Plus exists, rate5_8 must exist
        if (productData.rate8Plus && productData.rate8Plus !== '' &&
            (!productData.rate5_8 || productData.rate5_8 === '')) {
            errors.push('If Rate 8+ exists, Rate 5-8 must also exist');
        }

        // Rate validation: If rate5_8 exists, rate1_5 must exist
        if (productData.rate5_8 && productData.rate5_8 !== '' &&
            (!productData.rate1_5 || productData.rate1_5 === '')) {
            errors.push('If Rate 5-8 exists, Rate 1-5 must also exist');
        }

        // Validate rate formats
        ['rate1_5', 'rate5_8', 'rate8Plus'].forEach(rateField => {
            if (productData[rateField] && productData[rateField] !== '') {
                const normalized = this.normalizeInterestRate(productData[rateField]);
                if (normalized === null) {
                    errors.push(`Invalid ${rateField}: ${productData[rateField]}`);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Normalize interest rate to always end with %
    static normalizeInterestRate(value) {
        if (!value || value === '') return '';

        // Remove any whitespace
        const trimmed = String(value).trim();

        // Remove % if present
        const numericValue = trimmed.replace('%', '');

        // Parse as float
        const parsed = parseFloat(numericValue);

        // Validate
        if (isNaN(parsed) || parsed < 0) {
            return null; // Invalid
        }

        // Return with % suffix
        return `${parsed}%`;
    }

    // Add or update product with readable ID
    static async saveProduct(productData, existingId = null) {
        try {
            // Validate product data
            const validation = this.validateProduct(productData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join('; ')
                };
            }

            // Normalize interest rates
            ['rate1_5', 'rate5_8', 'rate8Plus'].forEach(rateField => {
                if (productData[rateField]) {
                    productData[rateField] = this.normalizeInterestRate(productData[rateField]);
                }
            });

            // Generate or use existing ID
            const productId = existingId || this.generateProductId(productData);

            // Check if product already exists (only if creating new)
            if (!existingId) {
                const existing = await this.getProduct(productId);
                if (existing) {
                    return {
                        success: false,
                        error: `Product with ID ${productId} already exists. Edit existing product instead.`
                    };
                }
            }

            // Add metadata
            const timestamp = new Date().toISOString();
            const dataToSave = {
                ...productData,
                active: productData.active !== undefined ? productData.active : true,
                updatedAt: timestamp,
                ...(existingId ? {} : { createdAt: timestamp })
            };

            const docRef = doc(db, this.COLLECTIONS.PRODUCTS, productId);
            await setDoc(docRef, dataToSave, { merge: existingId ? true : false });

            return { success: true, id: productId };
        } catch (error) {
            console.error('Error saving product:', error);
            return { success: false, error: error.message };
        }
    }

    // Batch import products (for CSV import)
    static async batchImportProducts(productsArray) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        // Validate all products first
        const validProducts = [];
        for (const product of productsArray) {
            const validation = this.validateProduct(product);
            if (validation.isValid) {
                // Normalize rates
                ['rate1_5', 'rate5_8', 'rate8Plus'].forEach(rateField => {
                    if (product[rateField]) {
                        product[rateField] = this.normalizeInterestRate(product[rateField]);
                    }
                });
                validProducts.push(product);
            } else {
                results.failed++;
                results.errors.push({
                    product: product.nameEn || product.ubsCode || 'Unknown',
                    errors: validation.errors
                });
            }
        }

        if (validProducts.length === 0) {
            return results;
        }

        // Use batch writes for better performance
        const batch = writeBatch(db);
        const timestamp = new Date().toISOString();

        for (const product of validProducts) {
            const productId = this.generateProductId(product);
            const docRef = doc(db, this.COLLECTIONS.PRODUCTS, productId);

            batch.set(docRef, {
                ...product,
                active: true,
                createdAt: timestamp,
                updatedAt: timestamp
            }, { merge: true });
        }

        try {
            await batch.commit();
            results.success = validProducts.length;
        } catch (error) {
            console.error('Batch import error:', error);
            results.failed += validProducts.length;
            results.errors.push({
                product: 'Batch operation',
                errors: [error.message]
            });
        }

        return results;
    }

    // Delete product (or soft delete)
    static async deleteProduct(id, softDelete = false) {
        try {
            const docRef = doc(db, this.COLLECTIONS.PRODUCTS, id);

            if (softDelete) {
                // Soft delete: mark as inactive
                await setDoc(docRef, {
                    active: false,
                    deletedAt: new Date().toISOString()
                }, { merge: true });
            } else {
                // Hard delete
                await deleteDoc(docRef);
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    }

    // Filter products by criteria (Helper function)
    static filterProducts(products, criteria) {
        return products.filter(product => {
            let match = true;

            // Filter out inactive products by default
            if (criteria.includeInactive !== true && product.active === false) {
                return false;
            }

            if (criteria.sector && product.sector !== criteria.sector) match = false;
            if (criteria.payrollType && product.payrollType !== criteria.payrollType) match = false;
            if (criteria.companySegment && product.companySegment !== criteria.companySegment) match = false;

            return match;
        });
    }

    // Get rate helper
    static getProductRate(product, tenorYears) {
        if (tenorYears <= 5 && product.rate1_5) {
            const rate = product.rate1_5.toString().replace('%', '');
            return parseFloat(rate) / 100;
        } else if (tenorYears <= 8 && product.rate5_8) {
            const rate = product.rate5_8.toString().replace('%', '');
            return parseFloat(rate) / 100;
        } else if (product.rate8Plus) {
            const rate = product.rate8Plus.toString().replace('%', '');
            return parseFloat(rate) / 100;
        }
        return null;
    }

    // Get the effective maximum tenor (in years) for an unsecured product
    static getProductMaxTenorYears(product, constants = null) {
        const globalMax = constants?.UNSECURED_MAX_TENOR_8_PLUS_YEARS ?? 10;

        if (product.rate8Plus && product.rate8Plus !== '' && parseFloat(product.rate8Plus.toString().replace('%', '')) > 0) {
            return globalMax;
        }
        if (product.rate5_8 && product.rate5_8 !== '' && parseFloat(product.rate5_8.toString().replace('%', '')) > 0) {
            return 8;
        }
        if (product.rate1_5 && product.rate1_5 !== '' && parseFloat(product.rate1_5.toString().replace('%', '')) > 0) {
            return 5;
        }
        return 0; // No valid rate
    }
}