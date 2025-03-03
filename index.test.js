import Log          from '@superhero/log'
import assert       from 'node:assert'
import { Console }  from 'node:console'
import { Writable } from 'node:stream'
import { afterEach, suite, test }  from 'node:test'

suite('@superhero/log', () =>
{
  // Create a silent writable stream.
  class SilentStream extends Writable 
  {
    chunks = new Set()

    _write(chunk, encoding, callback) 
    {
      this.chunks.add(chunk.toString())
      callback()
    }
  }

  // Create a silent streams.
  const silentOut = new SilentStream()
  const silentErr = new SilentStream()

  // Create a silent console instance to show that the console 
  // can be altered, and for the purpose of this test, silenced.
  const silent = new Console(silentOut, silentErr)

  afterEach(() =>
  {
    silentOut.chunks.clear()
    silentErr.chunks.clear()
  })

  test('Info', () =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent

    log.info`info message`

    assert.equal(silentOut.chunks.size, 1, 'Expected one console output on stdout')
    assert.equal(silentErr.chunks.size, 0, 'Expected no console output on stderr')
  })

  test('Warn', () =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent

    log.warn`warning message`

    assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout')
    assert.equal(silentErr.chunks.size, 1, 'Expected one console output on stderr')
  })

  test('Fail', () =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent

    log.fail`failure message`

    assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout')
    assert.equal(silentErr.chunks.size, 1, 'Expected one console output on stderr')
  })

  test('Mute', async (sub) =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent

    await sub.test('Mute all', () =>
    {
      log.info`info message`
      log.warn`warning message`
      log.fail`failure message`

      assert.equal(silentOut.chunks.size, 1, 'Expected no console output on stdout')
      assert.equal(silentErr.chunks.size, 2, 'Expected one console output on stderr')
  
      log.config.mute = true

      log.info`info message`
      log.warn`warning message`
      log.fail`failure message`
  
      assert.equal(silentOut.chunks.size, 1, 'Expected to still have one console output on stderr becouse log is muted')
      assert.equal(silentErr.chunks.size, 2, 'Expected to still have two console output on stderr becouse log is muted')

      log.config.mute = false
    })

    await sub.test('Mute info', () =>
    {
      log.info`info message`
      assert.equal(silentOut.chunks.size, 1, 'Expected one console output on stdout')
      assert.equal(silentErr.chunks.size, 0, 'Expected no console output on stderr')
  
      log.config.muteInfo = true
  
      log.info`info message`
      assert.equal(silentOut.chunks.size, 1, 'Expected to still have one console output on stdout becouse log is muted')
      assert.equal(silentErr.chunks.size, 0, 'Expected to still have no console output on stderr')
    })

    await sub.test('Mute warn', () =>
    {
      log.warn`warning message`
      assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(silentErr.chunks.size, 1, 'Expected one console output on stderr')
  
      log.config.muteWarn = true
  
      log.warn`warning message`
      assert.equal(silentOut.chunks.size, 0, 'Expected to still have no console output on stderr')
      assert.equal(silentErr.chunks.size, 1, 'Expected to still have one console output on stderr becouse log is muted')
    })

    await sub.test('Mute fail', () =>
    {
      log.fail`failure message`
      assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(silentErr.chunks.size, 1, 'Expected one console output on stderr')
  
      log.config.muteFail = true
  
      log.fail`failure message`
      assert.equal(silentOut.chunks.size, 0, 'Expected to still have no console output on stderr')
      assert.equal(silentErr.chunks.size, 1, 'Expected to still have one console output on stderr becouse log is muted')
    })
  })

  test('Observe log info', () => new Promise((done) =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent

    log.on('info', () =>
    {
      assert.equal(silentOut.chunks.size, 1, 'Expected one console output on stdout')
      assert.equal(silentErr.chunks.size, 0, 'Expected no console output on stderr')

      done()
    })

    log.info`info message`
  }))

  test('Observe log warn', () => new Promise((done) =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent
    
    log.on('warn', () =>
    {
      assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(silentErr.chunks.size, 1, 'Expected one console output on stderr')

      done()
    })

    log.warn`warning message`
  }))

  test('Observe log fail', () => new Promise((done) =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent

    log.on('fail', () =>
    {
      assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(silentErr.chunks.size, 1, 'Expected one console output on stderr')

      done()
    })

    log.fail`failure message`
  }))

  test('Distinguish types in observed log messages', () => new Promise((done) =>
  {
    const log = new Log()
    // log.console = silent to prevent console output for this test.
    log.console = silent

    log.on('fail', (...args) => 
    {
      assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(silentErr.chunks.size, 1, 'Expected one console output on stderr')

      assert.ok(args[1] instanceof Error, 'Expected an error object as the first argument')
      assert.ok('string' === typeof args[2], 'Expected a string as the second argument')
      assert.ok(args[3] instanceof Error, 'Expected an error object as the third argument')
      done()
    })

    log.fail`foobar ${new Error('foo')} ${'bar'} ${new Error('baz')}`
  }))

  test('Distinguish types in observed global log messages', () => new Promise((done) =>
  {
    // config.mute = true to prevent console output for this test.
    const
      log1 = new Log({ mute: true }),
      log2 = new Log({ mute: true }),
      log3 = new Log({ mute: true })

    let count = 0

    Log.global.on('fail', (config, ...args) => 
    {
      assert.ok(config.mute, 'Expected the instance config object as the first argument')

      assert.equal(silentOut.chunks.size, 0, 'Expected no console output on stdout becouse instance is mute')
      assert.equal(silentErr.chunks.size, 0, 'Expected no console output on stderr becouse instance is mute')

      for(const arg of args)
        if(arg instanceof Error)
          count++

      count === 4 && done()
    })

    log1.fail`${new Error('foo')}`
    log2.fail`fail message`
    log3.fail`${new Error('bar')} ${new Error('baz')} ${new Error('qux')}`
  }))

  test('Colored controlled format', () =>
  {
    const log = new Log()
    Log.colored = false
    const message = log.format`${'foo'} ${'bar'} ${'baz'}`
    assert.strictEqual(message, `${log.config.label}${log.divider}foo bar baz`)

    assert.equal(silentOut.chunks.size, 0, 'No output should be generated from the format method.')
    assert.equal(silentErr.chunks.size, 0, 'No output should be generated from the format method.')
  })

  test('Supress', () =>
  {
    const
      log = new Log(),
      msg = log.supress`${'foo'} ${'bar'} ${'baz'}`

    assert.strictEqual(msg, `${log.supressed}foo bar baz${log.clearSupressed}`)

    assert.equal(silentOut.chunks.size, 0, 'No output should be generated from the supress method.')
    assert.equal(silentErr.chunks.size, 0, 'No output should be generated from the supress method.')
  })
})