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
Log.global.on('fail', (config, ...args) => 
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

| Property        | Type    | Default   | Description                                   |
|-----------------|---------|-----------|-----------------------------------------------|
| `label`         | String  | `[LOG]`   | Prefix for all log messages.                  |
| `mute`          | Boolean | `false`   | Mute all log types.                           |
| `muteInfo`      | Boolean | `false`   | Mute only `info` logs.                        |
| `muteWarn`      | Boolean | `false`   | Mute only `warn` logs.                        |
| `muteFail`      | Boolean | `false`   | Mute only `fail` logs.                        |

## Tests

The library is fully tested using the Node.js native `test` module.

Run tests:

```bash
node test.js
```

### Test Coverage

```
▶ @superhero/core
  ✔ Info (3.458554ms)
  ✔ Warn (1.109146ms)
  ✔ Fail (1.093924ms)

  ▶ Mute
    ✔ Mute all (0.790623ms)
    ✔ Mute info (0.91809ms)
    ✔ Mute warn (0.288443ms)
    ✔ Mute fail (0.707929ms)
  ✔ Mute (5.274307ms)

  ✔ Observe log info (0.972545ms)
  ✔ Observe log warn (0.636159ms)
  ✔ Observe log fail (0.355621ms)
  ✔ Distinguish types in observed log messages (2.140068ms)
  ✔ Distinguish types in observed global log messages (0.664552ms)
  ✔ Colored controlled format (0.741308ms)
  ✔ Supress (0.486298ms)
✔ @superhero/core (19.472827ms)

tests 15
suites 1
pass 15

----------------------------------------------------------------
file            | line % | branch % | funcs % | uncovered lines
----------------------------------------------------------------
index.js        | 100.00 |   100.00 |  100.00 | 
index.test.js   | 100.00 |   100.00 |  100.00 | 
----------------------------------------------------------------
all files       | 100.00 |   100.00 |  100.00 | 
----------------------------------------------------------------
```

## License
This project is licensed under the MIT License.

## Contributing
Feel free to submit issues or pull requests for improvements or additional features.
