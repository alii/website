import Link from 'next/link';

type Props = {
  title: string;
  src: string;
  slug?: string;
};

export const CoverImage = ({title, src, slug}: Props) => {
  const image = <img src={src} alt={`Cover Image for ${title}`} className="cover object-cover w-full" />;

  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/post/${slug}`}>
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </div>
  );
};
