import {ModelABAPFile} from "./model_abapfile";
import {ClassAttribute, ClassConstant, ClassDefinition, InterfaceDefinition, Visibility} from "../../abap/types";
import {Class} from "./model/famix/Class";
import {Package} from "./model/famix/Package";
import {Inheritance} from "./model/famix/Inheritance";
import {FamixRepository} from "./famix_repository";
import {Attribute} from "./model/famix/Attribute";
import {ModelMethods} from "./model_methods";
import {StructureNode} from "../../abap/nodes";
import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Namespace} from "./model/famix/namespace";
import {Method} from "./model/famix/method";

export class ModelClass {
  private readonly famixClass: Class;
  private modelMethods: ModelMethods[] = [];
  private classImplStructure: StructureNode | undefined;

  public constructor(famixPackage: Package, famixNamespace: Namespace, modelFile: ModelABAPFile,
                     classDef: ClassDefinition | InterfaceDefinition) {
    this.famixClass = FamixRepository.getFamixRepo().createOrGetFamixClass(classDef.getName());
    this.famixClass.setIsStub(false);
    this.famixClass.setContainer(famixNamespace);
    this.famixClass.setParentPackage(famixPackage);
    ModelABAPFile.createIndexedFileAnchor(modelFile, this.famixClass);
    this.analyseClassAttributes(modelFile, this.famixClass, classDef);

    if (classDef instanceof InterfaceDefinition) {
      this.famixClass.setIsInterface(true);
      for (const methodDef of classDef.getMethodDefinitions()) {
        this.modelMethods.push(new ModelMethods(modelFile, this, methodDef));
      }

    } else if (classDef instanceof ClassDefinition) {
      this.classImplStructure = this.findCallImplStructure(modelFile.getABAPFile().getStructure(), classDef.getName());
      this.analyseSuperClass(this.famixClass, classDef);
      this.analyseInterfaceImplementing(this.famixClass, classDef);
      this.analyseClassModifier(this.famixClass, classDef);

      if (classDef.isForTesting()) {
        this.famixClass.setIsTestCase(true);
      }

      const methodDefinitions = classDef.getMethodDefinitions();
      if (methodDefinitions) {
        for (const methodDef of methodDefinitions.getAll()) {
          this.modelMethods.push(new ModelMethods(modelFile, this, methodDef));
        }
      }
    }
  }

  public analyseAccessAndInvocations() {
    for (const modelMethod of this.modelMethods) {
      modelMethod.analyseFieldAccessAndInvocations();
    }
  }

  public getClassImplStructure(): StructureNode | undefined {
    return this.classImplStructure;
  }

  public getFamixClass(): Class {
    return this.famixClass;
  }

  public getAttribute(name: string): Attribute | undefined {
    for (const attr of this.famixClass.getAttributes()) {
      if (attr.getName().toLowerCase() === name.toLowerCase()) {
        return attr;
      }
    }
    return undefined;
  }

  public getMethod(name: string): Method | undefined {
    for (const method of this.famixClass.getMethods()) {
      if (method.getName().toLocaleLowerCase() === name.toLowerCase()) {
        return method;
      }
    }
    return undefined;
  }

  private findCallImplStructure(fileStructure: StructureNode | undefined, searchClassname: string): StructureNode | undefined {
    if (fileStructure) {
      for (const classImplStructure of fileStructure.findAllStructures(Structures.ClassImplementation)) {
        const foundClassname = classImplStructure.findFirstStatement(Statements.ClassImplementation)!.
        findFirstExpression(Expressions.ClassName)!.getFirstToken().getStr();
        if (foundClassname.toLowerCase() === searchClassname) {
          return classImplStructure;
        }
      }
    }
    return undefined;
  }

  private analyseClassAttributes(modelFile: ModelABAPFile, famixClass: Class,
                                 classDef: ClassDefinition | InterfaceDefinition ) {
    const attributes = classDef.getAttributes();
    if (attributes) {
      for (const instanceAttr of attributes.getInstance()) {
        const famixAttr = this.createAttributeModel(modelFile, famixClass, instanceAttr);
        const type = instanceAttr.getType();
        if (type) {
          const famixTypeClass = FamixRepository.getFamixRepo().createOrGetFamixClass(type);
          famixAttr.setDeclaredType(famixTypeClass);
        }
      }
      for (const staticAttr of attributes.getStatic()) {
        const famixAttr = this.createAttributeModel(modelFile, famixClass, staticAttr);
        famixAttr.addModifiers("static");
        famixAttr.setHasClassScope(true);
      }
      for (const constAttr of attributes.getConstants()) {
        const famixAttr = this.createAttributeModel(modelFile, famixClass, constAttr);
        famixAttr.setHasClassScope(true);
      }
    }
  }

  private createAttributeModel(modelFile: ModelABAPFile, famixClass: Class, attr: ClassAttribute | ClassConstant) {
    const famixAttribute = new Attribute(FamixRepository.getFamixRepo());
    famixAttribute.setName(attr.getName().toLowerCase());
    famixAttribute.setParentType(famixClass);
    famixAttribute.addModifiers(Visibility[attr.getVisibility()].toLowerCase());
    ModelABAPFile.createIndexedFileAnchor(modelFile, famixAttribute, attr.getStart(), attr.getEnd());
    return famixAttribute;
  }

  private analyseClassModifier(famixClass: Class, classDef: ClassDefinition ) {
    if (classDef.isGlobal()) {
      famixClass.addModifiers("public");
    }

    if (classDef.isFinal()) {
      famixClass.addModifiers("final");
    }
  }

  private analyseSuperClass(famixClass: Class, classDef: ClassDefinition) {
    this.createInheritance(famixClass, classDef.getSuperClass());
  }

  private analyseInterfaceImplementing(famixClass: Class, classDef: ClassDefinition) {
    for (const interfaceName of classDef.getImplementing()) {
      this.createInheritance(famixClass, interfaceName, true);
    }
  }

  private createInheritance(famixClass: Class, superClass: string | undefined, isInterface?: boolean) {
    if (superClass !== undefined) {
      const modelSuperClass = FamixRepository.getFamixRepo().createOrGetFamixClass(superClass, isInterface);
      const modelInheritance = new Inheritance(FamixRepository.getFamixRepo());
      modelInheritance.setSubclass(famixClass);
      modelInheritance.setSuperclass(modelSuperClass);
    }
  }

}