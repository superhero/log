import { EOL }  from 'node:os'
import Emitter  from 'node:events'
import util     from 'node:util'

export default class Log
{
  /** 
   * Static highlevel event emitter.
   * Offers the ability to listen to all instances log events.
   * @example Log.on('info', (config, ...args) => ...
   * @example Log.on('warn', (config, ...args) => ...
   * @example Log.on('fail', (config, ...args) => ...
   */
  static #emitter           = new Emitter()
  static on                 = Reflect.get(Log.#emitter, 'on')
  static off                = Reflect.get(Log.#emitter, 'off')
  static emit               = Reflect.get(Log.#emitter, 'emit')
  static listenerCount      = Reflect.get(Log.#emitter, 'listenerCount')
  static removeAllListeners = Reflect.get(Log.#emitter, 'removeAllListeners')

  /**
   * Static highlevel configurations...
   * Used for global default configurations.
   * Instance specifications will override the global defaults.
   * @see this.config getter
   */
  static config =
  {
    transform : false,
    inline    : false,
    mute      : false,
    muteInfo  : false,
    muteWarn  : false,
    muteFail  : false,
    returns   : false,
    ansi      : true,
    stdout    : process.stdout, 
    stderr    : process.stderr,
    EOL       : EOL,
    border    : 'light',
    name      : '[LOG]',
    separator : ' ⇢ ',
    label     : Log.ansi['dim'] + Log.ansi['bright-black'],
    text      : Log.ansi['dim'],
    data      : Log.ansi['bright-cyan']
  }

  static ansi       = ansi
  static kaomoji    = kaomoji
  static border     = border
  static symbol     = symbol
  static transform  = transform

  constructor(config)
  {
    config = new Proxy(Object.assign({ emitter:new Emitter }, config),
    {
      get: (target, key) => target[key] ?? Log.config[key]
    })

    Object.defineProperty(this, 'config',  { value: config })
    Object.defineProperty(this, 'emitter', { value: Reflect.get(config, 'emitter') })

    // Inline configuration alias for EOL = ''
    this.inline = this.config.inline 

    // Set the specific configurations for each log method if configured
    this.config.info && this.set.info(this.config.info)
    this.config.warn && this.set.warn(this.config.warn)
    this.config.fail && this.set.fail(this.config.fail)

    // Makes it possible for dependent code to hook into when a log event is 
    // emitted by any of the log instances...
    this.config.emitter?.on('info', (...args) => Log.emit('info', config, ...args))
    this.config.emitter?.on('warn', (...args) => Log.emit('warn', config, ...args))
    this.config.emitter?.on('fail', (...args) => Log.emit('fail', config, ...args))
  }

  /**
   * Set the `inline` property to true or false to determine if the log output
   * should be inline or not (new line at end of line).
   * 
   * @param {boolean} yesNo - true for inline, false for new line
   */
  set inline(yesNo)
  {
    this.config.EOL = Boolean(yesNo) ? '' : this.config.EOL
    return yesNo
  }

  /**
   * Transforms the provided text according to a specified transformation type.
   * @see Log.transform for available transformations.
   * 
   * @param {string} str - The string to be transformed.
   * @param {string} [transformation] - The type of transformation to apply.
   * @returns {string} The transformed string.
   */
  transform(str, transformation = this.config.transform ?? 'circled')
  {
    const
      key = String(transformation).toLowerCase(),
      map = Log.transform[key]

    return map
    ? Array.from(String(str)).map(char => map[char] ?? char).join('')
    : str
  }

  #transform(template)
  {
    return this.config.transform
    ? template.map(str => this.transform(str, this.config.transform))
    : template
  }

  #format(template, ...args)
  {
    template = this.#transform(template)
    return this.config.colors 
    ? this.#colors(template, ...args) 
    : this.#simple(template, ...args)
  }
  
  #simple(...args)
  {
    return this.config.name + this.config.separator + this.#normal(...args)
  }

  #normal(template, ...args)
  {
    return template.reduce((result, part, i) => result + this.#inspect(args[i - 1]) + part)
  }

  /**
   * Mapps the provided format specifications to corresponding ANSI escape sequences.
   * @see Log.ansi for available ANSI escape codes.
   * 
   * @param {string} codes - Spece seperated format specifications
   * @returns {string} ANSI escape sequences
   */
  ansi(codes)
  {
    return String(codes).split(' ').map(code =>
    {
      // all ansi codes are listed in lower case
      const key = code.toLowerCase()

      // is it a named ansi escape code?
      if(key in Log.ansi)
      {
        return Log.ansi[key]
      }

      // is it a hex color?
      if(/^(bg(-rgb)?:|rgb:)?#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g.test(key))
      {
        const [r, g, b] = hex2rgb(key.split('#').pop())
        return key.startsWith('bg')
        ? `${Log.ansi['bg:' ]};2;${r};${g};${b}m`
        : `${Log.ansi['rgb:']};2;${r};${g};${b}m`
      }

      // is it an rgb color?
      if(/^(bg(-rgb)?:|rgb:)?(\d{1,3}),(\d{1,3}),(\d{1,3})$/.test(key))
      {
        const [r, g, b] = key.split(':').pop().split(',')
        return key.startsWith('bg')
        ? `${Log.ansi['bg:' ]};2;${r};${g};${b}m`
        : `${Log.ansi['rgb:']};2;${r};${g};${b}m`
      }

      // is it an 8-bit palette color?
      if(/^(bg(-rgb)?:|rgb:)?(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/.test(key))
      {
        const color8bit = key.split(':').pop()
        return key.startsWith('bg')
        ? `${Log.ansi['bg:' ]};5;${color8bit}m`
        : `${Log.ansi['rgb:']};5;${color8bit}m`
      }

      // fallback to input to allow for custom escape codes, or simply 
      // show the input to the user...
      return code
    }).join('')
  }

  #colors(template, ...args)
  {
    const
      clear = Log.ansi.clear,
      label = clear + this.ansi(this.config.label),
      text  = clear + this.ansi(this.config.text)

    return label + this.config.name + this.config.separator 
          + text + template.reduce((result, part, i) => result
                                                      + clear + this.#inspect(args[i - 1], true) 
                                                      + text  + part) + clear
  }

  #inspect(arg, ansi)
  {
    return 'object' === typeof arg
    ? util.inspect(arg, { colors: this.config.ansi && ansi })
    : (this.config.ansi && ansi && this.ansi(this.config.data)) + arg
  }

  #write(stream, str)
  {
    this.config.mute || stream.write(str + this.config.EOL)
  }

  /**
   * Creates a new instance of the logger with the same config as the current instance. 
   * The provided config argument is used to override specific attributes of the current 
   * instance configurations.
   * 
   * @param {Object} config settings to use for this instance
   * @returns @superhero/log new instance of the current log instance based on the current 
   * instance configurations with the provided config modifications.
   */
  use(config)
  {
    return new Log({ ...this.config, ...config })
  }

  /**
   * The `set` method is a proxy that allows to set specific configurations for
   * the different log methods (info, warn, fail). 
   * 
   * This is useful for customizing the behavior of each logger
   * independently while still operating a single log structure.
   * 
   * @example
   * 
   * const log = new Log()
   * 
   * log.set.info({ text: 'blue' })
   * log.set.warn({ text: 'yellow' })
   * log.set.fail({ text: 'red })
   * 
   * logger.info`This will be blue`
   * logger.warn`This will be yellow`
   * logger.fail`This will be red`
   */
  set = new Proxy({},
  {
    set: (_, logger, config) => 
    {
      switch(logger)
      {
        case 'info':
        case 'warn':
        case 'fail':
        {
          const using  = this.use({ info:false, warn:false, fail:false, ...config })
          this[logger] = using[logger].bind(using)
          return true
        }
      }
    }
  })

  /**
   * Validates mute configuration before writing to the configured stdout...
   * @returns {string|false} The composed, but always unformatted string - only if 
   * "returns" is eneabled in the config
   */
  info(...args)
  {
    this.config.muteInfo || this.#write(this.config.stdout, this.#format(...args))
    this.emit('info', ...args)
    return this.config.returns && this.#normal(...args)
  }

  /** 
   * Validates mute configuration before writing to the configured stdout... 
   * ... same as "info"
   * @returns {string|false} The composed, but always unformatted string - only if 
   * "returns" is eneabled in the config
   */
  warn(...args)
  {
    this.config.muteWarn || this.#write(this.config.stdout, this.#format(...args))
    this.emit('warn', ...args)
    return this.config.returns && this.#normal(...args)
  }

  /** 
   * Validates mute configuration before writing to the configured stderr...
   * @returns {string|false} The composed, but always unformatted string - only if 
   * "returns" is eneabled in the config
   */
  fail(...args)
  {
    this.config.muteFail || this.#write(this.config.stderr, this.#format(...args))
    this.emit('fail', ...args)
    return this.config.returns && this.#normal(...args)
  }

  #useKaomoji(kaomoji)
  {
    const random = Math.floor(Math.random() * kaomoji.length)
    return this.use({ name:kaomoji[random] })
  }

  get smile()
  {
    return this.#useKaomoji(Log.kaomoji.smile)
  }

  get happy()
  {
    return this.#useKaomoji(Log.kaomoji.happy)
  }

  get confused()
  {
    return this.#useKaomoji(Log.kaomoji.confused)
  }

  get sad()
  {
    return this.#useKaomoji(Log.kaomoji.sad)
  }

  get angry()
  {
    return this.#useKaomoji(Log.kaomoji.angry)
  }

  get corrected()
  {
    return this.#useKaomoji(Log.kaomoji.corrected)
  }

  /**
   * Creates a tree structure from the provided nested object/array.
   * 
   * @param {Object|Array} tree - The object or array to be transformed into a tree structure.
   * @returns {string} The formatted tree structure as a string.
   */
  tree(tree)
  {
    if('object' !== typeof tree)
    {
      return String(tree)
    }

    const 
      borders = String(this.config.border).toLowerCase(),
      map     = Log.border[borders] ?? Log.border.light

    let output = ''
    for(const childTree of this.#treeRecursion(tree, '', map))
    {
      output += this.config.EOL + childTree
    }
    return output
  }

  * #treeRecursion(children, prefix, map)
  {
    if(Array.isArray(children))
    {
      for(let i = 0; i < children.length; i++)
      {
        const
          child       = children[i],
          isLast      = i === children.length - 1,
          branch      = isLast 
                      ? map.bottomLeft + map.horizontal
                      : map.teeLeft    + map.horizontal,
          nextPrefix  = isLast 
                      ? '   '
                      : map.vertical + '  '
  
        if(Array.isArray(child))
        {
          if(child.length)
          {
            yield prefix + branch + map.teeUp + map.horizontal + ' ' + String(child[0])
            yield * this.#treeRecursion(child.slice(1), prefix + nextPrefix, map)
          }
        }
        else if('object' === typeof child && null !== child)
        {
          for(const [ key, nested ] of Object.entries(child))
          {
            yield prefix + branch + ' ' + String(key)
            yield * this.#treeRecursion(nested, prefix + nextPrefix, map)
          }
        }
        else
        {
          yield prefix + branch + ' ' + String(child)
        }
      }
    }
    else if('object' === typeof children && null !== children)
    {
      const entries = Object.entries(children)
      for(let i = 0; i < entries.length; i++)
      {
        const [ key, nested ] = entries[i]
        const 
          isLast      = i === entries.length - 1,
          branch      = isLast 
                      ? map.bottomLeft + map.horizontal
                      : map.teeLeft    + map.horizontal,
          nextPrefix  = isLast 
                      ? '   '
                      : map.vertical + '  '

        yield prefix + branch + ' ' + String(key)
        yield * this.#treeRecursion(nested, prefix + nextPrefix, map)
      }
    }
    else
    {
      yield prefix + String(children)
    }
  }
}

/**
 * ANSI escape sequences - SGR - Select Graphic Rendition
 * standardized control to format text in terminal output
 * @example Log.ansi.blue + 'text color' + Log.ansi.reset
 */
export const ansi =
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

/**
 * kaomoji emoticons - a collection of expressive, text-based unicode faces...
 */
export const kaomoji =
{
  smile     : [ '( ͡° ͜ʖ ͡°)', '( ͡~ ͜ʖ ͡~)', '(⌐■_■)', '(°‿°)' ],
  happy     : [ '(｡♥‿♥｡)', '(≧◡≦)', '(๑˃ᴗ˂)ﻭ', '(๑>ᴗ<๑)', '｡^‿^｡', '٩(◕‿◕｡)۶', '♪ ᕕ( ᐛ )ᕗ ♪' ],
  confused  : [ '¯\\_(ツ)_/¯', '¯\\(°_o)/¯', '(°ロ°) !?', '⊙﹏⊙' ],
  sad       : [ '(╥﹏╥)', '(╯︵╰,)', '(ಥ﹏ಥ)', '(ಥ_ಥ)', '(T︵T)', '(｡•︵•｡)' ],
  angry     : [ 'ಠ╭╮ಠ', '(ಠ‸ಠ)', '(╯°□°）╯︵ ┻━┻', '┻━┻︵ ¯\\(°□°)/¯', 'ᕦ︵(ò_óˇ)ᕤ', 'ᕙ( ò╭╮ó)ᕗ', 'G-(•‸•G)' ],
  corrected : [ '┬─┬ ノ( ゜-゜ノ)', '(￣^￣)ゞ' ]
}

/**
 * Unicode border/box drawing characters
 */
export const border =
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
  'light-half':
  {
    horizontal  : '╌', vertical     : '╎',
    horizontal2 : '┄', vertical2    : '┆',
    horizontal3 : '┈', vertical3    : '┊',
    teeLeft     : '╶', teeRight     : '╴',
    teeUp       : '╷', teeDown      : '╵',
  },
  'heavy-half':
  {
    horizontal  : '╍', vertical     : '╏',
    horizontal2 : '┅', vertical3    : '┇',
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
    topLeft     : '▘', topRight     : '▝',
    bottomLeft  : '▖', bottomRight  : '▗',
  }
}

/**
 * Unicode symbols - a diverse collection of unicode symbols.
 */
export const symbol =
{
  // arrows
  up        : '↑', down       : '↓', left     : '←', right     : '→',
  up2       : '⬆', down2      : '⬇', left2    : '⬅', right2    : '➡',
  up3       : '⇡', down3      : '⇣', left3    : '⇠', right3    : '⇢',
  upLeft    : '↖', upRight    : '↗', 
  downLeft  : '↙', downRight  : '↘',

  // bullet
  point     : '•', point2    : '●', circle    : '◦', circle2   : '○', 
  bullseye  : '◉', triangle  : '▷', triangle2 : '▶', square    : '▣',
  diamond   : '◇', diamond2  : '◆', arrowHead : '➤', hook      : '↪', 
  hook2     : '↳', line      : '╶', line2     : '═', line3     : '━', 
  dashed    : '┄', dotted    : '┈',

  // breadcrumbs
  arrow     : '›', arrow2    : '≫', arrow3    : '⋙',

  // currency
  baht      : '฿', bitcoin  : '₿', cent     : '¢', cruzeiro : '₢',
  dollar    : '$', dong     : '₫', dram     : '֏', euro     : '€',
  florin    : 'ƒ', guarani  : '₲', hryvnia  : '₴', kip      : '₭',
  lira      : '₺', manat    : '₼', naira    : '₦', pound    : '£',
  peso      : '₱', rial     : '﷼', ruble    : '₽', rupee    : '₹',
  shekel    : '₪', tenge    : '₸', tugrik   : '₮', won      : '₩',
  yen       : '¥', zloty    : 'zł',

  // document
  section   : '§', paragraph      : '¶', reference  : '※',
  footnote  : '†', footnoteSecond : '‡', annotation : '*',
  ellipsis  : '…', proof          : '^',

  // math
  plusMinus : '±', times         : '×', divide        : '÷',
  infinity  : '∞', lessEqual     : '≤', greaterEqual  : '≥',
  notEqual  : '≠', approximately : '≈', squareRoot    : '√',
  integral  : '∫', summation     : '∑', product       : '∏',
  pi        : 'π', theta         : 'θ', degree        : '°',
  percent   : '%', permille      : '‰',

  // status
  done  : '✔', fail: '✘', warn: '⚠', info: 'ℹ', flag: '⚑', gear: '⚙', 
  time  : '⏱', love: '❤', dead: '☠',

  // weather
  sun   : '☀', cloud : '☁', rain     : '☔', snow : '❄', lightning : '⚡',
  moon  : '☾', wind  : '≋', umbrella : '☂', star : '★', bolt      : 'ϟ'
}

/**
 * Unicode character transformation maps - a collection of unicode transformations 
 * for different styles of text representation.
 */
export const transform =
{
  'squared':
  {
    A: '🄰', B: '🄱', C: '🄲', D: '🄳', E: '🄴', F: '🄵', G: '🄶',
    H: '🄷', I: '🄸', J: '🄹', K: '🄺', L: '🄻', M: '🄼', N: '🄽',
    O: '🄾', P: '🄿', Q: '🅀', R: '🅁', S: '🅂', T: '🅃', U: '🅄',
    V: '🅅', W: '🅆', X: '🅇', Y: '🅈', Z: '🅉',
    a: '🄰', b: '🄱', c: '🄲', d: '🄳', e: '🄴', f: '🄵', g: '🄶',
    h: '🄷', i: '🄸', j: '🄹', k: '🄺', l: '🄻', m: '🄼', n: '🄽',
    o: '🄾', p: '🄿', q: '🅀', r: '🅁', s: '🅂', t: '🅃', u: '🅄',
    v: '🅅', w: '🅆', x: '🅇', y: '🅈', z: '🅉',
  },
  'squared-filled':
  {
    A: '🅰', B: '🅱', C: '🅲', D: '🅳', E: '🅴', F: '🅵', G: '🅶',
    H: '🅷', I: '🅸', J: '🅹', K: '🅺', L: '🅻', M: '🅼', N: '🅽',
    O: '🅾', P: '🅿', Q: '🆀', R: '🆁', S: '🆂', T: '🆃', U: '🆄',
    V: '🆅', W: '🆆', X: '🆇', Y: '🆈', Z: '🆉',
    a: '🅰', b: '🅱', c: '🅲', d: '🅳', e: '🅴', f: '🅵', g: '🅶',
    h: '🅷', i: '🅸', j: '🅹', k: '🅺', l: '🅻', m: '🅼', n: '🅽',
    o: '🅾', p: '🅿', q: '🆀', r: '🆁', s: '🆂', t: '🆃', u: '🆄',
    v: '🆅', w: '🆆', x: '🆇', y: '🆈', z: '🆉'
  },
  'circled':
  {
    // uppercase
    a: 'Ⓐ', b: 'Ⓑ', c: 'Ⓒ', d: 'Ⓓ', e: 'Ⓔ', f: 'Ⓕ', g: 'Ⓖ',
    h: 'Ⓗ', i: 'Ⓘ', j: 'Ⓙ', k: 'Ⓚ', l: 'Ⓛ', m: 'Ⓜ', n: 'Ⓝ',
    o: 'Ⓞ', p: 'Ⓟ', q: 'Ⓠ', r: 'Ⓡ', s: 'Ⓢ', t: 'Ⓣ', u: 'Ⓤ',
    v: 'Ⓥ', w: 'Ⓦ', x: 'Ⓧ', y: 'Ⓨ', z: 'Ⓩ',
    // lowercase
    a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ',
    h: 'ⓗ', i: 'ⓘ', j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ',
    o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ', u: 'ⓤ',
    v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ',
    // numbers
    0: '⓪', 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥',
    7: '⑦', 8: '⑧', 9: '⑨',
    // double digit numbers
    10: '⑩', 11: '⑪', 12: '⑫', 13: '⑬', 14: '⑭', 15: '⑮',
    16: '⑯', 17: '⑰', 18: '⑱', 19: '⑲', 20: '⑳'
  },
  'circled-filled':
  {
    A: '🅐', B: '🅑', C: '🅒', D: '🅓', E: '🅔', F: '🅕', G: '🅖',
    H: '🅗', I: '🅘', J: '🅙', K: '🅚', L: '🅛', M: '🅜', N: '🅝',
    O: '🅞', P: '🅟', Q: '🅠', R: '🅡', S: '🅢', T: '🅣', U: '🅤',
    V: '🅥', W: '🅦', X: '🅧', Y: '🅨', Z: '🅩',
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩'
  },
  'upside-down':
  {
    // uppercase
    A: 'Ɐ', B: 'ꓭ', C: 'Ɔ', D: 'ꓷ', E: 'Ǝ', F: 'Ⅎ', G: 'פ',
    H: 'H', I: 'I', J: 'ſ', K: 'ꓘ', L: 'ꓶ', M: 'W', N: 'N',
    O: 'O', P: 'Ԁ', Q: 'Ꝺ', R: 'ꓤ', S: 'S', T: 'ꓕ', U: 'ꓵ',
    V: 'ꓥ', X: 'X', Y: '⅄', Z: 'Z',
    // lowercase
    a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ',
    h: 'ɥ', i: 'ı', j: 'ɾ', k: 'ʞ', l: 'ן', m: 'ɯ', n: 'u',
    o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n',
    v: 'ʌ', x: 'x', y: 'ʎ', z: 'z',
    // numbers
    1: 'Ɩ', 2: 'ᄅ', 3: 'Ɛ', 4: 'ㄣ', 5: 'ϛ', 6: '9', 7: 'ㄥ', 
    9: '6'
  },
  'small-caps':
  {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ',
    h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ',
    o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ',
    v: 'ᴠ', x: 'x', y: 'ʏ', z: 'ᴢ'
  },
  'double-struck':
  {
    // uppercase
    A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽', G: '𝔾',
    H: 'ℍ', I: '𝕀', J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄', N: 'ℕ',
    O: '𝕆', P: 'ℙ', Q: 'ℚ', R: 'ℝ', S: '𝕊', T: '𝕋', U: '𝕌',
    V: '𝕍', X: '𝕏', Y: '𝕐', Z: 'ℤ',
    // lowercase
    a: '𝕒', b: '𝕓', c: '𝕔', d: '𝕕', e: '𝕖', f: '𝕗', g: '𝕘',
    h: '𝕙', i: '𝕚', j: '𝕛', k: '𝕜', l: '𝕝', m: '𝕞', n: '𝕟',
    o: '𝕠', p: '𝕡', q: '𝕢', r: '𝕣', s: '𝕤', t: '𝕥', u: '𝕦',
    v: '𝕧', x: '𝕩', y: '𝕪', z: '𝕫',
    // numbers
    0: '𝟘', 1: '𝟙', 2: '𝟚', 3: '𝟛', 4: '𝟜', 5: '𝟝', 6: '𝟞',
    7: '𝟟', 8: '𝟠', 9: '𝟡',
  },
  'old-english':
  {
    // uppercase
    A: '𝕬', B: '𝕭', C: '𝕮', D: '𝕯', E: '𝕰', F: '𝕱', G: '𝕲',
    H: '𝕳', I: '𝕴', J: '𝕵', K: '𝕶', L: '𝕷', M: '𝕸', N: '𝕹',
    O: '𝕺', P: '𝕻', Q: '𝕼', R: '𝕽', S: '𝕾', T: '𝕿', U: '𝖀',
    V: '𝖁', X: '𝖃', Y: '𝖄', Z: '𝖅',
    // lowercase
    a: '𝖆', b: '𝖇', c: '𝖈', d: '𝖉', e: '𝖊', f: '𝖋', g: '𝖌',
    h: '𝖍', i: '𝖎', j: '𝖏', k: '𝖐', l: '𝖑', m: '𝖒', n: '𝖓',
    o: '𝖔', p: '𝖕', q: '𝖖', r: '𝖗', s: '𝖘', t: '𝖙', u: '𝖚',
    v: '𝖛', x: '𝖝', y: '𝖞', z: '𝖟'
  },
  'script':
  {
    // uppercase
    A: '𝓐', B: '𝓑', C: '𝓒', D: '𝓓', E: '𝓔', F: '𝓕', G: '𝓖',
    H: '𝓗', I: '𝓘', J: '𝓙', K: '𝓚', L: '𝓛', M: '𝓜', N: '𝓝',
    O: '𝓞', P: '𝓟', Q: '𝓠', R: '𝓡', S: '𝓢', T: '𝓣', U: '𝓤',
    V: '𝓥', X: '𝓧', Y: '𝓨', Z: '𝓩',
    // lowercase
    a: '𝓪', b: '𝓫', c: '𝓬', d: '𝓭', e: '𝓮', f: '𝓯', g: '𝓰',
    h: '𝓱', i: '𝓲', j: '𝓳', k: '𝓴', l: '𝓵', m: '𝓶', n: '𝓷',
    o: '𝓸', p: '𝓹', q: '𝓺', r: '𝓻', s: '𝓼', t: '𝓽', u: '𝓾',
    v: '𝓿', x: '𝔁', y: '𝔂', z: '𝔃'
  }
}

/**
 * Converts a hex color string to an RGB array, case insensitive.
 * 
 * @param {string} hex - The hex color string (e.g., "#ff5733").
 * @returns {number[]} An array containing the RGB values [r, g, b].
 * 
 * @throws {TypeError}  E_LOG_INVALID_HEX_COLOR - If the input is not a valid hex color string.
 * @throws {RangeError} E_LOG_INVALID_HEX_COLOR - If the hex color string is not 3 or 6 digits.
 */
export function hex2rgb(hex)
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