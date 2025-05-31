# Log

A simple logger designed to be a versatile Node.js utility component, offering customizable formatting, colorized output, and event-driven hooks for use cases where logging needs to be pluggable. Designed to create a standard for the general @superhero tool chain, but is an isolated compoent that can be used to seamlessly integrate into any modern Node.js application.

## Features

- **Event-driven logging**: Emits events (`info`, `warn`, `fail`) for enhanced observability.
- **Customizable output**: Includes colored and non-colored output options.
- **Message formatting**: Template literal support for dynamic log messages.
- **Global event hooks**: Observe logs globally across multiple instances.
- **Mute control**: Granular muting for `info`, `warn`, and `fail` logs.
- **Data structures**: Table or tree data structures can be enabled.

## Installation

```bash
npm install @superhero/log
```

## Usage

A few simple demos...

### Basic Example

```javascript
import Log from '@superhero/log'

const log = new Log()

// Default logging
log.info`This is an info message.`    // [LOG] ⇢ This is an info message.
log.warn`This is a warning message.`  // [LOG] ⇢ This is a warning message.
log.fail`This is a failure message.`  // [LOG] ⇢ This is a failure message.
```

### Custom Configuration

```javascript
const log = new Log({ label: '[MyApp]' })

// Customize label
log.info`Custom label example.` // [MyApp] ⇢ Custom label example.

// Mute specific log types
log.config.muteWarn = true
log.warn`This warning will be muted.` // ... no console output
```

### ANSI Colors

```javascript
// Configuration colors
const log = new Log(
{ 
  ansiLabel : 'red',
  ansiText  : 'yellow',
  ansiValue : 'cyan'
})

// Simple colors
log.color('green').info`Green text`
log.color('green bold').info`Green and bold text`
log.color('green', 'blue').info`Green text with ${'blue'} values`

// RGB colors
log.color('0,0,255').info`Blue text`

// Hex colors
log.color('#FF0000').info`Red text`
```

### Kaomoji labels

```javascript
const log = new Log()

// Kaomoji
log.idk.info`What is this?`           // ¯\_(ツ)_/¯ ⇢ What is this?
log.happy.info`That worked!`          // ♪ ᕕ( ᐛ )ᕗ ♪ ⇢ That worked!
log.angry.info`WTF!`                  // ᕙ( ò╭╮ó)ᕗ ⇢ WTF!
log.sad.info`Something went wrong...` // (T︵T) ⇢ Something went wrong...
```

### Text transformations

```javascript
const log = new Log()

// Transformations
log.circled.info`Look at this` // Ⓛⓞⓞⓚ ⓐⓣ ⓣⓗⓘⓢ
log.squared.info`Look at that` // 🄻🄾🄾🄺 🄰🅃 🅃🄷🄰🅃
log.upsideDown.info`Fun stuff` // Ⅎnu sʇnɟɟ
log.upsideDown.reverse.info`Fun stuff` // ɟɟnʇs unℲ
log.smallCaps.info`Enough now` // Eɴᴏᴜɢʜ ɴᴏᴡ
```

### Table structure

```javascript
const log  = new Log({ table:true })

// Table data structure
const data =
{
  foo: [ 10,11,12,13,14,15 ],
  bar: [ 20,21,22,23,24,25 ],
  baz: [ 30,31,32,33,34,35 ],
  qux: [ 40,41,42,43,44,45 ],
}

// Log the table data as part of the log message...
log.info`Some random data:\n${data}`

// Some random data:
// ┌─────┬─────┬─────┬─────┐
// │ foo │ bar │ baz │ qux │
// ├─────┼─────┼─────┼─────┤
// │  10 │  20 │  30 │  40 │
// ├─────┼─────┼─────┼─────┤
// │  11 │  21 │  31 │  41 │
// ├─────┼─────┼─────┼─────┤
// │  12 │  22 │  32 │  42 │
// ├─────┼─────┼─────┼─────┤
// │  13 │  23 │  33 │  43 │
// ├─────┼─────┼─────┼─────┤
// │  14 │  24 │  34 │  44 │
// ├─────┼─────┼─────┼─────┤
// │  15 │  25 │  35 │  45 │
// └─────┴─────┴─────┴─────┘
```

