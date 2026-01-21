import { EOL }    from 'node:os'
import Emitter    from 'node:events'
import util       from 'node:util'
import ansi       from '@superhero/log/ansi'
import border     from '@superhero/log/border'
import filter     from '@superhero/log/filter'
import hex2rgb    from '@superhero/log/hex2rgb'
import kaomoji    from '@superhero/log/kaomoji'
import symbol     from '@superhero/log/symbol'
import transform  from '@superhero/log/transform'

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

  static ansi       = ansi
  static border     = border
  static filter     = filter
  static kaomoji    = kaomoji
  static symbol     = symbol
  static transform  = transform

  /**
   * Static highlevel configurations...
   * Used for static default configurations.
   * Instance specifications will override the static defaults.
   * @see this.config getter
   */
  static #config =
  {
    inline    : false,
    mute      : false,
    muteInfo  : false,
    muteWarn  : false,
    muteFail  : false,
    returns   : false,
    filter    : false,
    transform : false,
    tree      : false,
    table     : false,
    ansi      : true,
    reset     : true,
    staticLog : true,
    outstream : process.stdout, 
    errstream : process.stderr,
    EOL       : EOL,
    border    : 'light',
    label     : '[LOG]',
    divider   : ' ⇢ ',
    ansiLabel : 'dim bright-black',
    ansiText  : 'dim',
    ansiValue : 'bright-cyan',
    ansiTable : 'dim bright-yellow',
    ansiTree  : 'dim bright-black'
  }

  /**
   * Static setter for the private instance configurations.
   * This allows to set the configuration of the instance by assigning the values of the 
   * argument to the already defined default configurations.
   * Assigning the provided configuration arguemnt to the static config prevents the user from
   * accidentally overwriting the default static defaults that defines the required config keys.
   * 
   * @param {Object} config - The configuration object to assign.
   * 
   * @returns {Object} The current static configuration of the Log class.
   * 
   * @throws {TypeError} If the provided config is not an object.
   */
  static set config(config)
  {
    const configType = Object.prototype.toString.call(config)

    if('[object Object]' !== configType)
    {
      const error = new TypeError(`Log.config must be an [object Object], got ${configType}`)
      error.code  = 'E_LOG_CONFIG_INVALID'
      throw error
    }

    // Assign the static config with the provided config.
    Object.assign(Log.#config, config)

    // Ensure that the EOL always is a string.
    Log.config.EOL = String(Log.config.EOL)
  }

  /**
   * Static getter for the private static configurations.
   * This allows to get the static configuration of the Log class.
   * 
   * @returns {Object} The current static configuration of the Log class.
   */
  static get config()
  {
    return Log.#config
  }

  constructor(config)
  {
    config = new Proxy(Object.assign({ emitter:new Emitter }, config),
    {
      get: (target, key) => target[key] ?? Log.config[key]
    })

    Object.defineProperty(this, 'config',  { value: config })
    Object.defineProperty(this, 'emitter', { value: Reflect.get(config, 'emitter') })

    // Inline configuration alias for EOL = ''
    this.inline = config.inline

    // Set the specific configurations for each log method if configured
    if(config.info) this.set.info = config.info
    if(config.warn) this.set.warn = config.warn
    if(config.fail) this.set.fail = config.fail

    // Makes it possible for dependent code to hook into when a log event is 
    // emitted by any of the log instances...
    if(config.emitter && config.staticLog)
    {
      this.config.emitter.on('info', (...args) => Log.emit('info', config, ...args))
      this.config.emitter.on('warn', (...args) => Log.emit('warn', config, ...args))
      this.config.emitter.on('fail', (...args) => Log.emit('fail', config, ...args))
    }
  }

  /**
   * Attaches an event listener to the log instance's emitter.
   * This allows to listen for specific log events, such as 'info', 'warn', or 'fail'.
   */
  on(event, listener)
  {
    this.config.emitter?.on(event, listener)
    return this
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
   * Returns the configured label of the log instance.
   * The label is used as a prefix for each log message.
   * Defaults to an empty string if disabled.
   *
   * @returns {string} The label used by the log instance.
   */
  get label()
  {
    return this.config.label || ''
  }

  /**
   * Sets the label of the log instance, or disables it if a falsy value is provided.
   * The label is used as a prefix for each log message.
   *
   * @param {string} label - The label value to set for the log instance.
   * @returns The updated label of the log instance.
   */
  set label(label)
  {
    return this.config.label = label
  }

  /**
   * Returns the configured divider of the log instance.
   * The divider is used to separate the label from the log message.
   * Defaults to an empty string if disabled.
   *
   * @returns {string} The divider used by the log instance.
   */
  get divider()
  {
    return this.config.divider || ''
  }

  /**
   * Sets the divider of the log instance, or disables it if a falsy value is provided.
   * The divider is used to separate the label from the log message.
   *
   * @param {string} divider - The divider value to set for the log instance.
   * @returns The updated divider of the log instance.
   */
  set divider(divider)
  {
    return this.config.divider = divider
  }

  /**
   * Adds a filter to the log instance.
   * The filter is applied to the log messages before they are written to the output stream.
   * 
   * @param {string} name - The name of the filter to add.
   * @param {function} [filter] - The optional filter function to apply to the log messages.
   * 
   * @throws {TypeError} If the provided filter is not a function.
   * @throws {ReferenceError} If the filter name is unknown.
   */
  addFilter(name, filter)
  {
    const ccName = Log.filter.camelCase(name)

    if('function' === typeof filter)
    {
      Log.filter[ccName] = filter
    }
    // any falsy value for filter will be ignored
    else if(false !== !!filter)
    {
      const error = new TypeError(`Filter must be a function, got ${typeof filter}`)
      error.code  = 'E_LOG_FILTER_INVALID'
      throw error
    }

    if(ccName in Log.filter)
    {
      if(this.config.filter)
      {
        if(Array.isArray(this.config.filter))
        {
          // If the current filter is an array, append the new filter after 
          // extracting the other filters to avoid pushing the new filter onto 
          // a static array that is not meant to be modified in this context.
          this.config.filter = [ ...this.config.filter, name ]
        }
        else
        {
          this.config.filter = [ this.config.filter, name ]
        }
      }
      else
      {
        this.config.filter = [ name ]
      }

      return this
    }

    const error = new ReferenceError(`Unknown filter "${name}"`)
    error.code  = 'E_LOG_FILTER_UNKNOWN'
    throw error
  }

  /**
   * Removes a filter from the log instance.
   * If the filter is not found, it will be ignored.
   * 
   * @param {string} name - The name of the filter to remove.
   * @returns {Log} The current instance of the Log class, allowing for method chaining.
   */
  removeFilter(name)
  {
    if(this.config.filter)
    {
      if(Array.isArray(this.config.filter))
      {
        this.config.filter = this.config.filter.filter(filter => filter !== name)
      }
      else if(this.config.filter === name)
      {
        this.config.filter = false
      }
    }

    return this
  }

  /**
   * Applies the configured filters to the provided string.
   * If no filters are configured, the string is returned unchanged.
   * 
   * @param {string} str - The string to be filtered.
   * @returns {string} The filtered string.
   * @throws {ReferenceError} If an unknown filter is specified in the configuration.
   */
  filter(str)
  {
    if(this.config.filter)
    {
      const filters = Array.isArray(this.config.filter)
                    ? this.config.filter
                    : [ this.config.filter ]

      for(const name of filters)
      {
        const ccName = Log.filter.camelCase(name)

        if(ccName in Log.filter)
        {
          const filter = Log.filter[ccName]
          str = filter(str)
        }
        else
        {
          const error = new ReferenceError(`Unknown filter "${name}"`)
          error.code  = 'E_LOG_FILTER_UNKNOWN'
          throw error
        }
      }
    }

    return str
  }

  #useFilter(name)
  {
    const filters = this.config.filter
                  ? ( Array.isArray(this.config.filter)
                    ? this.config.filter
                    : [ this.config.filter ])
                  : []

    return this.use({ filter:[ ...filters, name ] })
  }

  get camelCase()
  {
    return this.#useFilter('camel-case')
  }

  get capitalize()
  {
    return this.#useFilter('capitalize')
  }

  get dashCase()
  {
    return this.#useFilter('dash-case')
  }

  get dotCase()
  {
    return this.#useFilter('dot-case')
  }

  get leet()
  {
    return this.#useFilter('leet')
  }

  get lowerCase()
  {
    return this.#useFilter('lower-case')
  }

  get pathCase()
  {
    return this.#useFilter('path-case')
  }

  get pipeCase()
  {
    return this.#useFilter('pipe-case')
  }

  get randomCase()
  {
    return this.#useFilter('random-case')
  }

  get reverse()
  {
    return this.#useFilter('reverse')
  }

  get reverseSentences()
  {
    return this.#useFilter('reverse-sentences')
  }

  get reverseWords()
  {
    return this.#useFilter('reverse-words')
  }

  get snakeCase()
  {
    return this.#useFilter('snake-case')
  }

  get spaceCase()
  {
    return this.#useFilter('space-case')
  }

  get tildeCase()
  {
    return this.#useFilter('tilde-case')
  }

  get titleCase()
  {
    return this.#useFilter('title-case')
  }

  get upperCase()
  {
    return this.#useFilter('upper-case')
  }

  /**
   * Transforms the provided text according to a specified transformation type.
   * @see Log.transform for available transformations.
   * 
   * @param {string} str - The string to be transformed.
   * @param {string} [transformation] - The type of transformation to apply.
   * @returns {string} The transformed string.
   */
  transform(str, transformation = this.config.transformation ?? 'circled')
  {
    const
      key = String(transformation).toLowerCase(),
      map = Log.transform[key]

    return map
    ? Array.from(String(str)).map(char => map[char] ?? char).join('')
    : str
  }

  #useTransformation(transformation)
  {
    return this.use({ transform:true, transformation })
  }

  get circled()
  {
    return this.#useTransformation('circled')
  }

  get circledFilled()
  {
    return this.#useTransformation('circled-filled')
  }

  // Alias for circledFilled
  get filledCircles()
  {
    return this.circledFilled
  }

  get squared()
  {
    return this.#useTransformation('squared')
  }

  get squaredDashed()
  {
    return this.#useTransformation('squared-dashed')
  }

  // Alias for squaredDashed
  get dashedSquares()
  {
    return this.squaredDashed
  }

  get squaredFilled()
  {
    return this.#useTransformation('squared-filled')
  }

  // Alias for squaredFilled
  get filledSquares()
  {
    return this.squaredFilled
  }

  get upsideDown()
  {
    return this.#useTransformation('upside-down')
  }

  get smallCaps()
  {
    return this.#useTransformation('small-caps')
  }

  get doubleStruck()
  {
    return this.#useTransformation('double-struck')
  }

  get oldEnglish()
  {
    return this.#useTransformation('old-english')
  }

  get strongOldEnglish()
  {
    return this.#useTransformation('strong-old-english')
  }

  get script()
  {
    return this.#useTransformation('script')
  }

  get serif()
  {
    return this.#useTransformation('serif')
  }

  get strong()
  {
    return this.#useTransformation('strong')
  }

  get fullwidth()
  {
    return this.#useTransformation('fullwidth')
  }

  get parenthesized()
  {
    return this.#useTransformation('parenthesized')
  }

  #transform(template)
  {
    return this.config.transform
    ? template.map(str => this.transform(str))
    : template
  }

  #format(template, ...args)
  {
    template = this.#transform(template.map(str => this.filter(str)))

    if(this.config.ansi)
    {
      const
        reset = this.config.reset ? Log.ansi.reset : '',
        label = reset + this.ansi(this.config.ansiLabel),
        text  = reset + this.ansi(this.config.ansiText)

      return label + this.label + this.divider
            + text + template.reduce((result, part, i) => result
                                                        + reset + this.#inspect(args[i - 1], true, !!result) 
                                                        + text  + part) + reset
    }
    else
    {
      return this.#simple(template, ...args)
    }
  }

  #simple(...args)
  {
    return this.label + this.divider + this.#normal(...args)
  }

  #normal(template, ...args)
  {
    return template.reduce((result, part, i) => result + this.#inspect(args[i - 1], false, !!result) + part)
  }

  #inspect(arg, ansi, isSuccessor)
  {
    if(this.config.tree
    && 'object' === typeof arg 
    && null !== arg)
    {
      try
      {
        return (isSuccessor ? this.config.EOL : '') + this.tree(arg).trim()
      }
      catch(reason)
      {
        // ... ignore the error, and fallback to default inspection
      }
    }

    if(this.config.table
    && 'object' === typeof arg
    && null !== arg)
    {
      try
      {
        return (isSuccessor ? this.config.EOL : '') + this.table(arg).trim()
      }
      catch(reason)
      {
        // ... ignore the error, and fallback to default inspection
      }
    }

    // default inspection 
    return 'object' === typeof arg
    ? util.inspect(arg, { colors: this.config.ansi && ansi })
    : (ansi && this.config.ansi && this.config.ansiValue
      ? this.ansi(this.config.ansiValue) : '') + arg
  }

  #write(stream, str)
  {
    this.config.mute || stream.write(str + this.config.EOL)
  }

  /**
   * Mapps the provided format specifications to corresponding ANSI escape sequences.
   * Multiple codes can be provided as space-separated values where each code is interpreted as a
   * separate ANSI escape code or key defined in the Log.ansi map object.
   * @see Log.ansi for available pre mapped ANSI escape codes.
   * 
   * @param {string} codes - Spece seperated format specifications
   * @returns {string} ANSI escape sequences
   */
  ansi(codes)
  {
    if(false === !!codes)
    {
      return ''
    }

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

  /**
   * Maps the provided text, values, and label to corresponding ANSI escape sequences.
   * This method allows to set the ANSI styles for text, values, and label independently.
   *
   * @param {string} [text] - The ANSI style for the text part of the log message.
   * @param {string} [values] - The ANSI style for the values part of the log message.
   * @param {string} [label] - The ANSI style for the label part of the log message.
   * @returns {Log} The current instance of the Log class, allowing for method chaining.
   *
   * @example
   * const log = new Log()
   * log.color('green').info`Fabolus!`
   */
  color(text, values, label)
  {
    if(text !== null
    && text !== undefined)
    {
      this.config.ansiText = this.ansi(text)
    }
    if(values !== null
    && values !== undefined)
    {
      this.config.ansiValue = this.ansi(values)
    }
    if(label !== null
    && label !== undefined)
    {
      this.config.ansiLabel = this.ansi(label)
    }

    return this
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
    // staticLog:false becouse we inherit the emitter from "this" config
    return new Log({ ...this.config, staticLog:false, ...config })
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
   * log.set.info = { ansiText: 'blue' }
   * log.set.warn = { ansiText: 'yellow' }
   * log.set.fail = { ansiText: 'red }
   * 
   * log.info`This will be blue`
   * log.warn`This will be yellow`
   * log.fail`This will be red`
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
          const using  = this.use({ ...config, info:null, warn:null, fail:null })
          this[logger] = using[logger].bind(using)
          return true
        }
      }
    }
  })

  /**
   * Validates mute configuration before writing to the configured output stream...
   * @returns {string|false} The composed, but always unformatted string - only if 
   * "returns" is eneabled in the config
   */
  info(...args)
  {
    this.config.muteInfo || this.#write(this.config.outstream, this.#format(...args))
    this.config.emitter?.emit('info', ...args)
    if(this.config.returns) return this.#normal(...args)
  }

  /** 
   * Validates mute configuration before writing to the configured output stream... 
   * ... same as "info"
   * @returns {string|false} The composed, but always unformatted string - only if 
   * "returns" is eneabled in the config
   */
  warn(...args)
  {
    this.config.muteWarn || this.#write(this.config.outstream, this.#format(...args))
    this.config.emitter?.emit('warn', ...args)
    if(this.config.returns) return this.#normal(...args)
  }

  /** 
   * Validates mute configuration before writing to the configured error stream...
   * @returns {string|false} The composed, but always unformatted string - only if 
   * "returns" is eneabled in the config
   */
  fail(...args)
  {
    this.config.muteFail || this.#write(this.config.errstream, this.#format(...args))
    this.config.emitter?.emit('fail', ...args)
    if(this.config.returns) return this.#normal(...args)
  }

  /**
   * Alias for `fail` method.
   */
  error(...args)
  {
    return this.fail(...args)
  }

  #useKaomoji(kaomoji)
  {
    const random = Math.floor(Math.random() * kaomoji.length)
    return this.use({ label:kaomoji[random] })
  }

  kaomoji(kaomoji)
  {
    if(kaomoji in Log.kaomoji)
    {
      return this.#useKaomoji(Log.kaomoji[kaomoji])
    }
    else
    {
      const error = new Error(`Unknown kaomoji "${kaomoji}"`)
      error.code  = 'E_LOG_KAOMOJI_UNKNOWN'
      throw error
    }
  }

  get smile()
  {
    return this.#useKaomoji(Log.kaomoji.smile)
  }

  get happy()
  {
    return this.#useKaomoji(Log.kaomoji.happy)
  }

  get ok()
  {
    return Math.floor(Math.random() * 10) % 2 ? this.smile : this.happy
  }

  get good()
  {
    return this.ok
  }

  get confused()
  {
    return this.#useKaomoji(Log.kaomoji.confused)
  }

  get idk()
  {
    return this.confused
  }

  get sad()
  {
    return this.#useKaomoji(Log.kaomoji.sad)
  }

  get angry()
  {
    return this.#useKaomoji(Log.kaomoji.angry)
  }

  get ko()
  {
    return Math.floor(Math.random() * 10) % 2 ? this.angry : this.sad
  }

  get bad()
  {
    return this.ko
  }

  get corrected()
  {
    return this.#useKaomoji(Log.kaomoji.corrected)
  }

  #useSymbol(label, ansi)
  {
    return this.use({ divider:' ', ansiLabel:ansi, ansiText:ansi, label })
  }

  get status()
  {
    const log = this.#useSymbol()
    log.set.info = { ansiLabel: 'blue',   ansiText: 'blue',   label: Log.symbol.arrowHead }
    log.set.warn = { ansiLabel: 'yellow', ansiText: 'yellow', label: Log.symbol.bolt }
    log.set.fail = { ansiLabel: 'red',    ansiText: 'red',    label: Log.symbol.fail }
    return log
  }

  get yes()
  {
    return this.#useSymbol(Log.symbol.strongYes, this.config.ansiText)
  }

  get no()
  {
    return this.#useSymbol(Log.symbol.strongNo, this.config.ansiText)
  }

  get time()
  {
    return this.#useSymbol(Log.symbol.time, 'cyan')
  }

  get love()
  {
    return this.#useSymbol(Log.symbol.love, 'magenta')
  }

  get dead()
  {
    return this.#useSymbol(Log.symbol.dead, 'bright-black')
  }

  /**
   * Strips ANSI escape codes from the provided string.
   * This is useful for removing formatting from strings before processing or displaying them.
   *
   * @param {string} str - The string from which to remove ANSI escape codes.
   * @returns {string} The string with ANSI escape codes removed.
   */
  stripAnsi(str)
  {
    return 'string' === typeof str 
          ? String(str).replace(/\x1B\[[0-9;]*m/g, '') 
          : str
  }

  /**
   * Creates a tree structure from the provided nested object/array.
   * 
   * @param {Object|Array} tree - The object or array to be transformed into a tree structure.
   * @returns {string} The formatted tree structure as a string.
   */
  tree(tree)
  {
    const 
      name    = Log.filter.dashCase(this.config.border),
      borders = Log.border[name] ?? Log.border.light,
      ansi    = str => this.config.ansi && this.config.ansiTree
              ? this.ansi(this.config.ansiTree) + str + this.ansi('reset')
              : str

    let output = ''
    for(const childTree of this.#treeRecursion(tree, '', borders, ansi))
    {
      output += this.config.EOL + childTree
    }

    return output.trim()
  }

  * #treeRecursion(children, prefix, borders, ansi, hasLast)
  {
    switch(Object.prototype.toString.call(children))
    {
      case '[object Set]':
      {
        // Normalizes Set to Array
        children = Array.from(children)
        // Fallthrough to 'Array' case...
      }
      case '[object Array]':
      {
        for(let i = 0; i < children.length; i++)
        {
          const
            child       = children[i],
            isLast      = i === children.length - 1,
            branch      = isLast 
                        ? borders.bottomLeft + borders.horizontal
                        : borders.teeLeft    + borders.horizontal,
            nextPrefix  = isLast 
                        ? '   '
                        : borders.vertical + '  '
    
          if(Array.isArray(child))
          {
            if(child.length)
            {
              yield ansi(prefix + branch + borders.horizontal + borders.teeUp + borders.horizontal) + ' ' + String(child[0])
              yield * this.#treeRecursion(child.slice(1), prefix + nextPrefix, borders, ansi)
            }
          }
          else if('object' === typeof child && null !== child)
          {
            yield * this.#treeRecursion(child, prefix, borders, ansi, isLast ? undefined : false)
          }
          else
          {
            yield ansi(prefix + branch) + ' ' + String(child)
          }
        }
        break
      }
      case '[object Map]':
      {
        // Normalizes Map to Object
        children = Object.fromEntries(children.entries())
        // Fallthrough to 'Object' case...
      }
      case '[object Object]':
      {
        const entries = Object.entries(children)
        for(let i = 0; i < entries.length; i++)
        {
          const [ key, nested ] = entries[i]
          const 
            isLast      = hasLast ?? i === entries.length - 1,
            branch      = isLast 
                        ? borders.bottomLeft + borders.horizontal
                        : borders.teeLeft    + borders.horizontal,
            nextPrefix  = isLast 
                        ? '   '
                        : borders.vertical + '  '
  
          if(typeof nested === 'object' 
          && null !== nested)
          {
            yield ansi(prefix + branch) + ' ' + String(key)
            yield * this.#treeRecursion(nested, prefix + nextPrefix, borders, ansi)
          }
          else
          {
            yield ansi(prefix + branch) + ' ' + String(key)
                + '\n' 
                + ansi(prefix + nextPrefix + borders.bottomLeft + borders.horizontal) + ' ' + String(nested)
          }
        }
        break
      }
      default:
      {
        yield ansi(prefix) + ' ' + String(children)
      }
    }
  }

  /**
   * Creates a formatted table from the provided input object.
   * The input should be an object where each key represents a column header
   * and the values are arrays representing the rows of the table.
   * 
   * @param {Object} input - The input object representing the table data.
   * @returns {string} The formatted table as a string.
   * 
   * @throws {TypeError} If the input is not an object or if the values are not arrays.
   * @throws {RangeError} If the input object has no entries or if the values have different lengths.
   */
  table(input)
  {
    const type = Object.prototype.toString.call(input)

    if('[object Map]' === type)
    {
      input = Object.fromEntries(input.entries())
    }

    if('[object Object]' !== type)
    {
      const error = new TypeError(`The provided input table must be an [object Object]`)
      error.code  = 'E_LOG_TABLE_INVALID'
      throw error
    }

    let entries = Object.entries(input)

    if(entries.length < 1)
    {
      const error = new RangeError(`The provided input table must have at least one entry`)
      error.code  = 'E_LOG_TABLE_INVALID'
      throw error
    }

    // if all entries are not arrays, then map all values to an array...
    // ...if some entries are arrays, then mapping them to a nested array will render the values 
    // in the same cell.
    if(entries.some(([ , cells ]) => false === Array.isArray(cells)))
    {
      entries = entries.map(([ header, cells ]) => [ header, [ cells ] ])
    }

    if(entries.some(([ , cells ]) => cells.length !== entries[0][1].length))
    {
      const error = new RangeError(`The provided input table values must have the same amount of items`)
      error.code  = 'E_LOG_TABLE_INVALID'
      throw error
    }

    const
      newLine     = this.config.EOL,
      bordersType = String(this.config.border).toLowerCase(),
      borders     = Log.border[bordersType] ?? Log.border.light,
      ansiTable   = str => this.config.ansi && this.config.ansiTable
                  ? this.ansi(this.config.ansiTable) + str + this.ansi('reset') 
                  : str,
      ansiValue   = str => this.config.ansi && this.config.ansiValue
                  ? this.ansi(this.config.ansiValue) + str + this.ansi('reset') 
                  : str,
      topLeft     = ansiTable(borders.topLeft),
      topRight    = ansiTable(borders.topRight),
      bottomLeft  = ansiTable(borders.bottomLeft),
      bottomRight = ansiTable(borders.bottomRight),
      teeLeft     = ansiTable(borders.teeLeft),
      teeRight    = ansiTable(borders.teeRight),
      teeUp       = ansiTable(borders.teeUp),
      teeDown     = ansiTable(borders.teeDown),
      cross       = ansiTable(borders.cross),
      vertical    = ansiTable(borders.vertical),
      // Standardize values to arrays of spaced strings
      valueMap    = value => 
      {
        switch(Object.prototype.toString.call(value))
        {
          case '[object Set]'       : value = Array.from(value) // Fallthrough to 'Array' case...
          case '[object Array]'     : return value.map(valueMap).join(newLine)
          case '[object String]'    :
          case '[object Number]'    :
          case '[object Null]'      : 
          case '[object Boolean]'   : return String(value).trim()
          case '[object Undefined]' : return ''
          case '[object Map]'       : value = Object.fromEntries(value.entries()) // Fallthrough to 'Object' case...
          case '[object Object]'    : 
          default                   : return this.#inspect(value, this.config.ansi, false)
        }
      },
      cellMap = value => valueMap(value).trim().split(newLine).map(value => ` ${value} `),
      columns = entries.map(([ header, values ]) => [ header, ...values ]).map(cells => cells.map(cellMap)),
      aligns  = entries.map(([ , values ]) => values.some(value => isNaN(value) || isNaN(parseFloat(value))) ? 'left' : 'right'),
      // Calculate the table's size dimensions
      cellDimensions =
      {
        // Calculate the maximum number of rows in each cell of the table rows
        row: Array(Math.max(...columns.map(cells => cells.length))).fill(0).map((_, r) =>
          Math.max(...columns.map(cells => cells[r].length))),

        // Calculate the maximum string length of each cell in the table columns
        col: Array(columns.length).fill(0).map((_, c) =>
          columns[c].reduce((max, cell) => Math.max(max, Math.max(...cell.map(row => this.stripAnsi(row).length))), 0))
      }

    // Compose the columns
    for(let c = 0; c < columns.length; c++)
    {
      const
        empty       = ' '.repeat(cellDimensions.col[c]),
        horizontal  = ansiTable(borders.horizontal.repeat(cellDimensions.col[c])),
        top         = c === 0 ? topLeft     : teeUp,
        left        = c === 0 ? teeLeft     : cross,
        bottom      = c === 0 ? bottomLeft  : teeDown,
        tableTop    = top     + horizontal,
        tableMid    = left    + horizontal,
        tableEnd    = bottom  + horizontal,
        rowsMap     = row => vertical + ansiValue(row[aligns[c] === 'right' ? 'padStart' : 'padEnd'](cellDimensions.col[c])),
        cellMap     = (cell, r) => cell.concat(Array(cellDimensions.row[r] - cell.length).fill(empty)).map(rowsMap),
        divider     = cell => [ ...cell, tableMid ]

      columns[c] = columns[c].map(cellMap).flatMap(divider)
      columns[c].unshift(tableTop)
      columns[c][columns[c].length - 1] = tableEnd
    }

    // Compose the table
    let table = ''
    for(let row = 0, max = cellDimensions.row.reduce((a, b) => a + b, cellDimensions.row.length) + 1; row < max; row++)
    {
      const
        tableRow  = columns.reduce((tableRow, cells) => tableRow + (cells[row] || ''), ''),
        rightEnd  = tableRow.startsWith(vertical)
                  ? vertical + newLine
                  : tableRow.startsWith(topLeft)
                  ? topRight + newLine
                  : tableRow.startsWith(teeLeft)
                  ? teeRight + newLine
                  : bottomRight

      table += tableRow + rightEnd
    }

    return table
  }
}
