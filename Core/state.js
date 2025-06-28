export class AppState {
    constructor() {
        this.maxDBRRatio = 50;
        this.minInterestRate = 22.75;
        this.isIncomeMode = true;
        this.currentLanguage = "ar";
        this.isYears = true;
    }

    updateLanguage(lang) {
        this.currentLanguage = lang;
        this.notifyObservers('languageChanged');
    }

    toggleMode() {
        this.isIncomeMode = !this.isIncomeMode;
        this.notifyObservers('modeChanged');
    }

    // Observer pattern for state changes
    observers = [];
    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers(event) {
        this.observers.forEach(callback => callback(event, this));
    }
}