import Log                          from '@superhero/log'
import assert                       from 'node:assert'
import { Writable }                 from 'node:stream'
import { beforeEach, suite, test }  from 'node:test'

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

  // Create silent writable streams for outputs to reduce console output during tests.
  const outstream = new SilentStream()
  const errstream = new SilentStream()

  let log // Log instance variable scope declaration

  beforeEach(() =>
  {
    // Clear the chunks before each test
    outstream.chunks.clear() 
    errstream.chunks.clear()

    // Reset the log instance to ensure a fresh start for each test.
    log = new Log({ outstream, errstream })
  })

  test('Info', () =>
  {
    log.info`info message`

    assert.equal(outstream.chunks.size, 1, 'Expected one console output on stdout')
    assert.equal(errstream.chunks.size, 0, 'Expected no console output on stderr')
  })

  test('Warn', () =>
  {
    log.warn`warning message`

    assert.equal(outstream.chunks.size, 1, 'Expected no console output on stdout')
    assert.equal(errstream.chunks.size, 0, 'Expected one console output on stderr')
  })

  test('Fail', () =>
  {
    log.fail`failure message`

    assert.equal(outstream.chunks.size, 0, 'Expected no console output on stdout')
    assert.equal(errstream.chunks.size, 1, 'Expected one console output on stderr')
  })

  test('Mute', async (sub) =>
  {
    await sub.test('Mute all', () =>
    {
      log.info`info message`
      log.warn`warning message`
      log.fail`failure message`

      assert.equal(outstream.chunks.size, 2, 'Expected no console output on stdout')
      assert.equal(errstream.chunks.size, 1, 'Expected one console output on stderr')
  
      log.config.mute = true

      log.info`info message`
      log.warn`warning message`
      log.fail`failure message`
  
      assert.equal(outstream.chunks.size, 2, 'Expected to still have one console output on stderr becouse log is muted')
      assert.equal(errstream.chunks.size, 1, 'Expected to still have two console output on stderr becouse log is muted')

      log.config.mute = false
    })

    await sub.test('Mute info', () =>
    {
      log.info`info message`
      assert.equal(outstream.chunks.size, 1, 'Expected one console output on stdout')
      assert.equal(errstream.chunks.size, 0, 'Expected no console output on stderr')
  
      log.config.muteInfo = true
  
      log.info`info message`
      assert.equal(outstream.chunks.size, 1, 'Expected to still have one console output on stdout becouse log is muted')
      assert.equal(errstream.chunks.size, 0, 'Expected to still have no console output on stderr')
    })

    await sub.test('Mute warn', () =>
    {
      log.warn`warning message`
      assert.equal(outstream.chunks.size, 1, 'Expected no console output on stdout')
      assert.equal(errstream.chunks.size, 0, 'Expected one console output on stderr')
  
      log.config.muteWarn = true
  
      log.warn`warning message`
      assert.equal(outstream.chunks.size, 1, 'Expected to still have no console output on stderr')
      assert.equal(errstream.chunks.size, 0, 'Expected to still have one console output on stderr becouse log is muted')
    })

    await sub.test('Mute fail', () =>
    {
      log.fail`failure message`
      assert.equal(outstream.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(errstream.chunks.size, 1, 'Expected one console output on stderr')
  
      log.config.muteFail = true
  
      log.fail`failure message`
      assert.equal(outstream.chunks.size, 0, 'Expected to still have no console output on stderr')
      assert.equal(errstream.chunks.size, 1, 'Expected to still have one console output on stderr becouse log is muted')
    })
  })

  test('Observe log info', () => new Promise(done =>
  {
    log.on('info', () =>
    {
      assert.equal(outstream.chunks.size, 1, 'Expected one console output on stdout')
      assert.equal(errstream.chunks.size, 0, 'Expected no console output on stderr')

      done()
    })

    log.info`info message`
  }))

  test('Observe log warn', () => new Promise(done =>
  {
    log.on('warn', () =>
    {
      assert.equal(outstream.chunks.size, 1, 'Expected no console output on stdout')
      assert.equal(errstream.chunks.size, 0, 'Expected one console output on stderr')

      done()
    })

    log.warn`warning message`
  }))

  test('Observe log fail', () => new Promise(done =>
  {
    log.on('fail', () =>
    {
      assert.equal(outstream.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(errstream.chunks.size, 1, 'Expected one console output on stderr')

      done()
    })

    log.fail`failure message`
  }))

  test('Distinguish types in observed log messages', () => new Promise(done =>
  {
    log.on('fail', (...args) => 
    {
      assert.equal(outstream.chunks.size, 0, 'Expected no console output on stdout')
      assert.equal(errstream.chunks.size, 1, 'Expected one console output on stderr')

      assert.ok(args[1] instanceof Error, 'Expected an error object as the first argument')
      assert.ok('string' === typeof args[2], 'Expected a string as the second argument')
      assert.ok(args[3] instanceof Error, 'Expected an error object as the third argument')
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

      assert.equal(outstream.chunks.size, 0, 'Expected no console output on stdout becouse instance is mute')
      assert.equal(errstream.chunks.size, 0, 'Expected no console output on stderr becouse instance is mute')

      for(const arg of args)
        if(arg instanceof Error)
          count++

      count === 4 && done()
    })

    log1.fail`${new Error('foo')}`
    log2.fail`fail message`
    log3.fail`${new Error('bar')} ${new Error('baz')} ${new Error('qux')}`
  }))

  test('Returns unformatted string when configured to return', () =>
  {
    const nothing = log.info`${'foo'} ${'bar'} ${'baz'}`
    assert.strictEqual(nothing, false, 'Expected the log.info method to return false when not configured to return.')

    log.config.returns = true
    const message = log.info`${'foo'} ${'bar'} ${'baz'}`
    assert.strictEqual(message, `foo bar baz`)
  })
})