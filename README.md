
# test-bed

__test-bed__ is a testing tool that integrates with webpack-dev-server to provide a better test-driven development experience.
It only run test files that are affected by the code change.

This project is only meant to improve the developer experience.
It is not for running tests inside a CI.
For that purpose, you should use something like Karma.


## Why?

We’ve been using Karma with webpack, and there are some pain points:

- Karma does not load eval’d source maps.

- Karma’s reporter on console is harder to read, compared to Mocha’s HTML reporter.

- When running tests for the first time, Karma will run the whole suite which takes quite a long time for Taskworld’s codebase, which is quite big. You need to open a new terminal tab and invoke `karma run -- --grep=MyModule` later to limit the scope of the test. And it doesn’t survive restarts.


## How to use?

Coming soon!!
