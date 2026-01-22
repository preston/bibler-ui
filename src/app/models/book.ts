import { Sluggable } from "./sluggable";
import { Bible } from "./bible";

export class Book implements Sluggable{
    id!: number;
    name!: string;
    ordinal!: number;
    slug!: string;
    bible?: Bible;
    testament?: { slug: string; path?: string };
    created_at!: string;
    updated_at!: string;
}