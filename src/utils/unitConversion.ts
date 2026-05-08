export const toBaseStock = (value: number, factor: number) => {
    return value * factor;
};

export const fromBaseStock = (stock: number, factor: number) => {
    return stock / factor;
};
