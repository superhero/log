import Log                          from '@superhero/log'
import assert                       from 'node:assert'
import { Writable }                 from 'node:stream'
import { beforeEach, suite, test }  from 'node:test'

suite('@superhero/log', () =>
{
  // Create a silent writable stream.
  class SilentStream extends Writable 
  {
    chunks = []

    _write(chunk, encoding, callback) 
    {
      this.chunks.push(chunk.toString())
      callback()
    }
  }

  // Create silent writable streams for outputs to reduce console output during tests.
  const outstream = new SilentStream()
  const errstream = new SilentStream()

  let log // Log instance variable scope declaration

  beforeEach(() =>
  {
    // Clear the chunks before each test
    outstream.chunks = []
    errstream.chunks = []

    // Reset the log instance to ensure a fresh start for each test.
    log = new Log({ outstream, errstream })

    // Simplify the tests by removing formats
    log.config.ansi       = false
    log.config.reset      = false
    log.config.ansiLabel  = false
    log.config.ansiText   = false
    log.config.ansiValue  = false
    log.label             = false
    log.divider           = false
  })

  test('Simple construction of the Log instance', () =>
  {
    const log = new Log({ outstream, errstream })
    log.info`This is a test log message`
    assert.equal(outstream.chunks.length, 1, 'Expected one out stream message')
    assert.equal(errstream.chunks.length, 0, 'Expected no err stream message')
    assert.equal(outstream.chunks[0], 
      '\x1B[0m\x1B[2m\x1B[90m[LOG] ⇢ \x1B[0m\x1B[2mThis is a test log message\x1B[0m\n', 
      'Expected a specific log message in the out stream')
  })

  test('Info', () =>
  {
    assert.equal(outstream.chunks.length, 0, 'Expected no previous out stream messages')

    log.info`info message`

    assert.equal(outstream.chunks.length, 1, 'Expected one out stream message')
    assert.equal(errstream.chunks.length, 0, 'Expected no err stream message')
  })

  test('Warn', () =>
  {
    assert.equal(outstream.chunks.length, 0, 'Expected no previous out stream messages')

    log.warn`warning message`

    assert.equal(outstream.chunks.length, 1, 'Expected one out stream message')
    assert.equal(errstream.chunks.length, 0, 'Expected no err stream message')
  })

  test('Fail', () =>
  {
    assert.equal(errstream.chunks.length, 0, 'Expected no previous err stream messages')

    log.fail`failure message`

    assert.equal(outstream.chunks.length, 0, 'Expected no out stream message')
    assert.equal(errstream.chunks.length, 1, 'Expected one err stream message')
  })

  test('Returns an unformatted string of the log message when configured to return', () =>
  {
    assert.equal(outstream.chunks.length, 0, 'Expected no previous out stream messages')

    const nothing = log.info`${'foo'} ${'bar'} ${'baz'}`
    assert.strictEqual(nothing, undefined, 'Expected the log.info method to return false when not configured to return')

    log.config.returns = true // Enable the return of an unformatted version of the log messages.

    const message = log.info`${'foo'} ${'bar'} ${'baz'}`
    assert.strictEqual(message, `foo bar baz`)

    assert.equal(outstream.chunks.length, 2, 'Expected 2 out stream messages')
  })

  suite('Mute', () =>
  {
    test('Mute all', () =>
    {
      assert.equal(outstream.chunks.length, 0, 'Expected no previous out stream messages')
      assert.equal(errstream.chunks.length, 0, 'Expected no previous err stream messages')

      log.info`info message`
      log.warn`warning message`
      log.fail`failure message`

      assert.equal(outstream.chunks.length, 2, 'Expected 2 out stream message')
      assert.equal(errstream.chunks.length, 1, 'Expected 1 err stream message')
  
      log.config.mute = true

      log.info`info message`
      log.warn`warning message`
      log.fail`failure message`
  
      assert.equal(outstream.chunks.length, 2, 'Expected to still have 2 out stream message becouse all logs are muted')
      assert.equal(errstream.chunks.length, 1, 'Expected to still have 1 err stream message becouse all logs are muted')

      log.config.mute = false
    })

    test('Mute info', () =>
    {
      assert.equal(outstream.chunks.length, 0, 'Expected no previous out stream messages')
      assert.equal(errstream.chunks.length, 0, 'Expected no previous err stream messages')

      log.info`info message`
      log.fail`fail message`
      assert.equal(outstream.chunks.length, 1, 'Expected 1 out stream message')
      assert.equal(errstream.chunks.length, 1, 'Expected 1 err stream message')
  
      log.config.muteInfo = true
  
      log.info`info message`
      log.fail`fail message`
      assert.equal(outstream.chunks.length, 1, 'Expected to still have 1 out stream message becouse info logs are muted')
      assert.equal(errstream.chunks.length, 2, 'Expected to now have 2 err stream message, becouse only info logs are muted')
    })

    test('Mute warn', () =>
    {
      assert.equal(outstream.chunks.length, 0, 'Expected no previous out stream messages')
      assert.equal(errstream.chunks.length, 0, 'Expected no previous err stream messages')
      
      log.warn`warn message`
      log.fail`fail message`
      assert.equal(outstream.chunks.length, 1, 'Expected 1 out stream message')
      assert.equal(errstream.chunks.length, 1, 'Expected 1 err stream message')
  
      log.config.muteWarn = true
  
      log.warn`warn message`
      log.fail`fail message`
      assert.equal(outstream.chunks.length, 1, 'Expected to still have 1 out stream message becouse warn logs are muted')
      assert.equal(errstream.chunks.length, 2, 'Expected to now have 1 err stream message, becouse only warn logs are muted')
    })

    test('Mute fail', () =>
    {
      assert.equal(outstream.chunks.length, 0, 'Expected no previous out stream messages')
      assert.equal(errstream.chunks.length, 0, 'Expected no previous err stream messages')
      
      log.info`info message`
      log.fail`fail message`
      assert.equal(outstream.chunks.length, 1, 'Expected 1 out stream message')
      assert.equal(errstream.chunks.length, 1, 'Expected 1 err stream message')
  
      log.config.muteFail = true
  
      log.info`info message`
      log.fail`fail message`
      assert.equal(outstream.chunks.length, 2, 'Expected to now have 2 out stream message, becouse only fail logs are muted')
      assert.equal(errstream.chunks.length, 1, 'Expected to still have 1 err stream message becouse fail logs are muted')
    })
  })

  suite('Observe', () =>
  {
    test('Observe log info', () => new Promise(done =>
    {
      assert.equal(outstream.chunks.length, 0,    'Expected no previous out stream messages')
      
      log.on('info', () =>
      {
        assert.equal(outstream.chunks.length, 1,  'Expected one out stream message')
        assert.equal(errstream.chunks.length, 0,  'Expected no err stream message')
  
        done()
      })
  
      log.info`info message`
    }))
  
    test('Observe log warn', () => new Promise(done =>
    {
      assert.equal(outstream.chunks.length, 0,    'Expected no previous out stream messages')
      
      log.on('warn', () =>
      {
        assert.equal(outstream.chunks.length, 1,  'Expected no out stream message')
        assert.equal(errstream.chunks.length, 0,  'Expected one err stream message')
  
        done()
      })
  
      log.warn`warning message`
    }))
  
    test('Observe log fail', () => new Promise(done =>
    {
      assert.equal(errstream.chunks.length, 0,    'Expected no previous err stream messages')
      
      log.on('fail', () =>
      {
        assert.equal(outstream.chunks.length, 0,  'Expected no out stream message')
        assert.equal(errstream.chunks.length, 1,  'Expected one err stream message')
  
        done()
      })
  
      log.fail`failure message`
    }))
  
    test('Distinguish types in observed log messages', () => new Promise(done =>
    {
      assert.equal(errstream.chunks.length, 0,    'Expected no previous err stream messages')

      log.on('fail', (...args) => 
      {
        assert.equal(outstream.chunks.length, 0,  'Expected no out stream message')
        assert.equal(errstream.chunks.length, 1,  'Expected one err stream message')
  
        assert.ok(args[1] instanceof Error,       'Expected an error object as the first argument')
        assert.ok('string' === typeof args[2],    'Expected a string as the second argument')
        assert.ok(args[3] instanceof Error,       'Expected an error object as the third argument')
  
        done()
      })
  
      log.fail`foobar ${new Error('foo')} ${'bar'} ${new Error('baz')}`
    }))
  
    test('Distinguish types in observed global log messages', () => new Promise(done =>
    {
      // config.mute = true to prevent console output for this test.
      const
        log1 = new Log({ mute: true }),
        log2 = new Log({ mute: true }),
        log3 = new Log({ mute: true })
  
      let count = 0
  
      Log.on('fail', (config, ...args) => 
      {
        assert.ok(config.mute, 'Expected the instance config object as the first argument')
  
        assert.equal(outstream.chunks.length, 0, 'Expected no out stream message becouse instance is mute')
        assert.equal(errstream.chunks.length, 0, 'Expected no err stream message becouse instance is mute')
  
        for(const arg of args)
          if(arg instanceof Error)
            count++
  
        count === 4 && done()
      })
  
      log1.fail`${new Error('foo')}`
      log2.fail`fail message`
      log3.fail`${new Error('bar')} ${new Error('baz')} ${new Error('qux')}`
    }))
  })

  suite('Transform', () =>
  {
    test('Can transform a string', () =>
    {
      const transformed = log.transform(`foobar`)
      assert.strictEqual(transformed, 'ⓕⓞⓞⓑⓐⓡ', 'Expected a transformed string - circled characters')
      assert.equal(outstream.chunks.length, 0,      'Expected one out stream message')
      assert.equal(errstream.chunks.length, 0,      'Expected one err stream message')
    })
  
    test('Can transform a log message string', () =>
    {
      assert.strictEqual(outstream.chunks.length, 0, 'Expected no previous messages')

      log.info`foobar`
      assert.strictEqual(outstream.chunks[0]?.trim(), 'foobar', 'Expected no transformed message')
  
      log.config.transform = true
  
      log.info`foobar`
      assert.strictEqual(outstream.chunks[1]?.trim(), 'ⓕⓞⓞⓑⓐⓡ', 'Expected a transformed message')
    })
  })

  suite('Colors', () =>
  {
    test('Can define colors using the colors method', () =>
    {
      log.use({ ansi:true, label:'ok', divider:' ' }).color('cyan', 'blue', 'green').info`test ${123}`
      assert.equal(outstream.chunks[0].trim(), '\x1B[32mok \x1B[36mtest \x1B[34m123\x1B[36m', 'Expected ANSI escape codes for cyan text')
    })

    test('Can define Palette 8-bit ANSI escape codes using RGB color definition', () =>
    {
      log.use({ ansi:true, ansiText:'rgb:100' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[38;;5;100mtest', 'Expected ANSI escape codes for 8-bit color text')
    })

    test('Can define Palette 8-bit ANSI escape codes using RGB background color definition', () =>
    {
      log.use({ ansi:true, ansiText:'bg-rgb:50' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[48;;5;50mtest', 'Expected ANSI escape codes for 8-bit background color text')
    })

    test('Can define Truecolor ANSI escape codes using RGB color definition', () =>
    {
      log.use({ ansi:true, ansiText:'255,255,255' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[38;;2;255;255;255mtest', 'Expected ANSI escape codes for white text')
    })

    test('Can define Truecolor ANSI escape codes using RGB color definition', () =>
    {
      log.use({ ansi:true, ansiText:'rgb:255,0,0' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[38;;2;255;0;0mtest', 'Expected ANSI escape codes for red text')
    })

    test('Can define Truecolor ANSI escape codes using RGB background color definition', () =>
    {
      log.use({ ansi:true, ansiText:'bg-rgb:0,255,0' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[48;;2;0;255;0mtest', 'Expected ANSI escape codes for green background text')
    })

    test('Can define Truecolor ANSI escape codes using HEX color definition', () =>
    {
      log.use({ ansi:true, ansiText:'rgb:#0000FF' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[38;;2;0;0;255mtest', 'Expected ANSI escape codes for blue text')
    })

    test('Can define Truecolor ANSI escape codes using HEX background color definition', () =>
    {
      log.use({ ansi:true, ansiText:'bg-rgb:#F0000F' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[48;;2;240;0;15mtest', 'Expected ANSI escape codes for magenta background text')
    })

    test('Can define Truecolor ANSI escape codes using 6 character HEX color definition', () =>
    {
      log.use({ ansi:true, ansiText:'#FFFF00' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[38;;2;255;255;0mtest', 'Expected ANSI escape codes for yellow text')
    })

    test('Can define Truecolor ANSI escape codes using 3 character HEX color definition', () =>
    {
      log.use({ ansi:true, ansiText:'#FF0' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[38;;2;255;255;0mtest', 'Expected ANSI escape codes for yellow text')
    })

    test('Will use the defined ANSI escape code if provided manually', () =>
    {
      log.use({ ansi:true, ansiText:'\x1B[38;;2;0;0;255m' }).info`test`
      assert.equal(outstream.chunks[0].trim(), '\x1B[38;;2;0;0;255mtest', 'Expected ANSI escape codes for blue text')
    })
  })

  test('Can set a specific logger config', () =>
  {
    log.set.info = { label: 'foo' }
    log.info`bar`
    assert.equal(outstream.chunks[0].trim(), 'foobar', 'Expected the log message to be prefixed with the label "foo"')
  })

  suite('Kaomoji', () =>
  {
    test('Can use kaomoji', () =>
    {
      log.kaomoji('smile').info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Throws on invalid kaomoji', () =>
    {
      assert.throws(() => log.kaomoji('foobar').info`kaomoji`,
        { code: 'E_LOG_KAOMOJI_UNKNOWN' }, 'Expected an error to be thrown for an invalid kaomoji')
    })

    test('Can use the "smile" kaomoji in log messages', () =>
    {
      log.smile.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "happy" kaomoji in log messages', () =>
    {
      log.happy.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "good" kaomoji in log messages', () =>
    {
      log.good.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "confused" kaomoji in log messages', () =>
    {
      log.confused.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "idk" kaomoji in log messages', () =>
    {
      log.idk.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "sad" kaomoji in log messages', () =>
    {
      log.sad.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "angry" kaomoji in log messages', () =>
    {
      log.angry.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "bad" kaomoji in log messages', () =>
    {
      log.bad.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })

    test('Can use the "corrected" kaomoji in log messages', () =>
    {
      log.corrected.info`kaomoji`
      assert.ok(outstream.chunks[0].length > 7, 'Expected the kaomoji to be logged')
    })
  })

  suite('Tree', () =>
  {
    test('Can compose a simple value', () =>
    {
      const tree = log.tree('foo')
      assert.equal(
        tree, 
        'foo', 
        'Expected a simple value "foo"')
    })

    test('Can compose a simple array tree structure', () =>
    {
      const tree = log.tree([ 'foo', 'bar' ])
      assert.equal(
        tree, 
        '├─ foo\n└─ bar', 
        'Expected a simple tree structure')
    })

    test('Can compose a nested array tree structure', () =>
    {
      const tree = log.tree([ 'foo', [ 'bar', 'baz' ] ])
      assert.equal(
        tree, 
        '├─ foo\n└──┬─ bar\n   └─ baz', 
        'Expected a nested tree structure')
    })

    test('Can compose a complicated nested array tree structure', () =>
    {
      const tree = log.tree([ 'foo', [ 'bar', 'baz' ], 'qux', [ 1, 2, 3 ], [ 3, 4, 5, 6] ])
      assert.equal(
        tree, 
        '├─ foo\n├──┬─ bar\n│  └─ baz\n├─ qux\n├──┬─ 1\n│  ├─ 2\n│  └─ 3\n└──┬─ 3\n   ├─ 4\n   ├─ 5\n   └─ 6', 
        'Expected a complicated nested tree structure')
    })

    test('Can compose a simple object tree structure', () =>
    {
      const tree = log.tree({ foo: 'bar' })
      assert.equal(
        tree, 
        '└─ foo\n   └─ bar', 
        'Expected a simple tree structure')
    })

    test('Can compose a nested object tree structure', () =>
    {
      const tree = log.tree({ foo: { bar: 'baz' } })
      assert.equal(
        tree, 
        '└─ foo\n   └─ bar\n      └─ baz', 
        'Expected a simple tree structure')
    })

    test('Can compose a complicated nested object tree structure', () =>
    {
      const tree = log.tree({ foo: { bar: 'baz' }, qux: '...', 1: { a:3, b:4, c:5 }, 2: { d:6, e:7, f:8 } })
      assert.equal(
        tree, 
        '├─ 1\n│  ├─ a\n│  │  └─ 3\n│  ├─ b\n│  │  └─ 4\n│  └─ c\n│     └─ 5\n├─ 2\n│  ├─ d\n│  │  └─ 6\n│  ├─ e\n│  │  └─ 7\n│  └─ f\n│     └─ 8\n├─ foo\n│  └─ bar\n│     └─ baz\n└─ qux\n   └─ ...', 
        'Expected a complicated nested tree structure')
    })

    test('Can compose a simple mixed array and object tree structure', () =>
    {
      const tree = log.tree([ 'foo', { bar: 'baz' } ])
      assert.equal(
        tree, 
        '├─ foo\n└─ bar\n   └─ baz', 
        'Expected a mixed array and object tree structure')
    })

    test('Can compose a simple mixed object and array tree structure', () =>
    {
      const tree = log.tree({ foo: [ 'bar', 'baz' ] })
      assert.equal(
        tree, 
        '└─ foo\n   ├─ bar\n   └─ baz', 
        'Expected a mixed object and array tree structure')
    })

    test('Can compose a nested mixed array and object tree structure', () =>
    {
      const tree = log.tree([ 'foo', { bar: [ 'baz', 'qux' ] } ])
      assert.equal(
        tree, 
        '├─ foo\n└─ bar\n   ├─ baz\n   └─ qux', 
        'Expected a mixed array and object tree structure')
    })

    test('Can compose a nested mixed object and array tree structure', () =>
    {
      const tree = log.tree({ foo: [ 'bar', { baz: 'qux' } ] })
      assert.equal(
        tree, 
        '└─ foo\n   ├─ bar\n   └─ baz\n      └─ qux', 
        'Expected a mixed object and array tree structure')
    })

    test('Can compose a complicated mixed array and object tree structure', () =>
    {
      const tree = log.tree([ 'foo', { bar: [ 'baz', 'qux' ], n: [ 1, 2, 3] } ])
      assert.equal(
        tree, 
        '├─ foo\n├─ bar\n│  ├─ baz\n│  └─ qux\n└─ n\n   ├─ 1\n   ├─ 2\n   └─ 3', 
        'Expected a complicated mixed array and object tree structure')
    })

    test('Can compose a complicated mixed object and array tree structure', () =>
    {
      const tree = log.tree({ foo: [ { bar: 'baz' }, { baz: 'qux' }, { qux: '...' } ], qux: [ 1, 2, 3 ] })
      assert.equal(
        tree, 
        '├─ foo\n│  ├─ bar\n│  │  └─ baz\n│  ├─ baz\n│  │  └─ qux\n│  └─ qux\n│     └─ ...\n└─ qux\n   ├─ 1\n   ├─ 2\n   └─ 3', 
        'Expected a complicated mixed object and array tree structure')
    })

    test('Can log a tree structure', () =>
    {
      log.use({ tree:true }).info`foo${{ bar:'baz' }}qux`
      assert.equal(
        outstream.chunks[0].trim(),
        'foo\n└─ bar\n   └─ baz\nqux', 
        'Expected the argument to the template to be logged as a tree structure')
    })
  })
})