import queryApi from "@/lib/api/queryApi";
import { query } from "./getStaticGlobalContextData.query";

export default async function getStaticGlobalContextData() {
  const { data: globalStaticData } = await queryApi(query, {});

  return globalStaticData;
}

export { query };
