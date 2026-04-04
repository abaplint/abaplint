import { AbstractFile } from "./_abstract_file";
export declare class MemoryFile extends AbstractFile {
    private readonly raw;
    constructor(filename: string, raw: string);
    getRaw(): string;
    getRawRows(): string[];
}
