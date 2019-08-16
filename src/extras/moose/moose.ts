import {Registry} from "../../registry";
import {FamixRepository} from "./famix_repository";
import {ModelABAPFile} from "./model_abapfile";
import {ModelDirectory} from "./model_directory";

export class Moose {
  private reg: Registry;
  private readonly repo: FamixRepository;
  private directories: ModelDirectory[] = [];

  public constructor(reg: Registry) {
    this.reg = reg;
    this.repo = new FamixRepository();
    this.analyseABAPFiles();
    console.log("done.");
  }

  private analyseABAPFiles() {
    for (const file of this.reg.getABAPFiles()) {
      const dir = this.getOrCreateModelDirectory(ModelDirectory.getDirectoryPath(file.getFilename()));
      const modelFile = new ModelABAPFile(this.repo, dir.getFamixPackage(), dir.getFamixNamespace(), file);
      modelFile.getEndOfFile();
    }
    this.buildAssociationForNamespacesAndPackages();
  }

  private getOrCreateModelDirectory(path: string): ModelDirectory {
    for (const dir of this.directories) {
      if (dir.getPath() === path) {
        return dir;
      }
    }
    const newDir = new ModelDirectory(this.repo, path);
    this.directories.push(newDir);
    if (newDir.hasParentDirectories()) {
      newDir.setParent(this.getOrCreateModelDirectory(ModelDirectory.getDirectoryPath(newDir.getPath())));
    }
    return newDir;
  }

  private buildAssociationForNamespacesAndPackages() {
    this.getRootDirectory().findSourceRootDirectory().buildAssociations(true);
  }

  private getRootDirectory(): ModelDirectory {
    for (const dir of this.directories) {
      if (dir.getParent() === undefined) {
        return dir;
      }
    }
    throw new Error("no root directory found.");
  }

  public getMSE(): string {
    return this.repo.getMSE();
  }

}