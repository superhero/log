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
// └─ foo:
//    ├─ bar
//    ├─ baz
//    └──── qux:
//          ├─ 1
//          ├─ 2
//          └─ 3
```

### Observability

Each log type (`info`, `warn`, `fail`) triggers an event both locally and globally, on a static global event emitter, as well as an local instance event emitter.

It's possible to listen to one or both of the event emitters to extend the expected reaction to a log message, for example to perist the log event in a database.

```javascript
import Log from '@superhero/log'

const log = new Log({ label: '[MyApp]', mute: true, staticLog: true })

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

| Property         | Type    | Default    | Description                                            |
|------------------|---------|------------|--------------------------------------------------------|
| `label`          | String  | `[LOG]`    | Prefix for all log messages.                           |
| `divider`        | String  | ` ⇢ `      | Divider between label and message.                     |
| `mute`           | Boolean | `false`    | Mute all log types.                                    |
| `muteInfo`       | Boolean | `false`    | Mute only `info` logs.                                 |
| `muteWarn`       | Boolean | `false`    | Mute only `warn` logs.                                 |
| `muteFail`       | Boolean | `false`    | Mute only `fail` logs.                                 |
| `transform`      | Boolean | `false`    | Transform the text to unicode styled                   |
| `inline`         | Boolean | `false`    | Should the log message append EOL                      |
| `returns`        | Boolean | `false`    | Returns the unformatted message if true                |
| `table`          | Boolean | `false`    | Structures arguemnts as a table structure, if possible |
| `tree`           | Boolean | `false`    | Structures arguemnts as a tree structure               |
| `staticLog`      | Boolean | `false`    | Ability to enable/disable static log propagation       |
| `timestampLabel` | Boolean | `false`    | Defines a dynamic label of a local timestamp           |
| `ansi`           | Boolean | `true`     | Format using using ANSI escpape codes                  |
| `reset`          | Boolean | `true`     | Reset when using ANSI                                  |
| `outstream`      | Stream  | `stdout`   | Output stream                                          |
| `errstream`      | Stream  | `stderr`   | Error stream                                           |
| `EOL`            | String  | `os`.`EOL` | New line, or other end of line (EOL) character         |
| `border`         | String  | `light`    | Border type to use when rendering borders              |
| `ansiLabel`      | String  |            | ANSI escape codes to format the label                  |
| `ansiText`       | String  |            | ANSI escape codes to format the text                   |
| `ansiValue`      | String  |            | ANSI escape codes to format the value                  |
| `ansiTable`      | String  |            | ANSI escape codes to format the table borders          |
| `ansiTree`       | String  |            | ANSI escape codes to format the tree borders           |

## Tests

Run tests...

```bash
npm test
```

### Test Coverage

