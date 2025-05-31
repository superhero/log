/**
 * Unicode border/box drawing characters
 */
export default
{
  'light':
  {
    horizontal  : '─', vertical     : '│', 
    topLeft     : '┌', topRight     : '┐', 
    bottomLeft  : '└', bottomRight  : '┘',
    teeLeft     : '├', teeRight     : '┤', 
    teeUp       : '┬', teeDown      : '┴', 
    cross       : '┼'
  },
  'heavy':
  {
    horizontal  : '━', vertical     : '┃',
    topLeft     : '┏', topRight     : '┓', 
    bottomLeft  : '┗', bottomRight  : '┛',
    teeLeft     : '┣', teeRight     : '┫', 
    teeUp       : '┳', teeDown      : '┻', 
    cross       : '╋'
  },
  'light-heavy':
  {
    horizontal  : '━', vertical    : '│',
    topLeft     : '┍', topRight    : '┑', 
    bottomLeft  : '┕', bottomRight : '┙',
    teeLeft     : '┝', teeRight    : '┥', 
    teeUp       : '┯', teeDown     : '┷',
    cross       : '┿',
  },
  'heavy-light':
  {
    horizontal  : '─', vertical    : '┃', 
    topLeft     : '┎', topRight    : '┒', 
    bottomLeft  : '┖', bottomRight : '┚',
    teeLeft     : '┠', teeRight    : '┨',
    teeLeft2    : '┞', teeRight2   : '┦', 
    teeUp       : '┰', teeDown     : '┸',
    cross       : '╂',
  },
  'double':
  {
    horizontal  : '═', vertical    : '║', 
    topLeft     : '╔', topRight    : '╗', 
    bottomLeft  : '╚', bottomRight : '╝',
    teeLeft     : '╠', teeRight    : '╣', 
    teeUp       : '╦', teeDown     : '╩', 
    cross       : '╬'
  },
  'light-double':
  {
    horizontal  : '═', vertical    : '│',
    topLeft     : '╒', topRight    : '╕',
    bottomLeft  : '╘', bottomRight : '╛',
    teeLeft     : '╞', teeRight    : '╡', 
    teeUp       : '╤', teeDown     : '╧', 
    cross       : '╪'
  },
  'double-light':
  {
    horizontal  : '─', vertical    : '║',
    topLeft     : '╓', topRight    : '╖', 
    bottomLeft  : '╙', bottomRight : '╜',
    teeLeft     : '╟', teeRight    : '╢', 
    teeUp       : '╥', teeDown     : '╨',
    cross       : '╫'
  },
  'dashed':
  {
    horizontal  : '╌', vertical     : '┊',
  },
  'dashed-2':
  {
    horizontal  : '╌', vertical     : '╎',
  },
  'dashed-3':
  {
    horizontal  : '┄', vertical     : '┆',
  },
  'dashed-4':
  {
    horizontal  : '┈', vertical     : '┊',
  },
  'dashed-heavy':
  {
    horizontal  : '╍', vertical     : '┇',
  },
  'dashed-2-heavy':
  {
    horizontal  : '╍', vertical     : '╏',
  },
  'dashed-3-heavy':
  {
    horizontal2 : '┅', vertical3    : '┇',
  },
  'light-half':
  {
    teeLeft     : '╶', teeRight     : '╴',
    teeUp       : '╷', teeDown      : '╵',
  },
  'heavy-half':
  {
    teeUp       : '╻', teeDown      : '╹',
    teeLeft     : '╺', teeRight     : '╸',
  },
  'mixed':
  {
    horizontal  : '╾', horizontal2  : '╼', 
    vertical    : '╽', vertical2    : '╿',
    teeUp       : '┭', teeUp2       : '┮',
    teeDown     : '┵', teeDown2     : '┶',
    cross       : '┽', cross2       : '┾',
    teeUp3      : '┱', teeDown3     : '┹',
    teeUp4      : '┲', teeDown4     : '┺',
    cross3      : '╀', cross4       : '╁', 
    cross5      : '╃', cross6       : '╄', 
    cross7      : '╅', cross8       : '╆', 
    cross9      : '╇', cross10      : '╈', 
    cross11     : '╉', cross12      : '╊',
  },
  'cell-arc':
  {
    topLeft     : '╭', topRight    : '╮', 
    bottomLeft  : '╰', bottomRight : '╯',
  },
  'cell-diagonal':
  {
    topLeft     : '╱',  topRight    : '╲', 
    bottomLeft  : '╲',  bottomRight : '╱',
    cross       : '╳',
  },
  'block':
  {
    shade       : '█', shade2       : '▒',
    shade3      : '▒', shade4       : '░',
    top         : '▀', bottom       : '▄',
    left        : '▌', right        : '▐',
    topLeft     : '▛', topRight     : '▜',
    bottomLeft  : '▙', bottomRight  : '▟',
  },
  'block-light':
  {
    top         : '▔', bottom       : '▁',
    left        : '▏', right        : '▕',
  },
  'block-half':
  {
    topLeft     : '▘', topRight     : '▝',
    bottomLeft  : '▖', bottomRight  : '▗',
  }
}