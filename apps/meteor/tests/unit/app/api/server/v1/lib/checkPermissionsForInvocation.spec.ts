import { describe, it, mock } from 'node:test';
import * as assert from 'node:assert';
import proxyquire from 'proxyquire';

import type { PermissionsPayload } from '../../../../../../../app/api/server/api.helpers';

const userPermissions: { [k: string]: string[] } = {
	'4r3fsadfasf': ['view-all', 'view-none'],
	'4r3fsadfasf2': ['view-all', 'view-0'],
	'4r3fsadfasf3': ['view-all', 'view-1'],
	'4r3fsadfasf4': [],
};

const mocks = {
	'../../authorization/server/functions/hasPermission': {
		hasAllPermissionAsync: (userId: string, permissions: string[]): boolean => {
			return permissions.every((permission) => userPermissions[userId].includes(permission));
		},
		hasAtLeastOnePermissionAsync: (userId: string, permissions: string[]): boolean => {
			return permissions.some((permission) => userPermissions[userId].includes(permission));
		},
	},
};

const { checkPermissionsForInvocation } = proxyquire.noCallThru().load('../../../../../../../app/api/server/api.helpers', mocks);

describe('checkPermissionsForInvocation', () => {
	const fn = mock.fn(checkPermissionsForInvocation);

	it('should return false when no permissions are provided', async () => {
		const options = { permissionsRequired: {} };

		assert.strictEqual(await fn('4r3fsadfasf', options.permissionsRequired, 'GET'), false);
	});

	it('should return false when no config is provided for that specific method', async () => {
		const options = {
			permissionsRequired: {
				GET: {
					operation: 'hasAll',
					permissions: ['view-all', 'view-none'],
				},
			},
		};

		assert.strictEqual(await fn('4r3fsadfasf', options.permissionsRequired, 'POST'), false);
	});

	it('should return true path is configured with empty permissions array', async () => {
		const options = {
			permissionsRequired: {
				GET: { permissions: [], operation: 'hasAll' },
			},
		};

		assert.strictEqual(await fn('4r3fsadfasf', options.permissionsRequired, 'GET'), true);
	});

	it('should return true when user has all permissions', async () => {
		const options: { permissionsRequired: PermissionsPayload } = {
			permissionsRequired: {
				GET: {
					operation: 'hasAll',
					permissions: ['view-all', 'view-none'],
				},
			},
		};

		assert.strictEqual(await fn('4r3fsadfasf', options.permissionsRequired, 'GET'), true);
	});

	it('should read permissions config from * when request method provided doesnt have config', async () => {
		const options: { permissionsRequired: PermissionsPayload } = {
			permissionsRequired: {
				'GET': {
					operation: 'hasAll',
					permissions: ['view-all', 'view-none'],
				},
				'*': {
					operation: 'hasAll',
					permissions: ['view-all', 'view-none'],
				},
			},
		};

		assert.strictEqual(await fn('4r3fsadfasf', options.permissionsRequired, 'PUT'), true);
	});

	it('should return false when user has no permissions', async () => {
		const options: { permissionsRequired: PermissionsPayload } = {
			permissionsRequired: {
				GET: {
					operation: 'hasAll',
					permissions: ['view-all', 'view-none'],
				},
			},
		};

		assert.strictEqual(await fn('4r3fsadfasf4', options.permissionsRequired, 'GET'), false);
	});

	it('should return false when operation is invalid', async () => {
		const options: { permissionsRequired: PermissionsPayload } = {
			permissionsRequired: {
				GET: {
					// @ts-expect-error - for testing purposes
					operation: 'invalid',
					permissions: ['view-all', 'view-none'],
				},
			},
		};

		assert.strictEqual(await fn('4r3fsadfasf', options.permissionsRequired, 'GET'), false);
	});

	it('should return true when operation is hasAny and user has at least one listed permission', async (t) => {
		const options: { permissionsRequired: PermissionsPayload } = {
			permissionsRequired: {
				GET: {
					operation: 'hasAny',
					permissions: ['view-all', 'admin'],
				},
			},
		};

		assert.strictEqual(await fn('4r3fsadfasf', options.permissionsRequired, 'GET'), true);
	});
});
