import { IFile } from "./_ifile";
export declare abstract class AbstractFile implements IFile {
    private readonly filename;
    constructor(filename: string);
    getFilename(): string;
    private baseName;
    getObjectType(): string | undefined;
    getObjectName(): string;
    abstract getRaw(): string;
    abstract getRawRows(): string[];
}
