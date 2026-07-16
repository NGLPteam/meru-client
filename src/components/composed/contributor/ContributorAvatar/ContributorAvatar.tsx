import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { Avatar } from "@/components/atomic";

const ContributorAvatar = ({ data }: Props) => {
  const imgData = useFragment(fragment, data);
  const image = imgData?.small?.webp;

  return <Avatar size="lg" url={image?.url} alt={image?.alt} loading="lazy" />;
};

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

export default ContributorAvatar;

const fragment = graphql(`
  fragment ContributorAvatarFragment on ImageAttachment {
    small {
      webp {
        alt
        url
      }
    }
  }
`);