### Tree structure

```javascript
const log  = new Log({ tree:true })

// Tree data structure is very permissive
const data =
{
  foo:
  [
    'bar',
    'baz',
    {
      'qux': [ 1,2,3 ]
    }
  ]
}

// Log the tree data as part of the log message...
log.info`Some random data:\n${data}`

// Some random data:
// └─ foo
//    ├─ bar
//    ├─ baz
//    └─ qux
//       ├─ 1
//       ├─ 2
//       └─ 3
```

### Observability

Each log type (`info`, `warn`, `fail`) triggers an event both locally and globally, on a static global event emitter, as well as an local instance event emitter.

It's possible to listen to one or both of the event emitters to extend the expected reaction to a log message, for example to perist the log event in a database.

```javascript
import Log from '@superhero/log'

const log = new Log({ label: '[MyApp]', mute: true })

// Instance Observability
log.on('fail', (config, ...args) => 
{
  config.label              // [MyApp]
  config.mute               // true
  args[1] instanceof Error  // true
})

// Global Observability
Log.on('fail', (config, ...args) => 
{
  config.label              // [MyApp]
  config.mute               // true
  args[1] instanceof Error  // true
})

// Prints to the console and triggeres an event to 
// both the static and instance event emitters.
log.fail`Fail message with error: ${new Error()}`
```

## Configuration

| Property        | Type    | Default    | Description                                            |
|-----------------|---------|------------|--------------------------------------------------------|
| `label`         | String  | `[LOG]`    | Prefix for all log messages.                           |
| `divider`       | String  | ` ⇢ `      | Divider between label and message.                     |
| `mute`          | Boolean | `false`    | Mute all log types.                                    |
| `muteInfo`      | Boolean | `false`    | Mute only `info` logs.                                 |
| `muteWarn`      | Boolean | `false`    | Mute only `warn` logs.                                 |
| `muteFail`      | Boolean | `false`    | Mute only `fail` logs.                                 |
| `transform`     | Boolean | `false`    | Transform the text to unicode styled                   |
| `inline`        | Boolean | `false`    | Should the log message append EOL                      |
| `returns`       | Boolean | `false`    | Returns the unformatted message if true                |
| `table`         | Boolean | `false`    | Structures arguemnts as a table structure, if possible |
| `tree`          | Boolean | `false`    | Structures arguemnts as a tree structure               |
| `ansi`          | Boolean | `true`     | Format using using ANSI escpape codes                  |
| `reset`         | Boolean | `true`     | Reset when using ANSI                                  |
| `outstream`     | Stream  | `stdout`   | Output stream                                          |
| `errstream`     | Stream  | `stderr`   | Error stream                                           |
| `EOL`           | String  | `os`.`EOL` | New line, or other end of line (EOL) character         |
| `border`        | String  | `light`    | Border type to use when rendering borders              |
| `ansiLabel`     | String  |            | ANSI escape codes to format the label                  |
| `ansiText`      | String  |            | ANSI escape codes to format the text                   |
| `ansiValue`     | String  |            | ANSI escape codes to format the value                  |
| `ansiTable`     | String  |            | ANSI escape codes to format the table borders          |
| `ansiTree`      | String  |            | ANSI escape codes to format the tree borders           |

## Tests

Run tests...

```bash
npm test
```

### Test Coverage

