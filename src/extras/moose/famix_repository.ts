import {FamixBaseElement} from "./famix_base_element";
import {Class} from "./model/famix/Class";
import {Package} from "./model/famix/Package";
import {Namespace} from "./model/famix/Namespace";
import {CustomSourceLanguage} from "./model/famix/custom_source_language";

export class FamixRepository {
  private elements: Set<FamixBaseElement> = new Set<FamixBaseElement>();
  private classes: Set<Class> = new Set<Class>();
  private readonly rootPackage: Package;
  private idCounter: number = 1;
  private readonly globalNamespace: Namespace;
  private lang: CustomSourceLanguage;

  constructor() {

    this.lang = new CustomSourceLanguage(this);
    this.lang.setName("ABAP");

    this.rootPackage =  new Package(this);
    this.rootPackage.setName("__ROOT__");

    this.globalNamespace = new Namespace(this);
    this.globalNamespace.setName("GLOBAL");

  }

  public getGloabalNamespace(): Namespace {
    return this.globalNamespace;
  }


  public createClassElement(name: string): Class {
    for (const cl of this.classes) {
      if (cl.getName() === name) {
        return cl;
      }
    }
    const newClass = new Class(this);
    newClass.setName(name);
    return newClass;
  }


  public createPackageElement(path: string, root?: Package): Package {

    if (!root) {
      root = this.rootPackage;
    }

    if (path === "") {
      return root;
    }

    const pathElements: string[] = path.split("/");
    let modelPackage: Package | undefined;

    for (const element of root.getChildNamedEntities()) {
      if (element.getName() === pathElements[0]) {
        modelPackage = element as Package;
      }
    }

    if (modelPackage === undefined) {
      modelPackage = new Package(this);
      modelPackage.setName(pathElements[0]);
      modelPackage.setParentPackage(root);
    }

    if (pathElements.length > 1) {
      return this.createPackageElement(path.substring(pathElements[0].length + 1), modelPackage);
    } else {
      return modelPackage;
    }
  }

  public addElement(element: FamixBaseElement) {
    if (element instanceof Class) {
      this.classes.add(element);
    } else {
      this.elements.add(element);
    }
    element.id = this.idCounter;
    this.idCounter++;
  }

  public getMSE(): string {
    let ret: string = "(";
    for (const element of this.classes) {
      ret = ret + element.getMSE();
    }
    for (const element of this.elements) {
      ret = ret + element.getMSE();
    }
    return ret + ")";
  }
}