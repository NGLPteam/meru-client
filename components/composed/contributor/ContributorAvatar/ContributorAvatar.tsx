import { graphql, useFragment } from "react-relay";
import { Avatar } from "@/components/atomic";
import { ContributorAvatarFragment$key } from "@/relay/ContributorAvatarFragment.graphql";

const ContributorAvatar = ({ data }: Props) => {
  const imgData = useFragment(fragment, data);
  const image = imgData?.small?.webp;

  return <Avatar size="lg" url={image?.url} alt={image?.alt} loading="lazy" />;
};

interface Props {
  data?: ContributorAvatarFragment$key | null;
}

export default ContributorAvatar;

const fragment = graphql`
  fragment ContributorAvatarFragment on ImageAttachment {
    small {
      webp {
        alt
        url
      }
    }
  }
`;
