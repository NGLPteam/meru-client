import UnauthorizedMessage from "./_components/UnauthorizedMessage";

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return <UnauthorizedMessage reason={reason} />;
}
