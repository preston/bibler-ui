import { Sluggable } from "./sluggable";

export class Book implements Sluggable{
    id!: string;
    name!: string;
    ordinal!: number;
    slug!: string;
    created_at!: string;
    updated_at!: string;
}