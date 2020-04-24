const antlr4 = require("antlr4");

/**
 * Custom Error Listener
 *
 * @returns {object}
 */
class ErrorListener extends antlr4.error.ErrorListener {
  /**
   * Checks syntax error
   *
   * @param {Object} recognizer The parsing support code essentially. Most of it is error recovery stuff
   * @param {Object} symbol Offending symbol
   * @param {number} line Line of offending symbol
   * @param {number} column Position in line of offending symbol
   * @param {string} message Error message
   * @param {string} payload Stack trace
   */
  syntaxError(recognizer, symbol, line, column, message, payload) {
    throw new Error({ line, column, message });
  }
}

module.exports = ErrorListener;
