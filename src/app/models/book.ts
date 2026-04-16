import { Uuidable } from "./sluggable";
import { Bible } from "./bible";

export class Book implements Uuidable{
    id!: number;
    uuid!: string;
    name!: string;
    ordinal!: number;
    bible?: Bible;
    testament?: { uuid: string; path?: string };
    created_at!: string;
    updated_at!: string;
}