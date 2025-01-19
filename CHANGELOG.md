# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.1.6] - 2025-01-19

### Changed
The controller now supports a configurable storage location, see the README for details of how this can be changed, My default the package will continue to use the default of $HOME/.matter.
Changing this on a configured system without manually copying the files to the new location will result in errors.
If you are running Node-RED in a container like Docker then you will likely want to update this to a persistant file storage location.


## [0.1.5] - 2025-01-16

### Fixed
The typedInput fields in Device Management and Write attribute now use a callback (wrapped in a promise) for compatibility with NodeRed 4.0

### Added
Added a new typedInput of null to the write attribute widget params field, this will allow you to set an attribute back to null after its been initially set.

## [0.1.4] - 2025-01-1

### Fixed
Fixes to the device manager nodes to better deal with typed inputs

Fixes to the write attribute node to handle typed inputs on the params field
Fixed a type in the attribute param info

## [0.1.3] - 2025-01-02

### Fixed
Issue with the path for loading the editor resources

## [0.1.1] - 2025-01-01
First release

### Known Bugs
No support for BLE yet only on-network commisioning
Device labels/renaming may be sporadic
Changing events within a node may result in old events being emitted unless a full node-red depoloy is done.

