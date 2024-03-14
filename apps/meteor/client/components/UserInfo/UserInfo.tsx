import type { IUser, Serialized } from '@rocket.chat/core-typings';
import { Box, Margins, Tag } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement, ReactNode } from 'react';
import React, { memo } from 'react';

import { useTimeAgo } from '../../hooks/useTimeAgo';
import { useUserCustomFields } from '../../hooks/useUserCustomFields';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';
import { ContextualbarScrollableContent } from '../Contextualbar';
import InfoPanel from '../InfoPanel';
import InfoPanelAvatar from '../InfoPanel/InfoPanelAvatar';
import InfoPanelField from '../InfoPanel/InfoPanelField';
import InfoPanelLabel from '../InfoPanel/InfoPanelLabel';
import InfoPanelSection from '../InfoPanel/InfoPanelSection';
import InfoPanelText from '../InfoPanel/InfoPanelText';
import InfoPanelTitle from '../InfoPanel/InfoPanelTitle';
import MarkdownText from '../MarkdownText';
import UTCClock from '../UTCClock';
import { UserCardRoles } from '../UserCard';
import UserInfoAvatar from './UserInfoAvatar';

type UserInfoDataProps = Serialized<
	Pick<
		IUser,
		| 'name'
		| 'username'
		| 'nickname'
		| 'bio'
		| 'lastLogin'
		| 'avatarETag'
		| 'utcOffset'
		| 'phone'
		| 'createdAt'
		| 'statusText'
		| 'canViewAllInfo'
		| 'customFields'
	>
>;

type UserInfoProps = UserInfoDataProps & {
	status: ReactNode;
	email?: string;
	verified?: boolean;
	actions: ReactElement;
	roles: ReactElement[];
	reason?: string;
};

const UserInfo = ({
	username,
	name,
	lastLogin,
	nickname,
	bio,
	avatarETag,
	roles,
	utcOffset,
	phone,
	email,
	verified,
	createdAt,
	status,
	statusText,
	customFields,
	canViewAllInfo,
	actions,
	reason,
	...props
}: UserInfoProps): ReactElement => {
	const t = useTranslation();
	const timeAgo = useTimeAgo();
	const userDisplayName = useUserDisplayName({ name, username });
	const userCustomFields = useUserCustomFields(customFields);

	return (
		<ContextualbarScrollableContent p={24} {...props}>
			<InfoPanel>
				{username && (
					<InfoPanelAvatar>
						<UserInfoAvatar username={username} etag={avatarETag} />
					</InfoPanelAvatar>
				)}

				{actions && <InfoPanelSection>{actions}</InfoPanelSection>}

				<InfoPanelSection>
					{userDisplayName && <InfoPanelTitle icon={status} title={userDisplayName} />}

					{statusText && (
						<InfoPanelText>
							<MarkdownText content={statusText} parseEmoji={true} variant='inline' />
						</InfoPanelText>
					)}
				</InfoPanelSection>

				<InfoPanelSection>
					{reason && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Reason_for_joining')}</InfoPanelLabel>
							<InfoPanelText>{reason}</InfoPanelText>
						</InfoPanelField>
					)}

					{nickname && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Nickname')}</InfoPanelLabel>
							<InfoPanelText>{nickname}</InfoPanelText>
						</InfoPanelField>
					)}

					{roles.length !== 0 && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Roles')}</InfoPanelLabel>
							<UserCardRoles>{roles}</UserCardRoles>
						</InfoPanelField>
					)}

					{username && username !== name && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Username')}</InfoPanelLabel>
							<InfoPanelText data-qa='UserInfoUserName'>{username}</InfoPanelText>
						</InfoPanelField>
					)}

					{Number.isInteger(utcOffset) && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Local_Time')}</InfoPanelLabel>
							<InfoPanelText>{utcOffset && <UTCClock utcOffset={utcOffset} />}</InfoPanelText>
						</InfoPanelField>
					)}

					{roles.length !== 0 && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Roles')}</InfoPanel.Label>
							<UserCardRoles>{roles}</UserCardRoles>
						</InfoPanel.Field>
					)}

					{username && username !== name && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Username')}</InfoPanel.Label>
							<InfoPanel.Text data-qa='UserInfoUserName'>{username}</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{Number.isInteger(utcOffset) && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Local_Time')}</InfoPanel.Label>
							<InfoPanel.Text>{utcOffset && <UTCClock utcOffset={utcOffset} />}</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{bio && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Bio')}</InfoPanelLabel>
							<InfoPanelText withTruncatedText={false}>
								<MarkdownText variant='inline' content={bio} />
							</InfoPanelText>
						</InfoPanelField>
					)}

					{Number.isInteger(utcOffset) && canViewAllInfo && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Last_login')}</InfoPanelLabel>
							<InfoPanelText>{lastLogin ? timeAgo(lastLogin) : t('Never')}</InfoPanelText>
						</InfoPanelField>
					)}

					{Number.isInteger(utcOffset) && canViewAllInfo && (
						<InfoPanel.Field>
							<InfoPanel.Label>{t('Last_login')}</InfoPanel.Label>
							<InfoPanel.Text>{lastLogin ? timeAgo(lastLogin) : t('Never')}</InfoPanel.Text>
						</InfoPanel.Field>
					)}

					{phone && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Phone')}</InfoPanelLabel>
							<InfoPanelText display='flex' flexDirection='row' alignItems='center'>
								<Box is='a' withTruncatedText href={`tel:${phone}`}>
									{phone}
								</Box>
							</InfoPanelText>
						</InfoPanelField>
					)}

					{email && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Email')}</InfoPanelLabel>
							<InfoPanelText display='flex' flexDirection='row' alignItems='center'>
								<Box is='a' withTruncatedText href={`mailto:${email}`}>
									{email}
								</Box>
								<Margins inline={4}>
									<Tag>{verified ? t('Verified') : t('Not_verified')}</Tag>
								</Margins>
							</InfoPanelText>
						</InfoPanelField>
					)}

					{userCustomFields?.map(
						(customField) =>
							customField?.value && (
								<InfoPanelField key={customField.value}>
									<InfoPanelLabel>{t(customField.label as TranslationKey)}</InfoPanelLabel>
									<InfoPanelText>
										<MarkdownText content={customField.value} variant='inline' />
									</InfoPanelText>
								</InfoPanelField>
							),
					)}

					{createdAt && (
						<InfoPanelField>
							<InfoPanelLabel>{t('Created_at')}</InfoPanelLabel>
							<InfoPanelText>{timeAgo(createdAt)}</InfoPanelText>
						</InfoPanelField>
					)}
				</InfoPanelSection>
			</InfoPanel>
		</ContextualbarScrollableContent>
	);
};

export default memo(UserInfo);
