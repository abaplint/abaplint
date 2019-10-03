import {ModelABAPFile} from "./model_abapfile";
import {FamixRepository} from "./famix_repository";
import {MethodDefinition, Visibility} from "../../abap/types";
import {Method} from "./model/famix/Method";
import {ModelClass} from "./model_class";
import * as Structures from "../../abap/structures";
import * as Expressions from "../../abap/expressions";
import {StructureNode} from "../../abap/nodes";
import {Parameter} from "./model/famix/parameter";
import {ModelFieldChain} from "./model_chain_field";
import {ModelTargetChain} from "./model_chain_target";
import {ModelMethodChain} from "./model_chain_method";

export class ModelMethods {
  private readonly famixMethod: Method;
  private readonly methodImplStructure: StructureNode | undefined;
  private modelClass: ModelClass;
  public methodDef: MethodDefinition;
  // private readonly modelFile: ModelABAPFile;

  public constructor(modelFile: ModelABAPFile, modelClass: ModelClass,
                     methodDef: MethodDefinition) {
    // this.modelFile = modelFile;
    this.methodDef = methodDef;
    this.modelClass = modelClass;
    this.famixMethod = new Method(FamixRepository.getFamixRepo());
    this.famixMethod.setName(methodDef.getName().toLowerCase());

    this.methodImplStructure = this.findMethodImplStructure(modelClass.getClassImplStructure(), methodDef.getName());

    this.famixMethod.addModifiers(Visibility[methodDef.getVisibility()].toLowerCase());
    // todo: static methods CLASS-METHODS?


    this.famixMethod.setParentType(modelClass.getFamixClass());
    this.famixMethod.setSignature(methodDef.getName().toLowerCase());

    // importing Parameter
    for (const parameter of methodDef.getParameters().getImporting()) {
      const famixParameter = new Parameter(FamixRepository.getFamixRepo());
      famixParameter.setName(parameter.getName().toLowerCase());
      famixParameter.setParentBehaviouralEntity(this.famixMethod);
      if (parameter.isReferenceTo()) {
        famixParameter.setDeclaredType(FamixRepository.getFamixRepo().createOrGetFamixClass(parameter.getTypeName()));
      }
    }

    // todo: returning a complex data structure
    const returning = methodDef.getParameters().getReturning();
    if (returning) {
      if (returning.isReferenceTo()) {
        const returnigClass = FamixRepository.getFamixRepo().createOrGetFamixClass(returning.getTypeName());
        this.famixMethod.setDeclaredType(returnigClass);
      } else {
        // todo: primitive types and others
        console.log("ModelMethod::consturctor - returning type not implented: name=" + returning.getName() +
                        " type=" + returning.getTypeName());
      }

    }

    // tag indicating a setter, getter, constant, constructor, or abstract method
    if (this.famixMethod.getName() === "constructor") {
      this.famixMethod.setKind("constructor");
    } else if (this.famixMethod.getName().startsWith("get_")) {
      this.famixMethod.setKind("getter");
    } else if (this.famixMethod.getName().startsWith("set_")) {
      this.famixMethod.setKind("setter");
    }

    // todo FileAnchor to implementation or definition?
    // def ModelABAPFile.createIndexedFileAnchor(repo, modelFile, this.famixMethod, methodDef.getStart(), methodDef.getEnd());
    if (this.methodImplStructure) {
      ModelABAPFile.createIndexedFileAnchor(modelFile, this.famixMethod, this.methodImplStructure.getFirstToken().getStart(),
                                            this.methodImplStructure.getLastToken().getEnd());
    }
  }

  private findMethodImplStructure(classImplStructure: StructureNode | undefined, searchMethodname: string): StructureNode | undefined {
    if (classImplStructure) {
      for (const methodImplStructure of classImplStructure.findAllStructures(Structures.Method)) {
        const foundMethodname = methodImplStructure.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();
        if (foundMethodname.toLowerCase() === searchMethodname.toLowerCase()) {
          return methodImplStructure;
        }
      }
    }
    return undefined;
  }

  public analyseFieldAccessAndInvocations() {
    const logging = false;
    if (logging) {
      console.debug("---------------" + this.modelClass.getFamixClass().getName() + ": " + this.famixMethod.getName() + "----------------");
    }

    if (this.methodImplStructure) {
      for (const c of this.methodImplStructure.findAllExpressions(Expressions.FieldChain)) {
        const chain = new ModelFieldChain(c, this.modelClass, this, logging);
        chain.toString();
      }

      for (const t of this.methodImplStructure.findAllExpressions(Expressions.Target)) {
        const chain = new ModelTargetChain(t, this.modelClass, this, logging);
        chain.toString();
      }

      for (const m of this.methodImplStructure.findAllExpressions(Expressions.MethodCallChain)) {
        const chain = new ModelMethodChain(m, this.modelClass, this, logging);
        chain.toString();
      }


    }
  }

  public getFamixMethod(): Method {
    return this.famixMethod;
  }

}