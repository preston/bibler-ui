import { Book } from "./book";
import { Sluggable } from "./sluggable";

export class Verse implements Sluggable {
    id!: string;
    bible_id!: string;
    book_id!: string;
    book!: Book; // Is this needed?
    highlightedText!: string; // text highlighting feature
    chapter!: number;
    ordinal!: number;
    text!: string;
    slug!: string;
    created_at!: string;
    updated_at!: string;
}