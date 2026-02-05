// firestore.js - Enhanced Firestore Data Service with Guaranteed Offline Support

import { getDb } from '../firebase-config.js';

export class FirestoreService {
    static COLLECTIONS = {
        CONSTANTS: 'constants',
        PRODUCTS: 'products'
    };

    // Cache for frequently accessed data
    static cache = {
        constants: null,
        products: null,
        lastFetch: {
            constants: null,
            products: null
        }
    };

    // Cache duration in milliseconds (5 minutes)
    static CACHE_DURATION = 5 * 60 * 1000;

    // CRITICAL: Get initialized Firestore instance
    static async getFirestore() {
        return await getDb();
    }

    // Get constants (rates, margins, etc.) with offline support
    static async getConstants(useCache = true) {
        try {
            // Check cache first if requested
            if (useCache && this.cache.constants && this.isCacheValid('constants')) {
                console.log('📦 Returning constants from memory cache');
                return this.cache.constants;
            }

            // CRITICAL: Wait for Firestore to be initialized with persistence
            const db = await this.getFirestore();

            const doc = await db.collection(this.COLLECTIONS.CONSTANTS)
                .doc('global')
                .get({ source: 'default' }); // Will use IndexedDB cache if offline

            if (doc.exists) {
                const data = doc.data();
                this.cache.constants = data;
                this.cache.lastFetch.constants = Date.now();

                // Log if data came from cache
                if (doc.metadata.fromCache) {
                    console.log('💾 Constants loaded from Firestore offline cache (IndexedDB)');
                } else {
                    console.log('🌐 Constants loaded from server');
                }

                return data;
            } else {
                // Return defaults if not found
                console.log('⚠️ Constants not found, using defaults');
                return this.getDefaultConstants();
            }
        } catch (error) {
            console.error('❌ Error fetching constants:', error);

            // If we have cached data, return it even if expired
            if (this.cache.constants) {
                console.log('📦 Returning expired memory cache due to error');
                return this.cache.constants;
            }

            console.log('⚠️ No cache available, using defaults');
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

    // Update constants with offline queue support
    static async updateConstants(constants) {
        try {
            // CRITICAL: Wait for Firestore to be initialized
            const db = await this.getFirestore();

            await db.collection(this.COLLECTIONS.CONSTANTS)
                .doc('global')
                .set(constants, { merge: true });

            // Update cache
            this.cache.constants = constants;
            this.cache.lastFetch.constants = Date.now();

            console.log('✅ Constants updated successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating constants:', error);

            // If offline, the write is queued automatically by Firestore
            if (error.code === 'unavailable') {
                console.log('📤 Update queued for when online');
                return { success: true, queued: true };
            }

            return { success: false, error: error.message };
        }
    }

    // Get all products with offline support
    static async getProducts(useCache = true) {
        try {
            // Check cache first if requested
            if (useCache && this.cache.products && this.isCacheValid('products')) {
                console.log('📦 Returning products from memory cache');
                return this.cache.products;
            }

            // CRITICAL: Wait for Firestore to be initialized
            const db = await this.getFirestore();

            const snapshot = await db.collection(this.COLLECTIONS.PRODUCTS)
                .get({ source: 'default' }); // Will use IndexedDB cache if offline

            const products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });

            // Update cache
            this.cache.products = products;
            this.cache.lastFetch.products = Date.now();

            // Log if data came from cache
            if (snapshot.metadata.fromCache) {
                console.log('💾 Products loaded from Firestore offline cache (IndexedDB)');
            } else {
                console.log('🌐 Products loaded from server');
            }

            return products;
        } catch (error) {
            console.error('❌ Error fetching products:', error);

            // If we have cached data, return it even if expired
            if (this.cache.products) {
                console.log('📦 Returning expired memory cache due to error');
                return this.cache.products;
            }

            return [];
        }
    }

