export class InputValidator {
    validateNumeric(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    validateRequired(fields) {
        return fields.every(field => {
            const element = document.getElementById(field.id);
            if (!element) return false;
            
            const isValid = this.validateNumeric(element.value, field.min, field.max);
            element.classList.toggle('error', !isValid);
            return isValid;
        });
    }

    getValidationRules(calculatorType) {
        const rules = {
            'loan': [
                { id: 'principal', min: 1 },
                { id: 'interestRate', min: 0, max: 100 },
                { id: 'minTenor', min: 1 },
                { id: 'maxTenor', min: 1 }
            ],
            'maxLoan': [
                { id: 'interestRate', min: 0, max: 100 },
                { id: 'minTenor', min: 1 },
                { id: 'maxTenor', min: 1 }
            ]
        };
        return rules[calculatorType] || [];
    }
}