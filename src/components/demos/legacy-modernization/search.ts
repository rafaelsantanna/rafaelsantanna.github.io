// Accent-insensitive search over the fictional catalog. Pure.
import type { Locale } from '@/data/types';
import { categories, customers, products, regions, units, type Customer, type Product } from './catalog.ts';
import { fold } from './format.ts';

export interface SearchResult<T> {
  items: T[];
  terms: string[];
}

function searchTerms(query: string): string[] {
  return fold(query).split(/\s+/).filter(Boolean);
}

function rank<T>(list: T[], terms: string[], haystack: (item: T) => string, label: (item: T) => string): T[] {
  if (!terms.length) return [...list].sort((a, b) => label(a).localeCompare(label(b)));
  return list
    .map((item) => ({ item, text: haystack(item), name: fold(label(item)) }))
    .filter(({ text }) => terms.every((term) => text.includes(term)))
    .sort((a, b) => {
      const aStarts = a.name.startsWith(terms[0]) ? 0 : 1;
      const bStarts = b.name.startsWith(terms[0]) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name);
    })
    .map(({ item }) => item);
}

export function searchProducts(query: string, locale: Locale): SearchResult<Product> {
  const terms = searchTerms(query);
  const items = rank(
    products,
    terms,
    (product) => fold(`${product.name[locale]} ${product.sku} ${product.sku.replace('-', '')} ${categories[product.category].name[locale]} ${units[product.unit].name[locale]}`),
    (product) => product.name[locale],
  );
  return { items, terms };
}

export function searchCustomers(query: string, locale: Locale): SearchResult<Customer> {
  const terms = searchTerms(query);
  const items = rank(
    customers,
    terms,
    (customer) => fold(`${customer.name} ${customer.id} ${customer.city} ${customer.state} ${regions[customer.region][locale]}`),
    (customer) => customer.name,
  );
  return { items, terms };
}
