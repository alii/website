export const UKTimeFormatter = new Intl.DateTimeFormat(undefined, {
	timeZone: 'Asia/Seoul',
	hour: 'numeric',
	minute: 'numeric',
	hour12: true,
});

export const RelativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
	style: 'long',
});

export const discordId = '213736218754678784';

export const dob = new Date('2002-10-23');
export const age = new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970;
export const hasHadBirthdayThisYear =
	new Date().getMonth() >= dob.getMonth() && new Date().getDate() >= dob.getDate();

export const nextBirthdayYear = new Date().getFullYear() + (hasHadBirthdayThisYear ? 1 : 0);
export const daysUntilBirthday = RelativeTimeFormatter.formatToParts(
	Math.floor(
		(new Date(nextBirthdayYear, dob.getMonth(), dob.getDay() + 1).getTime() - Date.now()) /
			1000 /
			60 /
			60 /
			24,
	),
	'day',
)[1]!.value.toString();