import {useLanyard} from 'use-lanyard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {Song} from './song';

dayjs.extend(relativeTime);

const DISCORD_ID = '268798547439255572';
const PRESENCE_TYPE = 0;

export function Activity() {
  const {data: lanyard} = useLanyard(DISCORD_ID);

  const activity = lanyard?.activities.find((activity) => activity.type === PRESENCE_TYPE);

  if (!lanyard || !activity) return null;

  return (
    <div className="glass p-5">
      <div className="flex items-center">
        {activity.assets && (
          <img
            src={`https://cdn.discordapp.com/app-assets/${BigInt(activity.application_id).toString()}/${
              activity.assets.large_image
            }.png`}
            alt={activity.assets.large_text}
            className="h-24 rounded-md"
          />
        )}

        <p className="ml-4 flex flex-col justify-between leading-snug">
          <span className="text-xl font-bold">{activity.name}</span>
          <span className="opacity-50">{activity.state}</span>
          <span className="opacity-50">{activity.details}</span>
          <span className="opacity-50">{dayjs(activity.timestamps?.start).fromNow(true)} elapsed</span>
        </p>
      </div>

      <Song />
    </div>
  );
}
