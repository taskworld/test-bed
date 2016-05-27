
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

If you’ve set up code coverage instrumentation (e.g. using [babel-plugin-\_\_coverage\_\_](https://github.com/dtinth/babel-plugin-__coverage__)), then `test-bed` will generate a coverage report file (`lcov.info`) so that you can [integrate coverage measurement into your text editor](https://atom.io/packages/atom-lcov)!

<p align="center"><img src="http://i.imgur.com/9kOSk6m.png" width="849" /></p>



## Why?

At Taskworld, our front-end, as well as our test suite, is growing quickly. Now we have hundreds of test files…

We’ve been using Karma with webpack, and there are some pain points:

- Karma does not load eval’d source maps.

- Karma’s reporter on console is harder to read, when compared to Mocha’s HTML reporter.

- When running tests for the first time, Karma will always run the whole suite. It takes quite a long time for Taskworld’s codebase (which is quite big). You need to open a new terminal tab and invoke `karma run -- --grep=MyModule` later to limit the scope of the test. And it doesn’t survive restarts.

For running in CI servers, we use Karma which works perfectly fine!



## How to use it?

1. Install test-bed.

    ```
    npm install --save-dev test-bed
    ```

2. Create a `webpack.config.test-bed.js` with your webpack configuration.

    - `entry` should be set to the test entry file. For example, `./test-entry.js`.

3. Create a test entry file, which sets up the testing environment and sends the test context to TestBed:

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

      // This function will be run when all test files are loaded.
      // It should return a promise that resolves when tests finish.
      runTests: () => new Promise((resolve) => mocha.run(resolve))
    })
    ```

4. Run `./node_modules/.bin/test-bed` and go to `http://localhost:9011/`
