"use server";

import { getCollection } from "./index";
import { parseFilters, parseSort } from "./collection-params";
import type { Connection, Product } from "./types";

const PAGE_SIZE = 12;

/** Next page of a collection for "Load more"; same sort and filters as the URL. */
export async function loadCollectionPage(handle: string, sort: string, filters: string[], after: string): Promise<Connection<Product> | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(handle) || after.length > 500) return null;
  const page = await getCollection(handle, { sort: parseSort(sort), filters: parseFilters(filters), first: PAGE_SIZE, after });
  return page?.products ?? null;
}
