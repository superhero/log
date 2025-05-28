/**
 * ANSI escape sequences - SGR - Select Graphic Rendition
 * standardized control to format text in terminal output
 * @example Log.ansi.blue + 'text color' + Log.ansi.reset
 */
export default
{
  'reset'                 : '\x1b[0m',
  [null]                  : '\x1b[0m',
  [false]                 : '\x1b[0m',
  'bold'                  : '\x1b[1m',
  'dim'                   : '\x1b[2m',
  'italic'                : '\x1b[3m',
  'underline'             : '\x1b[4m',
  'blink'                 : '\x1b[5m',
  // 'rapid-blink'           : '\x1b[6m',
  'inverse'               : '\x1b[7m',
  'hidden'                : '\x1b[8m',
  'strikethrough'         : '\x1b[9m',
  // 'fraktur'               : '\x1b[20m',
  // 'double-underline'      : '\x1b[21m',
  'reset-bold'            : '\x1b[22m',
  'reset-dim'             : '\x1b[22m',
  'reset-weight'          : '\x1b[22m',
  'reset-italic'          : '\x1b[23m',
  'reset-underline'       : '\x1b[24m',
  'reset-blink'           : '\x1b[25m',
  // 'reset-rapid-blink'     : '\x1b[26m',
  'reset-inverse'         : '\x1b[27m',
  'reset-hidden'          : '\x1b[28m',
  'reset-strikethrough'   : '\x1b[29m',
  // @example Truecolor     : "rgb:0,255,123" -> "\x1b[38;2;0;255;123m"
  // @example Truecolor (2) : "0,123,45"      -> "\x1b[38;2;0;123;34m"
  // @example Truecolor (3) : "#FFFF00"       -> "\x1b[38;2;255;255;0m"
  // @example Palette 8-bit : "rgb:210"       -> "\x1b[38;5;210m"
  'rgb:'                  : '\x1b[38;',
  'black'                 : '\x1b[30m',
  'red'                   : '\x1b[31m',
  'green'                 : '\x1b[32m',
  'yellow'                : '\x1b[33m',
  'blue'                  : '\x1b[34m',
  'magenta'               : '\x1b[35m',
  'cyan'                  : '\x1b[36m',
  'white'                 : '\x1b[37m',
  'bright-black'          : '\x1b[90m',
  'bright-red'            : '\x1b[91m',
  'bright-green'          : '\x1b[92m',
  'bright-yellow'         : '\x1b[93m',
  'bright-blue'           : '\x1b[94m',
  'bright-magenta'        : '\x1b[95m',
  'bright-cyan'           : '\x1b[96m',
  'bright-white'          : '\x1b[97m',
  'reset-color'           : '\x1b[39m',
  // @example Truecolor     : "bg-rgb:123,255,0"  -> "\x1b[48;2;123;255;0m"
  // @example Truecolor (2) : "bg:0,255,45"       -> "\x1b[48;2;0;255;45m"
  // @example Truecolor (3) : "bg:#00FF00"        -> "\x1b[48;2;0;255;0m"
  // @example Palette 8-bit : "bg-rgb:110"        -> "\x1b[48;5;110m"
  'bg:'                   : '\x1b[48;',
  'bg-rgb:'               : '\x1b[48;',
  'bg-black'              : '\x1b[40m',
  'bg-red'                : '\x1b[41m',
  'bg-green'              : '\x1b[42m',
  'bg-yellow'             : '\x1b[43m',
  'bg-blue'               : '\x1b[44m',
  'bg-magenta'            : '\x1b[45m',
  'bg-cyan'               : '\x1b[46m',
  'bg-white'              : '\x1b[47m',
  'bg-bright-black'       : '\x1b[100m',
  'bg-bright-red'         : '\x1b[101m',
  'bg-bright-green'       : '\x1b[102m',
  'bg-bright-yellow'      : '\x1b[103m',
  'bg-bright-blue'        : '\x1b[104m',
  'bg-bright-magenta'     : '\x1b[105m',
  'bg-bright-cyan'        : '\x1b[106m',
  'bg-bright-white'       : '\x1b[107m',
  'bg-reset'              : '\x1b[49m',
  'reset-bg'              : '\x1b[49m',
}
