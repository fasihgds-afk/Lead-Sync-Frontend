import dataMinorAPI from '../../../api/data-minor';


const dataMinerService = {
    /**
     * Prepares and validates lead data before submission
     * @param {Object} formData - Main form state
     * @param {Array} emailFields - Additional email fields
     * @param {Array} phoneFields - Additional phone fields
     * @returns {Object} Cleaned and structured lead data
     */
    prepareLeadData: (formData, emailFields, phoneFields) => {
        // Collect and clean emails
        const emails = [formData.primaryEmail, ...emailFields.map(f => f.value)]
            .map(e => e.trim())
            .filter(e => e !== "");

        // Collect and clean phones (only 10-digit valid numbers)
        const phones = [formData.primaryPhone, ...phoneFields.map(f => f.value)]
            .map(p => p.replace(/\D/g, ''))
            .filter(p => p.length === 10);

        // Process sources
        const sources = [];
        if (formData.leadSource && formData.leadSource !== "Other") {
            if (formData.sourceUrl) {
                sources.push({
                    name: formData.leadSource,
                    link: formData.sourceUrl.trim()
                });
            }
        } else if (formData.leadSource === "Other" && formData.customSourceName) {
            if (formData.sourceUrl) {
                sources.push({
                    name: formData.customSourceName.trim(),
                    link: formData.sourceUrl.trim()
                });
            }
        }

        return {
            name: formData.firstName?.trim() || "",
            location: formData.location?.trim() || "",
            emails,
            phones,
            sources
        };
    },

    /**
     * Client-side validation before submission
     * @param {Object} data - Prepared lead data
     * @returns {Object} Validation result with ok status and message
     */
    validateLead: (data) => {
        if (!data.name) {
            return { ok: false, message: "First Name is required" };
        }

        if (data.emails.length === 0 && data.phones.length === 0) {
            return {
                ok: false,
                message: "At least one valid email or 10-digit phone is required"
            };
        }

        if (data.sources.length === 0) {
            return {
                ok: false,
                message: "At least one valid source link is required"
            };
        }

        // Validate email format and limit
        if (data.emails.length > 10) {
            return {
                ok: false,
                message: "Maximum 10 emails allowed"
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const email of data.emails) {
            if (!emailRegex.test(email)) {
                return {
                    ok: false,
                    message: `Invalid email format: ${email}`
                };
            }
        }

        return { ok: true };
    },

    /**
     * Checks if a value is duplicated within the current form fields
     * @param {string} type - 'email' or 'phone'
     * @param {string} value - Value to check
     * @param {Object} currentFormState - Current form values
     * @returns {boolean} True if local duplicate exists
     */
    isLocalDuplicate: (type, value, currentFormState) => {
        if (!value) return false;

        if (type === 'email') {
            const allEmails = [
                currentFormState.primaryEmail,
                ...currentFormState.extraEmails
            ];
            return allEmails.filter(v => v === value).length > 1;
        } else {
            const allPhones = [
                currentFormState.primaryPhone,
                ...currentFormState.extraPhones
            ];
            return allPhones.filter(v => v === value).length > 1;
        }
    },

    /**
     * Performs comprehensive duplicate check (local + server)
     * @param {string} type - 'email' or 'phone'
     * @param {string} value - Value to check
     * @param {Object} currentFormState - Current form values
     * @returns {Object} Duplicate status with details
     */
    checkDuplicate: async (type, value, currentFormState) => {
        // Empty value check
        if (!value) {
            return { checked: false, isDuplicate: false };
        }

        // Phone length validation
        if (type === 'phone' && value.length !== 10) {
            return {
                checked: true,
                isDuplicate: false,
                isShort: true,
                message: "Must be exactly 10 digits"
            };
        }

        // Minimum length check
        if (value.length < 3) {
            return { checked: false, isDuplicate: false };
        }

        // Local duplicate check
        const isLocal = dataMinerService.isLocalDuplicate(type, value, currentFormState);
        if (isLocal) {
            return {
                checked: true,
                isDuplicate: true,
                isLocal: true,
                message: "Already entered in form"
            };
        }

        // Server duplicate check
        try {
            const result = await dataMinerService.checkServerDuplicate(type, value);

            const isDuplicate = type === 'email'
                ? (result.email?.exists || result.emailLocalPart?.exists)
                : result.phone?.exists;

            return {
                checked: true,
                isDuplicate,
                message: isDuplicate ? "Already in system" : "Available",
                match: isDuplicate
                    ? (type === 'email'
                        ? (result.email?.match || result.emailLocalPart?.match)
                        : result.phone?.match)
                    : null
            };
        } catch (err) {
            console.error("Duplicate check failed:", err);
            return {
                checked: true,
                isDuplicate: false,
                error: true,
                message: "Check failed"
            };
        }
    },

    /**
     * Submit lead to server
     * @param {Object} leadData - Prepared and validated lead data
     * @returns {Object} Server response
     */
    submitLead: async (leadData) => {
        return await dataMinorAPI.submitLead(leadData);
    },

    /**
     * Real-time duplicate check against database
     * @param {string} type - 'email' or 'phone'
     * @param {string} value - Value to check
     * @returns {Object} Server duplicate check result
     */
    checkServerDuplicate: async (type, value) => {
        return await dataMinorAPI.checkDuplicates({ [type]: value });
    },

    /**
     * Get user statistics
     * @returns {Object} User stats (today count, month count)
     */
    getMyStats: async () => {
        return await dataMinorAPI.getMyStats();
    }
};

export default dataMinerService;
