
# test-bed

__test-bed__ is a testing tool that integrates with webpack to provide a better test-driven development experience.
It only executes run test files that are affected by the code change.

This project is only meant to improve the developer experience.
It is not for running tests inside a CI.
For that purpose, you should use something like Karma.


## Overview

Once test-bed is set up, you can run it by invoking `./node_modules/.bin/test-bed`.

<p align="center"><img src="http://i.imgur.com/W4LOJEZ.png" width="777" /></p>

It binds a web server on port 9011 and shows you the test result.

<p align="center"><img src="http://i.imgur.com/KKR2v0o.png" width="836" /></p>

Powered by `webpack-dev-middleware`, your bundle files are served from memory. No disk writes!

Powered by `webpack-hot-middleware`, your tests will be re-run when you save files.

Powered by Hot Module Replacement, test-bed will re-execute only the changed files.

<p align="center"><img src="http://i.imgur.com/CN5OfY1.png" width="836" /></p>

Also powered by `webpack-hot-middleware`, an overlay will be displayed when there is a bundler error.

<p align="center"><img src="http://i.imgur.com/3vFd6TM.png" width="836" /></p>



## Why?

We’ve been using Karma with webpack, and there are some pain points:

- Karma does not load eval’d source maps.

- Karma’s reporter on console is harder to read, compared to Mocha’s HTML reporter.

- When running tests for the first time, Karma will run the whole suite which takes quite a long time for Taskworld’s codebase, which is quite big. You need to open a new terminal tab and invoke `karma run -- --grep=MyModule` later to limit the scope of the test. And it doesn’t survive restarts.



## How to use?

1. Create a `webpack.config.test-bed.js` with a webpack configuration.

    - `entry` should be set to the test entry file. For example, `./test-entry.js`.

2. Create a test entry file, which sets up the testing environment and sends the test context:

    ```js
    // ./test-entry.js

    // Set up your test environment here, e.g. include Mocha.
    const mochaElement = document.createElement('div')
    mochaElement.id = 'mocha'
    document.body.appendChild(mochaElement)
    require('script!mocha/mocha.js')
    require('style!css!mocha/mocha.css')
    mocha.setup({ ui: 'bdd' })

    // Tell TestBed how to run your tests:
    TestBed.setup({
      run () {
        mocha.run()
      }
    })

    // Send test context to TestBed and enable hot reloading
    TestBed.receiveContext(require('./test-context'))
    module.hot.accept('./test-context', function () {
      TestBed.receiveContext(require('./test-context'))
    })
    ```

3. Create a test context file, which exports a require context for the test. Pass the modules through `test-bed/thunk-loader` when creating the context.

    ```js
    // ./test-context

    module.exports = require.context(
      'test-bed/thunk-loader!src',
      true,
      /\.spec\.js$/
    )
    ```

4. Run `test-bed`.
