import {Registry} from "../../registry";
import {FamixRepository} from "./famix_repository";
import {ModelABAPFile} from "./model_abapfile";
import {ModelDirectory} from "./model_directory";

export class Moose {
  private reg: Registry;
  private directories: ModelDirectory[] = [];
  private files: ModelABAPFile[] = [];

  public constructor(reg: Registry) {
    this.reg = reg;
    this.analyseABAPFiles();
  }

  private analyseABAPFiles() {
    for (const file of this.reg.getABAPFiles()) {
      const dir = this.getOrCreateModelDirectory(ModelDirectory.getDirectoryPath(file.getFilename()));
      this.files.push(new ModelABAPFile(dir.getFamixPackage(), dir.getFamixNamespace(), file));
    }
    this.buildAssociationForNamespacesAndPackages();
    for (const file of this.files) {
      file.analyseAccessAndInvocations();
    }
  }

  private getOrCreateModelDirectory(path: string): ModelDirectory {
    for (const dir of this.directories) {
      if (dir.getPath() === path) {
        return dir;
      }
    }
    const newDir = new ModelDirectory(FamixRepository.getFamixRepo(), path);
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
    return FamixRepository.getFamixRepo().getMSE();
  }

}