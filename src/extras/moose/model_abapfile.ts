import {ABAPFile} from "../../files";
import {Position} from "../../position";
import {FamixRepository} from "./famix_repository";
import {SourcedEntity} from "./model/famix/sourced_entity";
import {IndexedFileAnchor} from "./model/famix/indexed_file_anchor";
import {StructureNode} from "../../abap/nodes";
import {ModelClass} from "./model_class";
import {Package} from "./model/famix/package";
import {Namespace} from "./model/famix/namespace";
import {ModelRepository} from "./model_repository";

export class ModelABAPFile {
  private sumOfCharsAtRow: number[];
  private modelClasses: ModelClass[] = [];
  private readonly file: ABAPFile;

  constructor(famixPackage: Package, famixNamespace: Namespace, file: ABAPFile) {
    this.file = file;
    this.calculateSumOfCharsByRow(file);

    for (const classDef of file.getClassDefinitions()) {
      const modelClass = new ModelClass(famixPackage, famixNamespace, this, classDef);
      this.modelClasses.push(modelClass);
      ModelRepository.getRepo().addModelClass(modelClass);
    }

    for (const interfaceDef of file.getInterfaceDefinitions()) {
      const modelClass = new ModelClass(famixPackage, famixNamespace, this, interfaceDef);
      this.modelClasses.push(modelClass);
      ModelRepository.getRepo().addModelClass(modelClass);
    }
  }

  public analyseAccessAndInvocations() {
    for (const modelClass of this.modelClasses) {
      modelClass.analyseAccessAndInvocations();
    }
  }

  private calculateSumOfCharsByRow(file: ABAPFile) {
    let i = 1;
    let sum = 0;
    this.sumOfCharsAtRow = new Array(file.getRawRows().length);
    for (const row of file.getRawRows()) {
      sum = sum + row.length + 1;
      this.sumOfCharsAtRow[i] = sum;
      i++;
    }
  }

  public convert(pos: Position): number {
    return pos.getRow() === 1 ? pos.getCol() : this.sumOfCharsAtRow[pos.getRow() - 1] + pos.getCol();
  }

  public getFilename() {
    return this.file.getFilename();
  }

  public getABAPFile(): ABAPFile {
    return this.file;
  }

  public getStructure(): StructureNode | undefined {
    return this.file.getStructure();
  }
  public  getModelClass(): ModelClass[] {
    return this.modelClasses;
  }

  public getBeginOfFile(): number {
    return 1;
  }

  public getEndOfFile(): number {
    return this.sumOfCharsAtRow[this.sumOfCharsAtRow.length];
  }

  public static createIndexedFileAnchor(fpc: ModelABAPFile, element: SourcedEntity,
                                        start?: Position, end?: Position) {
    const ifa = new IndexedFileAnchor(FamixRepository.getFamixRepo());
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