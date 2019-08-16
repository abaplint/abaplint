import {Package} from "./model/famix/package";
import {FamixRepository} from "./famix_repository";
import {Namespace} from "./model/famix/namespace";

export class ModelDirectory {

  private readonly path: string;
  private parent: ModelDirectory;
  private children: ModelDirectory[] = [];
  private package: Package;
  private readonly repo: FamixRepository;
  private namespace: Namespace;

  public constructor(repo: FamixRepository, path: string) {
    this.path = path;
    this.repo = repo;
  }

  public setParent(parent: ModelDirectory) {
    this.parent = parent;
    parent.addChild(this);
  }

  public getParent(): ModelDirectory {
    return this.parent;
  }

  private addChild(child: ModelDirectory) {
    this.children.push(child);
  }

  public buildAssociations(isRoot: boolean) {
    if (!this.namespace) {
      this.createNamespace();
    }
    if (!this.package) {
      this.createPackage();
    }
    if (isRoot === false) {
      this.namespace.setParentScope(this.parent.getFamixNamespace());
      this.namespace.setParentPackage(this.parent.getFamixPackage());
    }
    for (const child of this.children) {
      child.buildAssociations(false);
    }
  }

  public getPath(): string {
    return this.path;
  }

  public getDirectoryName(): string {
    const name = this.path.substring(this.path.lastIndexOf("/") + 1);
    if (name === ".") {
      return "root";
    }
    return name;
  }

  public hasParentDirectories(): boolean {
    return this.path.lastIndexOf("/") > 0;
  }

  public static getDirectoryPath(path: string): string {
    return path.substring(0, path.lastIndexOf("/"));
  }

  public getFamixPackage() {
    if (this.package) {
      return this.package;
    }
    return this.createPackage();
  }

  private createPackage() {
    this.package = new Package(this.repo);
    this.package.setName(this.getDirectoryName());
    return this.package;
  }

  public getFamixNamespace(): Namespace {
    if (this.namespace) {
      return this.namespace;
    }
    return this.createNamespace();
  }

  private createNamespace() {
    this.namespace = new Namespace(this.repo);
    this.namespace.setName(this.getDirectoryName());
    return this.namespace;
  }

  public findSourceRootDirectory(): ModelDirectory {
    if (this.children.length > 1 || this.namespace !== undefined || this.package !== undefined) {
      return this;
    }
    if (this.children.length === 1) {
      return this.children[0].findSourceRootDirectory();
    } else {
      throw new Error("root source directory not found.");
    }
  }
}
