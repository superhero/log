import { Console }  from 'node:console'
import EventEmitter from 'node:events'
import util         from 'node:util'

export default class Log extends EventEmitter
{
  divider         = ' ⇢ '
  color           = '\x1b[90m'
  highlight       = '\x1b[96m'
  strong          = '\x1b[1m'
  supressed       = '\x1b[2m'
  clearSupressed  = '\x1b[22m'
  clear           = '\x1b[0m'

  console = new Console(process.stdout, process.stderr)

  static colored  = true
  static global   = new EventEmitter()
  static default  = {}

  constructor(config)
  {
    super()

    this.config = Object.assign({ label: '[LOG]' }, config)

    this.on('info', (...args) => Log.global.emit('info', this.config, ...args))
    this.on('warn', (...args) => Log.global.emit('warn', this.config, ...args))
    this.on('fail', (...args) => Log.global.emit('fail', this.config, ...args))

    this.on('info', (...args) => (this.config.muteInfo  ?? Log.default.muteInfo) 
                              || (this.config.mute      ?? Log.default.mute) 
                              || (this.console.info(this.format(...args))))

    this.on('warn', (...args) => (this.config.muteWarn  ?? Log.default.muteWarn) 
                              || (this.config.mute      ?? Log.default.mute)
                              || (this.console.warn(this.format(...args))))

    this.on('fail', (...args) => (this.config.muteFail  ?? Log.default.muteFail) 
                              || (this.config.mute      ?? Log.default.mute) 
                              || (this.console.error(this.format(...args))))
  }

  format(...args)
  {
    return (Log.colored ? this.colors : this.simple).apply(this, args)
  }

  basic(template, ...args)
  {
    return template.reduce((result, part, i) => result + this.inspect(args[i - 1], false) + part)
  }

  simple(template, ...args)
  {
    return this.config.label + this.divider + this.basic(template, ...args)
  }

  supress(template, ...args)
  {
    return this.supressed + this.basic(template, ...args) + this.clearSupressed
  }

  colors(template, ...args)
  {
    return this.color
         + this.strong
         + this.supress`${this.config.label + this.divider}`
         + template.reduce((result, part, i) => result + this.highlight + this.supressed + this.inspect(args[i - 1]) + this.color + part) 
         + this.clear
  }

  inspect(arg, colored = Log.colored)
  {
    return 'object' === typeof arg 
          ? util.inspect(arg, { colors: colored }) 
          : arg
  }

  info(...args)
  {
    this.emit('info', ...args)
  }

  warn(...args)
  {
    this.emit('warn', ...args)
  }

  fail(...args)
  {
    this.emit('fail', ...args)
  }
}