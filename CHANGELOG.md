# Changelog

We use the following tags to categorize changes we made in each new release: 

- :boom:       **Breaking Change**: non-backwards compatible changes.
- :rocket:     **New Features**: new features added.
- :bug:        **Bug Fix**: changes applied to fix errors.
- :hammer:     **Improvements**: changes for improving an existing feature.
- :warning:    **Deprecated**: discouragement of use of a feature.
- :memo:       **Documentation**: documentation related changes.
- :house:      **Internal**: internal changes (organization or structure).


## v1.1.2 (2020-04-16)

#### :bug: Bug fix

- Fixed bug parsing expression attributes in schema parser.
- Fixed bug parsing json attributes values in schema parser.
- Fixed minor bug parsing extra props in `band` and `interval` scales. Parse interval prop value to number when getting context value.


## v1.1.1 (2020-03-31)

#### :hammer: Improvements

- Allow conditional values in domain and range attributes of XML schema.


## v1.1.0 (2020-03-24)

#### :boom: Breaking changes

- Changed `jviz` constructor arguments and now accepts only two arguments: the compiled schema and an options object.
- `parent` option must be a `<div>` element reference instead of a `<svg>`.
- Using promise in `render` method instead of callback.

#### :rocket: New features

- Implemented new XML based schema. Now constructor only accepts a compiled and validated XML schema.
- `axis` accepts now `context.value` attributes.
- Added XML schema parser methods: `jviz.parse` and `jviz.parseSync`.
- Added `isUndef`, `isValid` and `isBool` methods to util module.
- Added `ticks` generator to math module.
- Added boolean parser to evaulate module: now accepts `true` and `false` values inside the expression.
- Added `indexOf`, `isUndef` and `isValid` methods to expression parser.
- Added loader for webpack to compile and parse XML schemas in webpack.

#### :bug: Bug Fix

- Fixed bug when empty data is passes to `spacing` transform. 


