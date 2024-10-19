const forms = {
    email(value) {
        const re = /^\S+@\S+\.\S+/;
        return re.test(value);
    },

    /**
     * Validates a password field
     * @param value
     * @returns {boolean}
     */
    password(value) {
        return this.notEmpty(value);
    },
    /**
 * Validates a first or last name field
 */
    isValidName(value) {
        if (value.length > 2) {
            const re = /^\S{1,3}/;
            return re.test(value);
        }
    },
    /**
   * Validates a phone number field
   */
    isValidPhone(value) {
        if (value.length === 13) {
            const re = /^[(][0-9]{3}[)][0-9]{3}-[0-9]{4}/;
            return re.test(value);
        }
    },

    /**
     * validates if a field is empty
     * @param value
     * @returns {boolean}
     *
     */
    notEmpty(value) {
        return value.length > 0;
    },
};

export default forms;
