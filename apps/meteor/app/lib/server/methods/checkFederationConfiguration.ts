import { Federation, FederationEE } from '@rocket.chat/core-services';
import { License } from '@rocket.chat/license';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import { Authorization } from '@rocket.chat/core-services';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		checkFederationConfiguration(): {};
	}
}

Meteor.methods<ServerMethods>({
	async checkFederationConfiguration() {
		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'checkFederationConfiguration',
			});
		}

		if (!(await Authorization.hasPermission(uid, 'view-privileged-setting'))) {
			throw new Meteor.Error('error-not-allowed', 'Action not allowed', {
				method: 'checkFederationConfiguration',
			});
		}

		// NOTE(Debdut): reason for not returning early
		// is making sure we are communicating the whole error immediately.
		// This is especially helpful for support cases.

		const errors: string[] = [];

		const successes: string[] = [];

		const service = License.hasValidLicense() ? FederationEE : Federation;

		const status = await service.configurationStatus();

		if (status.externalReachability.ok) {
			successes.push('homeserver configuration looks good');
		} else {
			let err = 'external reachability could not be verified';

			const { error } = status.externalReachability;
			if (error) {
				err += `error: ${error}`;
			}

			errors.push(err);
		}

		const {
			roundTrip: { durationMs: duration },
		} = status.appservice;

		if (status.appservice.ok) {
			successes.push(`appservice configuration looks good, total round trip time to homeserver ${duration}ms`);
		} else {
			errors.push(`failed to verify appservice configuration: ${status.appservice.error}`);
		}

		if (errors.length) {
			void service.markConfigurationInvalid();

			if (successes.length) {
				const message = ['Configuration could only be partially verified'].concat(successes).concat(errors).join(', ');

				throw new Meteor.Error('error-invalid-configuration', message, { method: 'checkFederationConfiguration' });
			}

			throw new Meteor.Error('error-invalid-configuration', ['Invalid configuration'].concat(errors).join(', '), {
				method: 'checkFederationConfiguration',
			});
		}

		void service.markConfigurationValid();

		return {
			message: ['All configuration looks good'].concat(successes).join(', '),
		};
	},
});