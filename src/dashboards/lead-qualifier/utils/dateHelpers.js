export const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start of week
    return new Date(d.setDate(diff));
};

export const getEndOfWeek = (date) => {
    const startOfWeek = getStartOfWeek(date);
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
};

export const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

export const isThisWeek = (date) => {
    const today = new Date();
    const startOfThisWeek = getStartOfWeek(today);
    const endOfThisWeek = getEndOfWeek(today);
    const d = new Date(date);
    return d >= startOfThisWeek && d <= endOfThisWeek;
};

export const isPreviousWeeks = (date) => {
    const today = new Date();
    const startOfThisWeek = getStartOfWeek(today);
    const d = new Date(date);
    return d < startOfThisWeek;
};

export const isThisMonth = (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};