```
────────────────────────────────── ⋅⋆ Suite ⋆⋅ ─────────────────────────────────


@superhero/log 
├─ Simple construction of the Log instance ✔ 4.107ms
├─ Info ✔ 0.570ms
├─ Warn ✔ 0.398ms
├─ Fail ✔ 0.388ms
├─ Returns an unformatted string of the log message when configured to return ✔ 0.870ms
├─ Mute 
│  ├─ Mute all ✔ 0.524ms
│  ├─ Mute info ✔ 0.313ms
│  ├─ Mute warn ✔ 0.321ms
│  ├─ Mute fail ✔ 0.331ms
│  └─ ✔ 1.848ms
├─ Observe 
│  ├─ Observe log info ✔ 0.976ms
│  ├─ Observe log warn ✔ 0.397ms
│  ├─ Observe log fail ✔ 0.353ms
│  ├─ Distinguish types in observed log messages ✔ 0.909ms
│  ├─ Distinguish types in observed global log messages ✔ 1.694ms
│  └─ ✔ 4.685ms
├─ Filter 
│  ├─ Can filter log messages using camelCase ✔ 1.173ms
│  ├─ Can filter log messages using capitalize ✔ 0.673ms
│  ├─ Can filter log messages using dashCase ✔ 1.947ms
│  ├─ Can filter log messages using dotCase ✔ 0.459ms
│  ├─ Can filter log messages using leet ✔ 0.676ms
│  ├─ Can filter log messages using lowerCase ✔ 0.389ms
│  ├─ Can filter log messages using pathCase ✔ 0.307ms
│  ├─ Can filter log messages using pipeCase ✔ 0.266ms
│  ├─ Can filter log messages using randomCase ✔ 0.373ms
│  ├─ Can filter log messages using reverse ✔ 0.402ms
│  ├─ Can filter log messages using reverseSentences ✔ 0.529ms
│  ├─ Can filter log messages using reverseWords ✔ 0.578ms
│  ├─ Can filter log messages using snakeCase ✔ 0.365ms
│  ├─ Can filter log messages using spaceCase ✔ 0.307ms
│  ├─ Can filter log messages using tildeCase ✔ 0.345ms
│  ├─ Can filter log messages using titleCase ✔ 0.485ms
│  ├─ Can filter log messages using upperCase ✔ 0.466ms
│  ├─ Can add and remove filters ✔ 0.571ms
│  └─ ✔ 11.305ms
├─ Transform 
│  ├─ Can transform a string ✔ 0.534ms
│  ├─ Can transform a log message string ✔ 0.467ms
│  ├─ Can use circledFilled to transform a log message ✔ 0.406ms
│  ├─ Can use squared to transform a log message ✔ 0.295ms
│  ├─ Can use squaredDashed to transform a log message ✔ 0.671ms
│  ├─ Can use squaredFilled to transform a log message ✔ 0.456ms
│  ├─ Can use upsideDown to transform a log message ✔ 0.289ms
│  ├─ Can use smallCaps to transform a log message ✔ 0.325ms
│  ├─ Can use smallCaps to transform a log message ✔ 0.253ms
│  ├─ Can use doubleStruck to transform a log message ✔ 0.332ms
│  ├─ Can use oldEnglish to transform a log message ✔ 0.587ms
│  ├─ Can use strongOldEnglish to transform a log message ✔ 0.472ms
│  ├─ Can use script to transform a log message ✔ 0.287ms
│  ├─ Can use serif to transform a log message ✔ 0.470ms
│  ├─ Can use strong to transform a log message ✔ 0.437ms
│  ├─ Can use fullwidth to transform a log message ✔ 2.144ms
│  ├─ Can use parenthesized to transform a log message ✔ 0.264ms
│  └─ ✔ 9.702ms
├─ Colors 
│  ├─ Can define colors using the colors method ✔ 1.333ms
│  ├─ Can define Palette 8-bit ANSI escape codes using RGB color definition ✔ 0.433ms
│  ├─ Can define Palette 8-bit ANSI escape codes using RGB background color definition ✔ 0.427ms
│  ├─ Can define Truecolor ANSI escape codes using RGB color definition ✔ 0.277ms
│  ├─ Can define Truecolor ANSI escape codes using RGB color definition ✔ 0.229ms
│  ├─ Can define Truecolor ANSI escape codes using RGB background color definition ✔ 0.377ms
│  ├─ Can define Truecolor ANSI escape codes using HEX color definition ✔ 0.579ms
│  ├─ Can define Truecolor ANSI escape codes using HEX background color definition ✔ 0.729ms
│  ├─ Can define Truecolor ANSI escape codes using 6 character HEX color definition ✔ 0.347ms
│  ├─ Can define Truecolor ANSI escape codes using 3 character HEX color definition ✔ 0.453ms
│  ├─ Will use the defined ANSI escape code if provided manually ✔ 0.309ms
│  └─ ✔ 6.204ms
├─ Can set a specific logger config ✔ 0.412ms
├─ Kaomoji 
│  ├─ Can use kaomoji ✔ 0.673ms
│  ├─ Throws on invalid kaomoji ✔ 1.194ms
│  ├─ Can use the "smile" kaomoji in log messages ✔ 0.252ms
│  ├─ Can use the "happy" kaomoji in log messages ✔ 0.286ms
│  ├─ Can use the "good" kaomoji in log messages ✔ 0.735ms
│  ├─ Can use the "confused" kaomoji in log messages ✔ 0.421ms
│  ├─ Can use the "idk" kaomoji in log messages ✔ 0.250ms
│  ├─ Can use the "sad" kaomoji in log messages ✔ 0.216ms
│  ├─ Can use the "angry" kaomoji in log messages ✔ 0.227ms
│  ├─ Can use the "bad" kaomoji in log messages ✔ 0.249ms
│  ├─ Can use the "corrected" kaomoji in log messages ✔ 0.314ms
│  └─ ✔ 5.349ms
├─ Symbol 
│  ├─ Can use status symbols as label ✔ 0.799ms
│  ├─ Can use yes/no symbols in log messages ✔ 0.494ms
│  ├─ Can use time symbol in log messages ✔ 0.379ms
│  ├─ Can use love symbol in log messages ✔ 0.314ms
│  ├─ Can use dead symbol in log messages ✔ 0.302ms
│  └─ ✔ 2.715ms
├─ Tree 
│  ├─ Different sporadic tests ✔ 2.870ms
│  ├─ Can compose a simple value ✔ 0.295ms
│  ├─ Can compose a simple array tree structure ✔ 0.366ms
│  ├─ Can compose a nested array tree structure ✔ 0.423ms
│  ├─ Can compose a nested array and object with a single attribute ✔ 0.202ms
│  ├─ Can compose a nested array and object with multiple attributes ✔ 0.271ms
│  ├─ Can compose a nested array and object with multiple attributes, wrapped between primitive values ✔ 0.305ms
│  ├─ Can compose a complicated nested array tree structure ✔ 0.227ms
│  ├─ Can compose a simple object tree structure ✔ 0.188ms
│  ├─ Can compose a nested object tree structure ✔ 1.957ms
│  ├─ Can compose a complicated nested object tree structure ✔ 0.356ms
│  ├─ Can compose a simple mixed array and object tree structure ✔ 0.446ms
│  ├─ Can compose a simple mixed object and array tree structure ✔ 0.182ms
│  ├─ Can compose a nested mixed array and object tree structure ✔ 0.189ms
│  ├─ Can compose a nested mixed object and array tree structure ✔ 0.180ms
│  ├─ Can compose a complicated mixed array and object tree structure ✔ 0.360ms
│  ├─ Can compose a complicated mixed object and array tree structure ✔ 0.228ms
│  ├─ Can log a tree structure ✔ 0.258ms
│  ├─ Can log a tree structure with ANSI formatting ✔ 0.290ms
│  └─ ✔ 10.398ms
├─ Table 
│  ├─ Can format a simple table ✔ 1.896ms
│  ├─ Can format a simple table using heavy lines ✔ 0.365ms
│  ├─ Can format a simple table using light and heavy lines ✔ 0.473ms
│  ├─ Can format a simple table using heavy and light lines ✔ 0.331ms
│  ├─ Can format a simple table using double lines ✔ 0.308ms
│  ├─ Can format a simple table using light and double lines ✔ 0.243ms
│  ├─ Can format a simple table using double and light lines ✔ 0.233ms
│  ├─ Can format a simple table using dashed lines ✔ 0.229ms
│  ├─ Can format a simple table using dashed heavy lines ✔ 0.224ms
│  ├─ Can format a simple table using dotted lines ✔ 0.385ms
│  ├─ Can format a simple table using rounded lines ✔ 0.269ms
│  ├─ Can format a simple table using rounded and dashed lines ✔ 0.245ms
│  ├─ Can format a simple list-table using light lines ✔ 0.233ms
│  ├─ Can format a simple list-table using heavy lines ✔ 0.230ms
│  ├─ Can format a simple list-table using double lines ✔ 0.214ms
│  ├─ Can format a simple list-table using dashed lines ✔ 0.223ms
│  ├─ Can format a simple list-table using heavy dashed lines ✔ 0.226ms
│  ├─ Can format a simple list-table using dotted lines ✔ 0.224ms
│  ├─ Can format a simple list-table using dotted lines ✔ 0.221ms
│  ├─ Can format a simple list-table using dotted lines ✔ 0.455ms
│  ├─ Can format a simple table using diamond frame ✔ 0.262ms
│  ├─ Can format a simple table using simple out-lines ✔ 0.245ms
│  ├─ Can format a simple table using no lines ✔ 0.226ms
│  ├─ Can format a simple table with ANSI formatting ✔ 0.321ms
│  ├─ Can format a large table ✔ 0.430ms
│  ├─ Can format a complex table ✔ 0.840ms
│  ├─ Can log using enabled table ✔ 0.393ms
│  ├─ Can log a nested table using enabled table ✔ 0.439ms
│  ├─ Can log a mapped flat object as a table ✔ 0.385ms
│  ├─ Can log a nested mapped flat object as a nested table ✔ 0.350ms
│  └─ ✔ 12.231ms
└─ ✔ 74.029ms


─────────────────────────────────────────── ⋅⋆ Coverage ⋆⋅ ───────────────────────────────────────────


Files                                                                  Coverage   Functions   Branches
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
index.js                                                                    94%         95%        88%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/ansi.js                                                                100%        100%       100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/border.js                                                              100%        100%       100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/filter.js                                                              100%         95%        96%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/hex2rgb.js                                                              76%        100%        71%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/kaomoji.js                                                             100%        100%       100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/symbol.js                                                              100%        100%       100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/transform.js                                                           100%        100%       100%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
lib/tree-renderer.js                                                        89%         96%        83%
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Total                                                                       94%        86%         95%


─────────────────────────────────────────── ⋅⋆ Uncovered ⋆⋅ ──────────────────────────────────────────


─ index.js
  [85-100], [233-234], [238-241], [254-257], [266-269], [287-290], [321-326], [337-338], [596-598]
  [610-612], [821-823], [990-991], [995-998], [1004-1007], [1019-1022]
─ lib/hex2rgb.js
  [14-17], [34-38]
─ lib/tree-renderer.js
  [26-28], [52-54], [104-105], [108-109], [164-165], [179-191], [219-220], [294-295], [333-335]
  [394-395], [404-406], [430-439], [459-461], [492-493], [498-501], [540-541]


──────────────────────────────────────────── ⋅⋆ Summary ⋆⋅ ───────────────────────────────────────────


Suites                                                                                              10
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Tests                                                                                              126
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Passed                                                                                             126
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Failed                                                                                               0
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Cancelled                                                                                            0
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Skipped                                                                                              0
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Todo                                                                                                 0
```

## License
This project is licensed under the MIT License.

## Contributing
Feel free to submit issues or pull requests for improvements or additional features.
