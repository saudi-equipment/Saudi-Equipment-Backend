
export const formatPrice = (price: number): number => {
    // Convert to string to check the number of digits
    const priceString = price.toString();
    
    // If price has more than 2 digits, take only the first two
    if (priceString.length > 2) {
      return parseInt(priceString.substring(0, 2), 10);
    }

    return price;
  };