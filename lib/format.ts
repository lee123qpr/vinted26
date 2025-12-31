export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '£0.00';
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
