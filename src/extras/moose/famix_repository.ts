import {FamixBaseElement} from "./famix_base_element";
import {Class} from "./model/famix/Class";
import {CustomSourceLanguage} from "./model/famix/custom_source_language";

export class FamixRepository {
  private elements: Set<FamixBaseElement> = new Set<FamixBaseElement>();
  private famixClasses: Set<Class> = new Set<Class>();
  private idCounter: number = 1;
  private lang: CustomSourceLanguage;
  private static repo: FamixRepository;

  constructor() {
    this.lang = new CustomSourceLanguage(this);
    this.lang.setName("ABAP");
  }

  public static getFamixRepo(): FamixRepository {
    if (this.repo === undefined) {
      this.repo = new FamixRepository();
    }
    return this.repo;
  }

  public createOrGetFamixClass(name: string, isInterface?: boolean): Class {
    for (const fc of this.famixClasses) {
      if (fc.getName().toLowerCase() === name.toLowerCase()) {
        return fc;
      }
    }
    const newClass = new Class(this);
    newClass.setName(name.toLowerCase());
    newClass.setIsStub(true);
    if ((isInterface) && (isInterface === true)) {
      newClass.setIsInterface(true);
    }
    return newClass;
  }

  public addElement(element: FamixBaseElement) {
    if (element instanceof Class) {
      this.famixClasses.add(element);
    } else {
      this.elements.add(element);
    }
    element.id = this.idCounter;
    this.idCounter++;
  }

  public getMSE(): string {
    let ret: string = "(";
    for (const element of this.famixClasses) {
      ret = ret + element.getMSE();
    }
    for (const element of this.elements) {
      ret = ret + element.getMSE();
    }
    return ret + ")";
  }
}