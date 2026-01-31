// firestore.js - Firestore Data Service

import { db } from '../firebase-config.js';

export class FirestoreService {
    static COLLECTIONS = {
        CONSTANTS: 'constants',
        PRODUCTS: 'products'
    };

    // Get constants (rates, margins, etc.)
    static async getConstants() {
        try {
            const doc = await db.collection(this.COLLECTIONS.CONSTANTS).doc('global').get();
            if (doc.exists) {
                return doc.data();
            } else {
                // Return defaults if not found
                return this.getDefaultConstants();
            }
        } catch (error) {
            console.error('Error fetching constants:', error);
            return this.getDefaultConstants();
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
            STAMP_DUTY_RATE: 0.50, // per thousand
            // Scenario percentages for Smart Investment Tool
            SCENARIOS: {
                INTEREST_UPFRONT_PERCENT: 36,
                LOAN_CERTIFICATE_PERCENT: 58
            }
        };
    }

    // Update constants
    static async updateConstants(constants) {
        try {
            await db.collection(this.COLLECTIONS.CONSTANTS).doc('global').set(constants, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error updating constants:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all products
    static async getProducts() {
        try {
            const snapshot = await db.collection(this.COLLECTIONS.PRODUCTS).get();
            const products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    // Get product by ID
    static async getProduct(id) {
        try {
            const doc = await db.collection(this.COLLECTIONS.PRODUCTS).doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }

    // Add or update product
    static async saveProduct(productData, id = null) {
        try {
            if (id) {
                await db.collection(this.COLLECTIONS.PRODUCTS).doc(id).set(productData, { merge: true });
            } else {
                await db.collection(this.COLLECTIONS.PRODUCTS).add(productData);
            }
            return { success: true };
        } catch (error) {
            console.error('Error saving product:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete product
    static async deleteProduct(id) {
        try {
            await db.collection(this.COLLECTIONS.PRODUCTS).doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    }

    // Filter products by criteria
    static filterProducts(products, criteria) {
        return products.filter(product => {
            let match = true;

            if (criteria.sector && product.sector !== criteria.sector) match = false;
            if (criteria.payrollType && product.payrollType !== criteria.payrollType) match = false;
            if (criteria.companySegment && product.companySegment !== criteria.companySegment) match = false;

            return match;
        });
    }

    // Get rate for product based on tenor
    static getProductRate(product, tenorYears) {
        if (tenorYears <= 5 && product.rate1_5) {
            return parseFloat(product.rate1_5) / 100;
        } else if (tenorYears <= 8 && product.rate5_8) {
            return parseFloat(product.rate5_8) / 100;
        } else if (product.rate8Plus) {
            return parseFloat(product.rate8Plus) / 100;
        }
        return null;
    }
}