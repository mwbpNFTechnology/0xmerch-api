// utils/numberUtils.js

/**
 * Converts a value from wei to ETH.
 * For example, 1000000000000000 wei returns 0.001 ETH.
 *
 * @param {number} value - The amount in wei.
 * @returns {number} - The equivalent amount in ETH.
 */
 export function wgiToEth(value: number) {
    return Number(value) / 1e18;
  }
  
  /**
   * Converts a basis points value to a percentage.
   * For example, 5000 returns 50.
   *
   * @param {number} value - The value in basis points.
   * @returns {number} - The equivalent percentage.
   */
  export function getPrecent(value: number) {
    return Number(value) / 100;
  }