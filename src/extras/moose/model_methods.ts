import {ModelABAPFile} from "./model_abapfile";
import {FamixRepository} from "./famix_repository";
import {MethodDefinition, Scope} from "../../abap/types";
import {Method} from "./model/famix/Method";
import {Class} from "./model/famix/Class";
import {ModelClass} from "./model_class";
import {StructureNode} from "../../abap/nodes";
import * as Structures from "../../abap/structures";
import * as Expressions from "../../abap/expressions";
import {Access} from "./model/famix/access";
import {Attribute} from "./model/famix/attribute";

export class ModelMethods {
  private famixMethod: Method;
  private methodImplStructure: StructureNode | undefined;

  public constructor(repo: FamixRepository, modelFile: ModelABAPFile, modelClass: ModelClass, famixClass: Class,
                     methodDef: MethodDefinition) {
    this.famixMethod = new Method(repo);
    this.famixMethod.setName(methodDef.getName().toLowerCase());


    this.methodImplStructure = this.findMethodImplStructure(modelClass.getClassImplStructure(), methodDef.getName());

    this.famixMethod.addModifiers(Scope[methodDef.getScope()].toLowerCase());
    // static methods CLASS-METHODS?


    this.famixMethod.setParentType(famixClass);
    this.famixMethod.setSignature(methodDef.getName());
    // todo: return type
    const returning = methodDef.getParameters().getReturning();
    if (returning) {
      if (returning.isReferenceTo()){
        const returnigClass = repo.createOrGetFamixClass(returning.getTypeName());
        this.famixMethod.setDeclaredType(returnigClass);
      } else {
        // todo: primitive types and others
        console.log(returning.getName() + ": " + returning.getTypeName());
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

    this.analyseFieldAccess(repo, this.methodImplStructure, modelClass);

    // todo FileAnchor to implementation or definition?
    // def ModelABAPFile.createIndexedFileAnchor(repo, modelFile, this.famixMethod, methodDef.getStart(), methodDef.getEnd());
    if (this.methodImplStructure) {
      ModelABAPFile.createIndexedFileAnchor(repo, modelFile, this.famixMethod, this.methodImplStructure.getFirstToken().getStart(),
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

  private analyseFieldAccess(repo: FamixRepository, structure: StructureNode | undefined, modelClass: ModelClass) {
    const variables: Set<Attribute> = new Set<Attribute>();

    if (structure) {
      for (const fieldStructure of structure.findAllExpressions(Expressions.Field)) {
        const attrName = fieldStructure.getFirstToken().getStr().toLowerCase();
        const famixAttribute = modelClass.getAttribute(attrName);
        if (famixAttribute) {
          variables.add(famixAttribute);
        }
      }

      for (const fieldChainStructure of structure.findAllExpressions(Expressions.FieldChain)) {
        const foundComponentNameStructure = fieldChainStructure.findFirstExpression(Expressions.ComponentName);
        const foundFieldStructure = fieldChainStructure.findFirstExpression(Expressions.Field);
        if ((foundComponentNameStructure) && (foundFieldStructure)) {
          const attrName = foundComponentNameStructure.getFirstToken().getStr();
          const fieldName = foundFieldStructure.getFirstToken().getStr();
          const famixAttribute = modelClass.getAttribute(attrName);
          if ((fieldName.toLowerCase() === "me") && (famixAttribute)) {
            variables.add(famixAttribute);
          }

        }
      }

      for (const targetStructure of structure.findAllExpressions(Expressions.Target)) {
        const foundFieldAllStructure = targetStructure.findFirstExpression(Expressions.FieldAll);
        const foundFieldStructure = targetStructure.findFirstExpression(Expressions.Field);
        if ((foundFieldAllStructure) && (foundFieldStructure)) {
          const attrName = foundFieldAllStructure.getFirstToken().getStr();
          const fieldName = foundFieldStructure.getFirstToken().getStr();
          const famixAttribute = modelClass.getAttribute(attrName);
          if ((fieldName.toLowerCase() === "me") && (famixAttribute)) {
            variables.add(famixAttribute);
          }

        }
      }

      for (const variable of variables) {
        const access = new Access(repo);
        access.setVariable(variable);
        access.setAccessor(this.famixMethod);
      }

    }
  }

}