import { useParams } from "@/lib/routing/hooks";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";

export default function useRouteSlug(): string | undefined | null {
  const { slug } = useParams();
  return routeQueryArrayToString(slug);
}
