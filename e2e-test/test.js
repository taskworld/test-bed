const path = require('path')
process.env.NODE_ENV = 'test'

function runWithServer (stuff) {
  const child = require('child_process').spawn(
    'node',
    [ '../index.js', '-b', 'false' ],
    { stdio: 'inherit', cwd: path.resolve(__dirname, '../example') }
  )
  return waitForServerReady().then(stuff).then(result => {
    child.kill()
    return result
  }, error => {
    child.kill()
    throw error
  })

  function waitForServerReady () {
    return tryCheck(1)
    function tryCheck (attempt) {
      if (attempt > 5) {
        return Promise.reject(new Error('Server not ready in due time'))
      }
      return check()
        .then(() => {
          console.log('* Server is ready now!!')
        })
        .catch(e => {
          console.log('* Server is not ready yet... ' + e)
          return new Promise(
            resolve => setTimeout(() => resolve(tryCheck(attempt + 1)), 1000)
          )
        })
    }
    function check () {
      return new Promise((resolve, reject) => {
        const http = require('http')
        http.get('http://localhost:9012', res => {
          const statusCode = res.statusCode
          if (statusCode !== 200) {
            reject(new Error('Status code ' + res.statusCode))
          }
          res.setEncoding('utf8')
          let data = ''
          res.on('data', chunk => {
            data += chunk
          })
          res.on('end', () => {
            if (/<div id="testbed">/.test(data)) {
              resolve()
            } else {
              reject(new Error(
                'Response does not contain the <div id="testbed">'
              ))
            }
          })
        }).on('error', reject)
      })
    }
  }
}

function runTest () {
  const webdriver = require('selenium-webdriver')
  const { By, until } = webdriver

  const driver = new webdriver.Builder().forBrowser('chrome').build()

  driver.get('http://localhost:9012')
  driver.wait(until.elementLocated(By.css('.testbed-success')), 10000)
  return driver.quit()
}

runWithServer(() => {
  return runTest()
})
  .then(() => {
    console.log('Done!!!')
  })
  .catch(e => {
    console.error('Error!!!')
    console.error(e.stack)
  })
