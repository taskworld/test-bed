
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

test-bed integrates closely with webpack. Because of this, it can track dependencies between modules, and will re-execute only the changed files.

<p align="center"><img src="http://i.imgur.com/CN5OfY1.png" width="836" /></p>

Powered by `webpack-hot-middleware`, an overlay will be displayed when there is a bundler error.

<p align="center"><img src="http://i.imgur.com/3vFd6TM.png" width="836" /></p>



## Why?

We’ve been using Karma with webpack, and there are some pain points:

- Karma does not load eval’d source maps.

- Karma’s reporter on console is harder to read, compared to Mocha’s HTML reporter.

- When running tests for the first time, Karma will run the whole suite which takes quite a long time for Taskworld’s codebase, which is quite big. You need to open a new terminal tab and invoke `karma run -- --grep=MyModule` later to limit the scope of the test. And it doesn’t survive restarts.



## How to use?

1. Create a `webpack.config.test-bed.js` with a webpack configuration.

    - `entry` should be set to the test entry file. For example, `./test-entry.js`.

2. Create a test entry file, which sets up the testing environment and sends the test context to TestBed:

    ```js
    // ./test-entry.js

    // Set up your test environment here, e.g. include Mocha.
    const mochaElement = document.createElement('div')
    mochaElement.id = 'mocha'
    document.body.appendChild(mochaElement)
    require('!!script!mocha/mocha.js')
    require('!!style!raw!mocha/mocha.css')
    mocha.setup({ ui: 'bdd' })

    // Run test-bed and send a webpack context.
    TestBed.run({
      // Specify the test context: https://webpack.github.io/docs/context.html
      context: require.context(
        './src',        // ← Look for test files inside `src` directory.
        true,           // ← Recurse into subdirectories.
        /\.spec\.js$/   // ← Only consider files ending in `.spec.js`.
      ),

      // This file will be run when all test files are loaded.
      runTests () {
        mocha.run()
      }
    })
    ```

3. Run `test-bed` and go to `http://localhost:9011/`
