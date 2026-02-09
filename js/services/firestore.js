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
    addDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class FirestoreService {
    static COLLECTIONS = {
        CONSTANTS: 'constants',
        PRODUCTS: 'products'
    };

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
            STAMP_DUTY_RATE: 0.50,
            SCENARIOS: {
                INTEREST_UPFRONT_PERCENT: 36,
                LOAN_CERTIFICATE_PERCENT: 58
            },
            // Secured loan tenor limits
            SECURED_MIN_TENOR_MONTHS: 6,
            SECURED_MAX_TENOR_YEARS: 10,
            // Unsecured loan tenor limits
            UNSECURED_MAX_TENOR_8_PLUS_YEARS: 10
        };
    }

    // Update constants
    static async updateConstants(constants) {
        try {
            const docRef = doc(db, this.COLLECTIONS.CONSTANTS, 'global');
            await setDoc(docRef, constants, { merge: true });
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

    // Get product by ID
    static async getProduct(id) {
        try {
            const docRef = doc(db, this.COLLECTIONS.PRODUCTS, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
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
                const docRef = doc(db, this.COLLECTIONS.PRODUCTS, id);
                await setDoc(docRef, productData, { merge: true });
            } else {
                await addDoc(collection(db, this.COLLECTIONS.PRODUCTS), productData);
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
            const docRef = doc(db, this.COLLECTIONS.PRODUCTS, id);
            await deleteDoc(docRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    }

    // Filter products by criteria (Helper function, logic remains same)
    static filterProducts(products, criteria) {
        return products.filter(product => {
            let match = true;
            if (criteria.sector && product.sector !== criteria.sector) match = false;
            if (criteria.payrollType && product.payrollType !== criteria.payrollType) match = false;
            if (criteria.companySegment && product.companySegment !== criteria.companySegment) match = false;
            return match;
        });
    }

    // Get rate helper (Logic remains same)
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