    // Get product by ID with offline support
    static async getProduct(id) {
        try {
            // CRITICAL: Wait for Firestore to be initialized
            const db = await this.getFirestore();

            const doc = await db.collection(this.COLLECTIONS.PRODUCTS)
                .doc(id)
                .get({ source: 'default' });

            if (doc.exists) {
                if (doc.metadata.fromCache) {
                    console.log(`💾 Product ${id} loaded from Firestore offline cache`);
                }
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Error fetching product:', error);

            // Try to find in cached products list
            if (this.cache.products) {
                const product = this.cache.products.find(p => p.id === id);
                if (product) {
                    console.log('📦 Returning product from memory cache');
                    return product;
                }
            }

            return null;
        }
    }

    // Add or update product with offline queue support
    static async saveProduct(productData, id = null) {
        try {
            // CRITICAL: Wait for Firestore to be initialized
            const db = await this.getFirestore();

            if (id) {
                await db.collection(this.COLLECTIONS.PRODUCTS)
                    .doc(id)
                    .set(productData, { merge: true });
            } else {
                await db.collection(this.COLLECTIONS.PRODUCTS)
                    .add(productData);
            }

            // Invalidate cache to force refresh
            this.cache.products = null;

            console.log('✅ Product saved successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving product:', error);

            // If offline, the write is queued automatically by Firestore
            if (error.code === 'unavailable') {
                console.log('📤 Save queued for when online');
                this.cache.products = null; // Invalidate to force refresh
                return { success: true, queued: true };
            }

            return { success: false, error: error.message };
        }
    }

    // Delete product with offline queue support
    static async deleteProduct(id) {
        try {
            // CRITICAL: Wait for Firestore to be initialized
            const db = await this.getFirestore();

            await db.collection(this.COLLECTIONS.PRODUCTS)
                .doc(id)
                .delete();

            // Invalidate cache
            this.cache.products = null;

            console.log('✅ Product deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting product:', error);

            // If offline, the write is queued automatically by Firestore
            if (error.code === 'unavailable') {
                console.log('📤 Delete queued for when online');
                this.cache.products = null; // Invalidate to force refresh
                return { success: true, queued: true };
            }

            return { success: false, error: error.message };
        }
    }

    // Check if cache is still valid
    static isCacheValid(key) {
        if (!this.cache.lastFetch[key]) return false;
        const age = Date.now() - this.cache.lastFetch[key];
        return age < this.CACHE_DURATION;
    }

    // Force cache refresh
    static async refreshCache() {
        this.cache.constants = null;
        this.cache.products = null;
        this.cache.lastFetch.constants = null;
        this.cache.lastFetch.products = null;

        // Fetch fresh data
        await Promise.all([
            this.getConstants(false),
            this.getProducts(false)
        ]);

        console.log('✅ Cache refreshed');
    }

    // Clear cache
    static clearCache() {
        this.cache.constants = null;
        this.cache.products = null;
        this.cache.lastFetch.constants = null;
        this.cache.lastFetch.products = null;
        console.log('🗑️ Memory cache cleared');
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

    // Listen to real-time updates for constants
    static async listenToConstants(callback) {
        // CRITICAL: Wait for Firestore to be initialized
        const db = await this.getFirestore();

        return db.collection(this.COLLECTIONS.CONSTANTS)
            .doc('global')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    this.cache.constants = data;
                    this.cache.lastFetch.constants = Date.now();
                    callback(data);
                }
            }, (error) => {
                console.error('❌ Error listening to constants:', error);
            });
    }

    // Listen to real-time updates for products
    static async listenToProducts(callback) {
        // CRITICAL: Wait for Firestore to be initialized
        const db = await this.getFirestore();

        return db.collection(this.COLLECTIONS.PRODUCTS)
            .onSnapshot((snapshot) => {
                const products = [];
                snapshot.forEach(doc => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                this.cache.products = products;
                this.cache.lastFetch.products = Date.now();
                callback(products);
            }, (error) => {
                console.error('❌ Error listening to products:', error);
            });
    }
}