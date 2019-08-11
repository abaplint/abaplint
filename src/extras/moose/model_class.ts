import {ModelABAPFile} from "./model_abapfile";
import {ClassDefinition} from "../../abap/types";
import {Class} from "./model/famix/Class";
import {Package} from "./model/famix/Package";
import {Inheritance} from "./model/famix/Inheritance";
import {FamixRepository} from "./famix_repository";
import {Attribute} from "./model/famix/Attribute";

export class ModelClass {
  private classDef: ClassDefinition;
  private readonly famixClass: Class;

  public constructor(repo: FamixRepository, modelFile: ModelABAPFile, classDef: ClassDefinition) {
    this.classDef = classDef;
    this.famixClass = repo.createClassElement(classDef.getName());
    this.famixClass.setName(classDef.getName());
    this.analyseClassModifier(this.famixClass, this.classDef);
    this.analyseClassAttributes(repo, this.famixClass, this.classDef);


    this.famixClass.setContainer(repo.getGloabalNamespace());
    ModelABAPFile.createIndexedFileAnchor(repo, modelFile, this.famixClass);
    this.analyseParentPackage(repo, this.famixClass, modelFile);
    this.analyseSuperClass(repo, classDef, this.famixClass);
  }

  public getName(): string {
    return this.classDef.getName();
  }

  public getFamixClass(): Class {
    return this.famixClass;
  }

  public getClassDefinition(): ClassDefinition {
    return this.classDef;
  }

  private analyseClassAttributes(repo: FamixRepository, famixClass: Class, classDef: ClassDefinition ) {
    const attributes = classDef.getAttributes();
    if (attributes) {
      for (const instanceAttr of attributes.getInstance()) {
        const famixAttribute = new Attribute(repo);
        famixAttribute.setName(instanceAttr.getName());
        famixAttribute.setHasClassScope(true);
        famixAttribute.setParentType(famixClass);
      }
    }
  }

  private analyseClassModifier(famixClass: Class, classDef: ClassDefinition ) {
    if (classDef.isGlobal()) {
      famixClass.addModifiers("public");
    }

    if (classDef.isFinal()) {
      famixClass.addModifiers("final");
    }
  }

  private analyseParentPackage(repo: FamixRepository, famixClass: Class, modelABAPFile: ModelABAPFile) {
    let modelPackage: Package;
    if (modelABAPFile.getFilename().lastIndexOf("/") > 0) {
      modelPackage = repo.createPackageElement(modelABAPFile.getFilename().substring(0, modelABAPFile.getFilename().lastIndexOf("/")));
    } else {
      modelPackage = repo.createPackageElement("");
    }
    famixClass.setParentPackage(modelPackage);
  }



  private analyseSuperClass(repo: FamixRepository, classDef: ClassDefinition, famixClass: Class) {
    const superClass = classDef.getSuperClass();
    if (superClass !== undefined) {
      const modelSuperClass = repo.createClassElement(superClass);
      const modelInheritance = new Inheritance(repo);
      modelInheritance.setSubclass(famixClass);
      modelInheritance.setSuperclass(modelSuperClass);
    }
  }

}