import {ABAPFile} from "../../files";
import {Position} from "../../position";
import {FamixRepository} from "./famix_repository";
import {SourcedEntity} from "./model/famix/sourced_entity";
import {IndexedFileAnchor} from "./model/famix/indexed_file_anchor";

export class ModelABAPFile {
  private readonly len: number[];
  private readonly file: ABAPFile;

  constructor(file: ABAPFile) {
    this.file = file;
    let i = 1;
    let sum = 0;
    this.len = new Array(file.getRawRows().length);
    for (const row of file.getRawRows()) {
      sum = sum + row.length + 1;
      this.len[i] = sum;
      i++;
    }

  }

  public convert(pos: Position): number {
    return pos.getRow() === 1 ? pos.getCol() : this.len[pos.getRow() - 1] + pos.getCol();
  }

  public getFilename() {
    return this.file.getFilename().substr(43); // todo: substr entfernen, nur für Dev
  }

  public getABAPFile(): ABAPFile {
    return this.file;
  }

  public getBeginOfFile(): number {
    return 1;
  }

  public getEndOfFile(): number {
    return this.len[this.len.length];
  }

  public static createIndexedFileAnchor(repo: FamixRepository, fpc: ModelABAPFile, element: SourcedEntity,
                                        start?: Position, end?: Position) {
    const ifa = new IndexedFileAnchor(repo);
    ifa.setFileName(fpc.getFilename());
    ifa.setElement(element);

    if (start) {
      ifa.setStartPos(fpc.convert(start));
    } else {
      ifa.setStartPos(fpc.getBeginOfFile());
    }

    if (end) {
      ifa.setEndPos(fpc.convert(end));
    } else {
      ifa.setStartPos(fpc.getEndOfFile());
    }
  }
}