const assert = require('assert')
const readline = require('readline')
const {exec, spawn} = require('child_process')

describe('zettsum', () => {
  it('does not crash', done => {
    exec('./bin/zettsum test', (err, stdout, stderr) => {
      assert(!err, 'Was error.')
      assert(!stderr, 'Was standard error.')
      done()
    })
  })

  it('hashes an input string', done => {
    const str = 'test'
    // Generated using sha256sum
    const sum = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    exec(`./bin/zettsum ${str}`, (err, stdout, stderr) => {
      assert.equal(stdout.trim(), sum)
      done()
    })
  })
  
  it('hashes multiple input string', done => {
    const strs = [
      'test1',
      'test2',
    ]
    // Generated using sha256sum
    const sums = [
      '1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014',
      '60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f558c11c752',
    ]
    exec(`./bin/zettsum ${strs.join(' ')}`, (err, stdout, stderr) => {
      assert.deepEqual(stdout.split('\n').filter(line => line), sums)
      done()
    })
  })

  describe('-a, --algorithm', () => {
    it('hashes for different algorithms', done => {
      const str = 'test'
      // Generated using md5sum
      const sum = '098f6bcd4621d373cade4e832627b4f6'
      exec(`./bin/zettsum -a md5 ${str}`, (err, stdout, stderr) => {
        assert.equal(stdout.trim(), sum)
        done()
      })
    })

    it('provides a helpful error message on invalid algorithms', done => {
      const str = 'test'
      exec(`./bin/zettsum -a bogusalgo ${str}`, (err, stdout, stderr) => {
        assert.equal(stderr.trim(), 'Unsupported hashing algorithm: bogusalgo')
        done()
      })
    })
  })

  describe('-H, --hashes', () => {
    it('displays a list of available hashing algorithms', done => {
      exec('./bin/zettsum -H', (err, stdout, stderr) => {
        const algos = stdout.split('\n')
        assert(algos.includes('md5'), 'md5 not found')
        assert(algos.includes('sha256'), 'sha256 not found')
        assert(algos.includes('sha512'), 'sha512 not found')
        done()
      })
    })
  })

  describe('-d, --digest', () => {
    it('digests a different format', done => {
      const str = 'test'
      // Generated using openssl
      const sum = 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg='
      exec(`./bin/zettsum -d base64 ${str}`, (err, stdout, stderr) => {
        assert.equal(stdout.trim(), sum)
        done()
      })
    })

    it('provides a helpful error message on invalid format', done => {
      const str = 'test'
      exec(`./bin/zettsum -d shullbit ${str}`, (err, stdout, stderr) => {
        assert.equal(stderr.trim(), 'Unsupported digest format: shullbit')
        done()
      })
    })
  })

  describe('-e, --encoding', () => {
    it('digests a different format', done => {
      const buf = Buffer.from('test', 'ascii')
      // Generated using openssl
      const sum = 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg='
      const child = spawn('./bin/zettsum', ['-e', 'ascii'])
      child.stdout.on('data', outbuf => {
        console.log(sum.toString())
      })
      child.stdin.write(buf)
    })

    it('provides a helpful error message on invalid format', done => {
      const str = 'test'
      exec(`./bin/zettsum -d shullbit ${str}`, (err, stdout, stderr) => {
        assert.equal(stderr.trim(), 'Unsupported digest format: shullbit')
        done()
      })
    })
  })
})
