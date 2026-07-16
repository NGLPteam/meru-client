export interface RouteParams {
  params: Promise<Record<string, unknown>>;
}

export interface BasePageParams {
  params: Promise<
    {
      slug?: string;
    } & Record<string, unknown>
  >;
}

export interface OrderingPageParams {
  params: Promise<
    {
      slug?: string;
      ordering?: string;
    } & Record<string, unknown>
  >;
}
