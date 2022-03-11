/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

const { getTestRule } = require( 'jest-preset-stylelint' );
const path = require( 'path' );
const util = require( 'util' );

const PLUGIN_PATH = path.join( __dirname, '..', '..', 'lib', 'rules', 'license-header.js' ).replace( /\\/g, '/' );

global.testRule = getTestRule();

const config = [
	true,
	{
		headerContent:
			[
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license'
			]
	}
];

const { ruleName } = require( PLUGIN_PATH );
const messages = {
	missing: `This file does not begin with a license header. (${ ruleName })`,
	notLicense: `This file begins with a comment that is not a license header. (${ ruleName })`,
	content: `Incorrect license header content. (${ ruleName })`,
	gap: `Disallowed gap before the license. (${ ruleName })`
};

// For reasons that we don't understand, the `jest-preset-stylelint` package created additional `describe()` blocks for
// the plugin configuration and the checked code. It uses the `util.inspect()` function for making a string from the given `input`.
// Lets override it and return an empty string for these values to avoid a mess in a console.
// The original function is restored at the end of the file.
const defaultInspectFunction = util.inspect;

util.inspect = () => {
	return '';
};

global.testRule( {
	plugins: [ PLUGIN_PATH ],
	ruleName,
	config,

	accept: [
		{
			description: 'File containing only the license.',
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'File containing the license and a CSS rule.',
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */',
				'',
				'.ck.ck-editor {',
				'	margin: 1.5em 0;',
				'}',
				''
			].join( '\n' )
		}
	],

	reject: [
		{
			description: 'Reports error for empty file.',
			message: messages.missing,
			code: ''
		},
		{
			description: 'Reports error for file without comments.',
			message: messages.missing,
			code: [
				'.ck.ck-editor {',
				'	margin: 1.5em 0;',
				'}'
			].join( '\n' )
		},
		{
			description: 'Reports error for file starting with comment that is not a license.',
			message: messages.notLicense,
			code: [
				'/* Comment */'
			].join( '\n' )
		},
		{
			description: 'Reports error for license with extra space at the beginning.',
			message: messages.content,
			code: [
				'/* ',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Reports error for license with missing space at the beginning.',
			message: messages.content,
			code: [
				'/*',
				'* @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Reports error for license with extra space at the end.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				'  */'
			].join( '\n' )
		},
		{
			description: 'Reports error for license with missing space at the end.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				'*/'
			].join( '\n' )
		},
		{
			description: 'Reports error for license with extra part of the content.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' * This license has too much text.',
				' */'
			].join( '\n' )
		},
		{
			description: 'Reports error for license with missing part of the content.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md.',
				' */'
			].join( '\n' )
		},
		{
			description: 'Reports error for license that does not start at the first line of the file.',
			message: messages.gap,
			code: [
				'',
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		}
	]
} );

global.testRule( {
	plugins: [ PLUGIN_PATH ],
	ruleName,
	fix: true,
	config,

	reject: [
		{
			description: 'Fixes license with extra space at the beginning.',
			message: messages.content,
			code: [
				'/* ',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' ),
			fixed: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Fixes license with missing space at the beginning.',
			message: messages.content,
			code: [
				'/*',
				'* @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' ),
			fixed: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Fixes license with extra space at the end.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				'  */'
			].join( '\n' ),
			fixed: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Fixes license with missing space at the end.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				'*/'
			].join( '\n' ),
			fixed: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Fixes license with extra part of the content.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' * This license has too much text.',
				' */'
			].join( '\n' ),
			fixed: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Fixes license with missing part of the content.',
			message: messages.content,
			code: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md.',
				' */'
			].join( '\n' ),
			fixed: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		},
		{
			description: 'Fixes license that does not start at the first line of the file.',
			message: messages.gap,
			code: [
				'',
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' ),
			fixed: [
				'/*',
				' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license',
				' */'
			].join( '\n' )
		}
	]
} );

// Restore the original function.
util.inspect = defaultInspectFunction;
