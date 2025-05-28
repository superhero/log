/**
 * Converts a hex color string to an RGB array, case insensitive.
 * 
 * @param {string} hex - The hex color string (e.g., "#ff5733").
 * @returns {number[]} An array containing the RGB values [r, g, b].
 * 
 * @throws {TypeError}  E_LOG_INVALID_HEX_COLOR - If the input is not a valid hex color string.
 * @throws {RangeError} E_LOG_INVALID_HEX_COLOR - If the hex color string is not 3 or 6 digits.
 */
export default function(hex)
{
  if(typeof hex !== 'string')
  {
    const error = new TypeError(`Hex color must be a string, got ${typeof hex}`)
    error.code  = 'E_LOG_INVALID_HEX_COLOR'
    throw error
  }

  let match

  if((match = /^#?([a-f\d]{6})$/i.exec(hex)))
  {
    return [
      parseInt(match[1].slice(0, 2), 16),
      parseInt(match[1].slice(2, 4), 16),
      parseInt(match[1].slice(4, 6), 16)
    ]
  }

  if((match = /^#?([a-f\d]{3})$/i.exec(hex)))
  {
    return match[1].split('').map(ch => parseInt(ch + ch, 16))
  }

  const error = new RangeError(`Invalid hex color: "${hex}"`)
  error.code  = 'E_LOG_INVALID_HEX_COLOR'
  error.cause = 'Size must be 3 or 6 digits (base 16) between 0-f case insensitive'
  throw error
}