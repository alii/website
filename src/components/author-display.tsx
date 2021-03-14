import {Post} from '../core/blog';
import dayjs from 'dayjs';
import Image from 'next/image';

export const DATE_FORMAT = 'MMMM DD, YYYY';

export function AuthorDisplay({
  author,
  date,
  imageSize = 50,
  showTwitter = false,
}: {
  author: Post['author'];
  date?: Post['date'];
  imageSize?: number;
  showTwitter?: boolean;
}) {
  return (
    <div className="py-5 flex flex-row items-center">
      <div>
        <Image src={author.avatar} alt={`Avatar for ${author.name}`} height={imageSize} width={imageSize} className="mb-10" />
      </div>
      <div className="ml-4">
        <h1 className="font-bold text-2xl inline-flex items-center">
          {author.name}
          {showTwitter && (
            <a href={`https://twitter.com/${author.twitter}`}>
              <svg
                viewBox="328 355 335 276"
                xmlns="http://www.w3.org/2000/svg"
                aria-label={`Twitter link for ${author.name}`}
                height={18}
                width={18}
                className="inline-block ml-2 svg fill-current text-blue-500"
                style={{marginTop: '-3px'}}
              >
                <path d="M 630, 425 A 195, 195 0 0 1 331, 600 A 142, 142 0 0 0 428, 570 A  70,  70 0 0 1 370, 523 A  70,  70 0 0 0 401, 521 A  70,  70 0 0 1 344, 455 A  70,  70 0 0 0 372, 460 A  70,  70 0 0 1 354, 370 A 195, 195 0 0 0 495, 442 A  67,  67 0 0 1 611, 380 A 117, 117 0 0 0 654, 363 A  65,  65 0 0 1 623, 401 A 117, 117 0 0 0 662, 390 A  65,  65 0 0 1 630, 425Z" />
              </svg>
            </a>
          )}
        </h1>
        {date && <p className="text-gray-600">{dayjs(date).format(DATE_FORMAT)}</p>}
      </div>
    </div>
  );
}
