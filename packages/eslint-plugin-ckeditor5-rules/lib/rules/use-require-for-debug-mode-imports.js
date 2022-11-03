/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const DEFAULT_ALIAS_IMPORT = /import { default as (.*) } from (.*)?;/g;
const NAMED_ALIAS_IMPORT = /import { (.*) as (.*) } from (.*)?;/g;
const NAMED_IMPORT = /import { (.*) } from (.*)?;/g;
const NAMESPACE_ALIAS_IMPORT = /import .* as (.*) from (.*)?;/g;
const DEFAULT_IMPORT = /import (.*) from (.*)?;/g;
const SIDE_EFFECT_IMPORT = /import (.*)?;/g;

const DESTRUCTURED_ALIAS_REPLACE = 'const { $1: $2 } = require( $3 );';
const DESTRUCTURED_REPLACE = 'const { $1 } = require( $2 );';
const MODULE_REPLACE = 'const $1 = require( $2 );';
const DEFAULT_REPLACE = 'const $1 = require( $2 ).default;';
const SIDE_EFFECT_REPLACE = 'require( $1 );';

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow using the `import` keyword for modules used in debug mode.',
			category: 'CKEditor5'
		},
		fixable: 'code',
		messages: {
			'usingImportNotAllowed': 'Using import with `@if CK_DEBUG_*` keyword is not allowed. Use `require()` instead.'
		},
		schema: []
	},
	create( context ) {
		return {
			Program() {
				const source = context.getSourceCode();
				const comments = source.getAllComments();

				for ( const comment of comments ) {
					if ( debugCommentDoesNotContainImport( comment.value ) ) {
						continue;
					}

					context.report( {
						node: comment,
						messageId: 'usingImportNotAllowed',
						fix( fixer ) {
							const newCommentValue = getNewComment( comment.value );
							const newComment = addCommentCharacters( comment.type, newCommentValue );

							return fixer.replaceText( comment, newComment );
						}
					} );
				}
			}
		};
	}
};

/**
 * @param {String} [str='']
 * @returns {Boolean}
 */
function debugCommentDoesNotContainImport( str = '' ) {
	return !/@if CK_DEBUG.*\s*\/\/\s*import/.test( str );
}

/**
 * @param {String} value
 * @returns {Boolean}
 */
function getNewComment( value ) {
	if ( DEFAULT_ALIAS_IMPORT.test( value ) ) {
		return value.replace( DEFAULT_ALIAS_IMPORT, DEFAULT_REPLACE );
	}

	if ( NAMED_ALIAS_IMPORT.test( value ) ) {
		return value.replace( NAMED_ALIAS_IMPORT, DESTRUCTURED_ALIAS_REPLACE );
	}

	if ( NAMED_IMPORT.test( value ) ) {
		return value.replace( NAMED_IMPORT, DESTRUCTURED_REPLACE );
	}

	if ( NAMESPACE_ALIAS_IMPORT.test( value ) ) {
		return value.replace( NAMESPACE_ALIAS_IMPORT, MODULE_REPLACE );
	}

	if ( DEFAULT_IMPORT.test( value ) ) {
		return value.replace( DEFAULT_IMPORT, DEFAULT_REPLACE );
	}

	return value.replace( SIDE_EFFECT_IMPORT, SIDE_EFFECT_REPLACE );
}

/**
 * @param {String} type
 * @param {String} value
 * @returns {Boolean}
 */
function addCommentCharacters( type, value ) {
	const commentPrefix = type === 'Line' ? '//' : '/*';
	const commentSuffix = type === 'Line' ? '' : '*/';

	return commentPrefix + value + commentSuffix;
}

