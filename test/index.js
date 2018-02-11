const util = require('util')
const assert = require('assert')
const readline = require('readline')
const {exec, spawn} = require('child_process')
const config = require('../package.json')

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

  it('hashes piped input', done => {
    const str = 'test'
    // Generated using sha256sum
    const sum = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    exec(`echo ${str} | ./bin/zettsum`, (err, stdout, stderr) => {
      assert.equal(stdout.trim(), sum)
      done()
    })
  })

  describe('when piped buffers', () => {
    function assertEqual(proc, bufA, bufB) {
      try {
        assert(bufA.equals(bufB), `
          Expected: ${util.inspect(bufA)}
          Actual:   ${util.inspect(bufB)}
        `)
      } finally {
        proc.kill('SIGINT')
      }
    }

    it('hashes the input', done => {
      const buf = Buffer.from('test\n')
      // Generated using sha256sum
      const sum = Buffer.from(
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08\n'
      )
      const proc = spawn('./bin/zettsum')
      proc.stdout.on('data', data => {
        assertEqual(proc, data, sum)
        done()
      })
      proc.stdin.write(buf)
    })

    it('hashes staggered input', done => {
      const chunk1 = Buffer.from('test1\nte')
      const chunk2 = Buffer.from('st2\n')
      // Generated using sha256sum
      const sums = [
        '1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014\n',
        '60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f558c11c752\n',
      ].map(str => Buffer.from(str))
      const proc = spawn('./bin/zettsum')
      let i = 0
      proc.stdout.on('data', data => {
        assertEqual(proc, data, sums[i])
        if(i === 0) {
          i++
          proc.stdin.write(chunk2)
        } else {
          done()
        }
      })
      proc.stdin.write(chunk1)
    })

    it('also uses -i', done => {
      const buf = Buffer.from('test\n')
      // Generated using sha256sum
      const result = Buffer.concat([
        Buffer.from('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08\t'),
        buf,
      ])
      const proc = spawn('./bin/zettsum', ['-i'])
      proc.stdout.on('data', data => {
        assertEqual(proc, data, result)
        done()
      })
      proc.stdin.write(buf)
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

  describe('-e, --digest', () => {
    it('reads a different encoding', done => {
      const str = 'hellø'
      // Generated using zettsum
      const sum = '83f5941b668fede77b738609586ad8fe31730e864c529d78ee3d9e68b9ba712f'
      exec(`echo ${str} | ./bin/zettsum -e latin1`, (err, stdout, stderr) => {
        assert.equal(stdout.trim(), sum)
        done()
      })
    })

    it('provides a helpful error message on invalid format', done => {
      const str = 'test'
      exec(`./bin/zettsum -e shullbit ${str}`, (err, stdout, stderr) => {
        assert.equal(stderr.trim(), 'Unsupported encoding format: shullbit')
        done()
      })
    })
  })

  describe('-i, --input', () => {
    it('displays the input line', done => {
      const str = 'test'
      // Generated using md5sum
      const sum = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      exec(`./bin/zettsum -i ${str}`, (err, stdout, stderr) => {
        assert.equal(stdout.trim(), `${sum}\t${str}`)
        done()
      })
    })
  })

  describe('-h, --help', () => {
    it('displays the help', done => {
      exec('./bin/zettsum -h', (err, stdout, stderr) => {
        assert(/--algorithm/m.test(stdout), '--algorithm not found')
        assert(/--hashes/m.test(stdout), '--hashes not found')
        assert(/--digest/m.test(stdout), '--diges not found')
        assert(/--encoding/m.test(stdout), '--encoding not found')
        assert(/--input/m.test(stdout), '--input not found')
        assert(/--help/m.test(stdout), '--help not found')
        assert(/--version/m.test(stdout), '--version not found')
        done()
      })
    })
  })

  describe('-v, --version', () => {
    it('displays the version', done => {
      exec('./bin/zettsum -v', (err, stdout, stderr) => {
        assert.equal(stdout.trim(), config.version)
        done()
      })
    })
  })
})
