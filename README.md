# Log

A simple logger designed to be a versatile Node.js utility component, offering customizable formatting, colorized output, and event-driven hooks for use cases where logging needs to be pluggable. Designed to create a standard for the general @superhero tool chain, but is an isolated compoent that can be used to seamlessly integrate into any modern Node.js application.

## Features

- **Event-driven logging**: Emits events (`info`, `warn`, `fail`) for enhanced observability.
- **Customizable output**: Includes colored and non-colored output options.
- **Message formatting**: Template literal support for dynamic log messages.
- **Global event hooks**: Observe logs globally across multiple instances.
- **Mute control**: Granular muting for `info`, `warn`, and `fail` logs.

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
log.upsideDown.info`ffuts nuF` // ɟɟnʇs unℲ
log.smallCaps.info`Enough now` // Eɴᴏᴜɢʜ ɴᴏᴡ
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

| Property        | Type    | Default    | Description                                  |
|-----------------|---------|------------|----------------------------------------------|
| `label`         | String  | `[LOG]`    | Prefix for all log messages.                 |
| `divider`       | String  | ` ⇢ `      | Divider between label and message.           |
| `mute`          | Boolean | `false`    | Mute all log types.                          |
| `muteInfo`      | Boolean | `false`    | Mute only `info` logs.                       |
| `muteWarn`      | Boolean | `false`    | Mute only `warn` logs.                       |
| `muteFail`      | Boolean | `false`    | Mute only `fail` logs.                       |
| `transform`     | Boolean | `false`    | Transform the text to unicode styled         |
| `inline`        | Boolean | `false`    | Should the log message append EOL            |
| `returns`       | Boolean | `false`    | Returns the unformatted message if true      |
| `tree`          | Boolean | `false`    | Structures arguemnts as a tree structure     |
| `ansi`          | Boolean | `true`     | Format using using ANSI escpape codes        |
| `reset`         | Boolean | `true`     | Reset when using ANSI                        |
| `outstream`     | Stream  | `stdout`   | Output stream                                |
| `errstream`     | Stream  | `stderr`   | Error stream                                 |
| `EOL`           | String  | `os`.`EOL` | New line or other end of line character      |
| `border`        | String  | `light`    | Border type to use when rendering borders    |
| `ansiLabel`     | String  |            | ANSI escape codes to format the label        |
| `ansiText`      | String  |            | ANSI escape codes to format the text         |
| `ansiValue`     | String  |            | ANSI escape codes to format the value        |

## Tests

Run tests...

```bash
npm test
```

### Test Coverage

```
▶ @superhero/log
  ✔ Info (3.132263ms)
  ✔ Warn (1.026273ms)
  ✔ Fail (0.856849ms)
  ✔ Returns an unformatted string of the log message when configured to return (2.044395ms)

  ▶ Mute
    ✔ Mute all (1.699592ms)
    ✔ Mute info (0.793663ms)
    ✔ Mute warn (0.417128ms)
    ✔ Mute fail (0.506808ms)
  ✔ Mute (4.939631ms)

  ▶ Observe
    ✔ Observe log info (0.630509ms)
    ✔ Observe log warn (0.293964ms)
    ✔ Observe log fail (0.245097ms)
    ✔ Distinguish types in observed log messages (0.691411ms)
    ✔ Distinguish types in observed global log messages (1.664369ms)
  ✔ Observe (3.800536ms)

  ▶ Transform
    ✔ Can transform a string (0.431963ms)
    ✔ Can transform a log message string (0.458351ms)
  ✔ Transform (1.073402ms)

  ▶ Colors
    ✔ Can define colors using the colors method (0.951309ms)
    ✔ Can define Palette 8-bit ANSI escape codes using RGB color definition (0.243988ms)
    ✔ Can define Palette 8-bit ANSI escape codes using RGB background color definition (0.241082ms)
    ✔ Can define Truecolor ANSI escape codes using RGB color definition (0.331344ms)
    ✔ Can define Truecolor ANSI escape codes using RGB color definition (0.282975ms)
    ✔ Can define Truecolor ANSI escape codes using RGB background color definition (0.320038ms)
    ✔ Can define Truecolor ANSI escape codes using HEX color definition (0.509677ms)
    ✔ Can define Truecolor ANSI escape codes using HEX background color definition (0.463788ms)
    ✔ Can define Truecolor ANSI escape codes using 6 character HEX color definition (0.347275ms)
    ✔ Can define Truecolor ANSI escape codes using 3 character HEX color definition (0.499435ms)
    ✔ Will use the defined ANSI escape code if provided manually (0.372044ms)
  ✔ Colors (5.143552ms)

  ✔ Can set a specific logger config (0.398921ms)

  ▶ Kaomoji
    ✔ Can use kaomoji (0.704555ms)
    ✔ Throws on invalid kaomoji (1.443774ms)
    ✔ Can use the "smile" kaomoji in log messages (0.411416ms)
    ✔ Can use the "happy" kaomoji in log messages (0.356117ms)
    ✔ Can use the "good" kaomoji in log messages (0.234225ms)
    ✔ Can use the "confused" kaomoji in log messages (0.192324ms)
    ✔ Can use the "idk" kaomoji in log messages (0.184388ms)
    ✔ Can use the "sad" kaomoji in log messages (0.190651ms)
    ✔ Can use the "angry" kaomoji in log messages (0.182483ms)
    ✔ Can use the "bad" kaomoji in log messages (0.255128ms)
    ✔ Can use the "corrected" kaomoji in log messages (0.197446ms)
  ✔ Kaomoji (4.783928ms)

  ▶ Tree
    ✔ Can compose a simple value (0.896528ms)
    ✔ Can compose a simple array tree structure (0.288481ms)
    ✔ Can compose a nested array tree structure (0.218647ms)
    ✔ Can compose a complicated nested array tree structure (0.328716ms)
    ✔ Can compose a simple object tree structure (0.168396ms)
    ✔ Can compose a nested object tree structure (0.185651ms)
    ✔ Can compose a complicated nested object tree structure (1.603565ms)
    ✔ Can compose a simple mixed array and object tree structure (0.40033ms)
    ✔ Can compose a simple mixed object and array tree structure (0.24216ms)
    ✔ Can compose a nested mixed array and object tree structure (0.351753ms)
    ✔ Can compose a nested mixed object and array tree structure (0.203328ms)
    ✔ Can compose a complicated mixed array and object tree structure (0.169818ms)
    ✔ Can compose a complicated mixed object and array tree structure (0.163571ms)
    ✔ Can log a tree structure (0.3019ms)
  ✔ Tree (6.054849ms)
✔ @superhero/log (35.767101ms)

tests 52
suites 7
pass 48

-----------------------------------------------------------------
file             | line % | branch % | funcs % | uncovered lines
-----------------------------------------------------------------
index.js         | 100.00 |    90.48 |  100.00 | 
index.test.js    | 100.00 |   100.00 |  100.00 | 
lib              |        |          |         | 
 ansi.js         | 100.00 |   100.00 |  100.00 | 
 border.js       | 100.00 |   100.00 |  100.00 | 
 hex2rgb.js      |  76.92 |    71.43 |  100.00 | 14-17 34-38
 kaomoji.js      | 100.00 |   100.00 |  100.00 | 
 symbol.js       | 100.00 |   100.00 |  100.00 | 
 transform.js    | 100.00 |   100.00 |  100.00 | 
-----------------------------------------------------------------
all files        |  99.43 |    93.49 |  100.00 | 
-----------------------------------------------------------------
```

## License
This project is licensed under the MIT License.

## Contributing
Feel free to submit issues or pull requests for improvements or additional features.