```
────────────────────────────────── ⋅⋆ Suite ⋆⋅ ─────────────────────────────────


@superhero/log
├─ Simple construction of the Log instance
│  └─ ✔ passed 2.958742ms
├─ Info
│  └─ ✔ passed 0.345249ms
├─ Warn
│  └─ ✔ passed 0.442836ms
├─ Fail
│  └─ ✔ passed 0.874991ms
├─ Returns an unformatted string of the log message when configured to return
│  └─ ✔ passed 1.124585ms
├─ Mute
│  ├─ Mute all
│  │  └─ ✔ passed 0.535226ms
│  ├─ Mute info
│  │  └─ ✔ passed 0.278769ms
│  ├─ Mute warn
│  │  └─ ✔ passed 0.292808ms
│  ├─ Mute fail
│  │  └─ ✔ passed 0.391119ms
│  └─ ✔ suite passed 1.947096ms
├─ Observe
│  ├─ Observe log info
│  │  └─ ✔ passed 0.406538ms
│  ├─ Observe log warn
│  │  └─ ✔ passed 0.29576ms
│  ├─ Observe log fail
│  │  └─ ✔ passed 0.31581ms
│  ├─ Distinguish types in observed log messages
│  │  └─ ✔ passed 0.707904ms
│  ├─ Distinguish types in observed global log messages
│  │  └─ ✔ passed 1.410703ms
│  └─ ✔ suite passed 3.372947ms
├─ Filter
│  ├─ Can filter log messages using camelCase
│  │  └─ ✔ passed 1.62556ms
│  ├─ Can filter log messages using capitalize
│  │  └─ ✔ passed 0.73326ms
│  ├─ Can filter log messages using dashCase
│  │  └─ ✔ passed 0.48413ms
│  ├─ Can filter log messages using dotCase
│  │  └─ ✔ passed 0.318218ms
│  ├─ Can filter log messages using leet
│  │  └─ ✔ passed 0.297713ms
│  ├─ Can filter log messages using lowerCase
│  │  └─ ✔ passed 0.242082ms
│  ├─ Can filter log messages using pathCase
│  │  └─ ✔ passed 0.239779ms
│  ├─ Can filter log messages using pipeCase
│  │  └─ ✔ passed 0.243202ms
│  ├─ Can filter log messages using randomCase
│  │  └─ ✔ passed 0.593199ms
│  ├─ Can filter log messages using reverse
│  │  └─ ✔ passed 0.336114ms
│  ├─ Can filter log messages using reverseSentences
│  │  └─ ✔ passed 0.333202ms
│  ├─ Can filter log messages using reverseWords
│  │  └─ ✔ passed 0.236699ms
│  ├─ Can filter log messages using snakeCase
│  │  └─ ✔ passed 0.272926ms
│  ├─ Can filter log messages using spaceCase
│  │  └─ ✔ passed 0.284911ms
│  ├─ Can filter log messages using tildeCase
│  │  └─ ✔ passed 0.229497ms
│  ├─ Can filter log messages using titleCase
│  │  └─ ✔ passed 0.410656ms
│  ├─ Can filter log messages using upperCase
│  │  └─ ✔ passed 0.235252ms
│  ├─ Can add and remove filters
│  │  └─ ✔ passed 0.426326ms
│  └─ ✔ suite passed 8.41819ms
├─ Transform
│  ├─ Can transform a string
│  │  └─ ✔ passed 2.158252ms
│  ├─ Can transform a log message string
│  │  └─ ✔ passed 0.542494ms
│  ├─ Can use circledFilled to transform a log message
│  │  └─ ✔ passed 0.668016ms
│  ├─ Can use squared to transform a log message
│  │  └─ ✔ passed 0.229625ms
│  ├─ Can use squaredDashed to transform a log message
│  │  └─ ✔ passed 0.278039ms
│  ├─ Can use squaredFilled to transform a log message
│  │  └─ ✔ passed 0.27945ms
│  ├─ Can use upsideDown to transform a log message
│  │  └─ ✔ passed 0.345051ms
│  ├─ Can use smallCaps to transform a log message
│  │  └─ ✔ passed 0.288567ms
│  ├─ Can use smallCaps to transform a log message
│  │  └─ ✔ passed 0.186975ms
│  ├─ Can use doubleStruck to transform a log message
│  │  └─ ✔ passed 0.213308ms
│  ├─ Can use oldEnglish to transform a log message
│  │  └─ ✔ passed 0.17581ms
│  ├─ Can use strongOldEnglish to transform a log message
│  │  └─ ✔ passed 0.165775ms
│  ├─ Can use script to transform a log message
│  │  └─ ✔ passed 0.159728ms
│  ├─ Can use serif to transform a log message
│  │  └─ ✔ passed 0.266868ms
│  ├─ Can use strong to transform a log message
│  │  └─ ✔ passed 0.394423ms
│  ├─ Can use fullwidth to transform a log message
│  │  └─ ✔ passed 0.216826ms
│  ├─ Can use parenthesized to transform a log message
│  │  └─ ✔ passed 0.188862ms
│  └─ ✔ suite passed 7.408358ms
├─ Colors
│  ├─ Can define colors using the colors method
│  │  └─ ✔ passed 1.473162ms
│  ├─ Can define Palette 8-bit ANSI escape codes using RGB color definition
│  │  └─ ✔ passed 0.396107ms
│  ├─ Can define Palette 8-bit ANSI escape codes using RGB background color definition
│  │  └─ ✔ passed 0.30498ms
│  ├─ Can define Truecolor ANSI escape codes using RGB color definition
│  │  └─ ✔ passed 0.457131ms
│  ├─ Can define Truecolor ANSI escape codes using RGB color definition
│  │  └─ ✔ passed 0.247131ms
│  ├─ Can define Truecolor ANSI escape codes using RGB background color definition
│  │  └─ ✔ passed 0.282039ms
│  ├─ Can define Truecolor ANSI escape codes using HEX color definition
│  │  └─ ✔ passed 0.374522ms
│  ├─ Can define Truecolor ANSI escape codes using HEX background color definition
│  │  └─ ✔ passed 0.252523ms
│  ├─ Can define Truecolor ANSI escape codes using 6 character HEX color definition
│  │  └─ ✔ passed 0.197842ms
│  ├─ Can define Truecolor ANSI escape codes using 3 character HEX color definition
│  │  └─ ✔ passed 0.359607ms
│  ├─ Will use the defined ANSI escape code if provided manually
│  │  └─ ✔ passed 0.28645ms
│  └─ ✔ suite passed 5.168959ms
├─ Can set a specific logger config
│  └─ ✔ passed 0.341542ms
├─ Kaomoji
│  ├─ Can use kaomoji
│  │  └─ ✔ passed 0.443811ms
│  ├─ Throws on invalid kaomoji
│  │  └─ ✔ passed 1.051838ms
│  ├─ Can use the "smile" kaomoji in log messages
│  │  └─ ✔ passed 0.245573ms
│  ├─ Can use the "happy" kaomoji in log messages
│  │  └─ ✔ passed 0.402689ms
│  ├─ Can use the "good" kaomoji in log messages
│  │  └─ ✔ passed 0.386914ms
│  ├─ Can use the "confused" kaomoji in log messages
│  │  └─ ✔ passed 0.288576ms
│  ├─ Can use the "idk" kaomoji in log messages
│  │  └─ ✔ passed 0.294919ms
│  ├─ Can use the "sad" kaomoji in log messages
│  │  └─ ✔ passed 0.485167ms
│  ├─ Can use the "angry" kaomoji in log messages
│  │  └─ ✔ passed 0.457755ms
│  ├─ Can use the "bad" kaomoji in log messages
│  │  └─ ✔ passed 0.370573ms
│  ├─ Can use the "corrected" kaomoji in log messages
│  │  └─ ✔ passed 0.43318ms
│  └─ ✔ suite passed 5.423189ms
├─ Tree
│  ├─ Can compose a simple value
│  │  └─ ✔ passed 1.133463ms
│  ├─ Can compose a simple array tree structure
│  │  └─ ✔ passed 0.277029ms
│  ├─ Can compose a nested array tree structure
│  │  └─ ✔ passed 0.269407ms
│  ├─ Can compose a complicated nested array tree structure
│  │  └─ ✔ passed 0.485155ms
│  ├─ Can compose a simple object tree structure
│  │  └─ ✔ passed 0.231248ms
│  ├─ Can compose a nested object tree structure
│  │  └─ ✔ passed 0.18638ms
│  ├─ Can compose a complicated nested object tree structure
│  │  └─ ✔ passed 1.398719ms
│  ├─ Can compose a simple mixed array and object tree structure
│  │  └─ ✔ passed 0.298856ms
│  ├─ Can compose a simple mixed object and array tree structure
│  │  └─ ✔ passed 0.172376ms
│  ├─ Can compose a nested mixed array and object tree structure
│  │  └─ ✔ passed 0.362961ms
│  ├─ Can compose a nested mixed object and array tree structure
│  │  └─ ✔ passed 0.151924ms
│  ├─ Can compose a complicated mixed array and object tree structure
│  │  └─ ✔ passed 0.142644ms
│  ├─ Can compose a complicated mixed object and array tree structure
│  │  └─ ✔ passed 0.258007ms
│  ├─ Can log a tree structure
│  │  └─ ✔ passed 0.648681ms
│  ├─ Can log a tree structure with ANSI formatting
│  │  └─ ✔ passed 0.596197ms
│  └─ ✔ suite passed 7.312372ms
├─ Table
│  ├─ Can format a simple table
│  │  └─ ✔ passed 1.847446ms
│  ├─ Can format a simple table using heavy lines
│  │  └─ ✔ passed 0.34847ms
│  ├─ Can format a simple table using light and heavy lines
│  │  └─ ✔ passed 0.472895ms
│  ├─ Can format a simple table using heavy and light lines
│  │  └─ ✔ passed 0.234213ms
│  ├─ Can format a simple table using double lines
│  │  └─ ✔ passed 0.475763ms
│  ├─ Can format a simple table using light and double lines
│  │  └─ ✔ passed 0.193419ms
│  ├─ Can format a simple table using double and light lines
│  │  └─ ✔ passed 0.1986ms
│  ├─ Can format a simple table with ANSI formatting
│  │  └─ ✔ passed 0.240485ms
│  ├─ Can format a large table
│  │  └─ ✔ passed 0.30641ms
│  ├─ Can format a complex table
│  │  └─ ✔ passed 0.703804ms
│  ├─ Can log using enabled table
│  │  └─ ✔ passed 0.276914ms
│  ├─ Can log a nested table using enabled table
│  │  └─ ✔ passed 0.449158ms
│  └─ ✔ suite passed 6.209447ms
└─ ✔ suite passed 53.328736ms


─────────────────────────────────── ⋅⋆ Coverage ⋆⋅ ───────────────────────────────────


Files                                                  Coverage   Branches   Functions
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
index.js                                                    95%        89%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
index.test.js                                              100%       100%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/ansi.js                                                100%       100%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/border.js                                              100%       100%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/filter.js                                              100%        96%         95%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/hex2rgb.js                                              76%        71%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/kaomoji.js                                             100%       100%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/symbol.js                                              100%       100%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/transform.js                                           100%       100%        100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Total                                                       98%        93%         99%


──────────────────────────────────── ⋅⋆ Summary ⋆⋅ ───────────────────────────────────


Suites                                                                               9
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Tests                                                                               99
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Passed                                                                              99
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Failed                                                                               0
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Cancelled                                                                            0
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Skipped                                                                              0
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Todo                                                                                 0
```

## License
This project is licensed under the MIT License.

## Contributing
Feel free to submit issues or pull requests for improvements or additional features.
