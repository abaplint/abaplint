import {ModelABAPFile} from "./model_abapfile";
import {FamixRepository} from "./famix_repository";
import {MethodDefinition, Scope} from "../../abap/types";
import {Method} from "./model/famix/Method";
import {ModelClass} from "./model_class";
import * as Structures from "../../abap/structures";
import * as Expressions from "../../abap/expressions";
import {Invocation} from "./model/famix/invocation";
import {StructureNode} from "../../abap/nodes";
import {ModelChain} from "./model_chain";

export class ModelMethods {
  private readonly famixMethod: Method;
  private readonly methodImplStructure: StructureNode | undefined;
  private readonly repo: FamixRepository;
  // private readonly modelClass: ModelClass;
  // private readonly modelFile: ModelABAPFile;

  public constructor(repo: FamixRepository, modelFile: ModelABAPFile, modelClass: ModelClass,
                     methodDef: MethodDefinition) {
    this.repo = repo;
    // this.modelFile = modelFile;
    // this.modelClass = modelClass;
    this.famixMethod = new Method(repo);
    this.famixMethod.setName(methodDef.getName().toLowerCase());


    this.methodImplStructure = this.findMethodImplStructure(modelClass.getClassImplStructure(), methodDef.getName());

    this.famixMethod.addModifiers(Scope[methodDef.getScope()].toLowerCase());
    // todo: static methods CLASS-METHODS?


    this.famixMethod.setParentType(modelClass.getFamixClass());
    this.famixMethod.setSignature(methodDef.getName());
    // todo: returning a complex data structure
    const returning = methodDef.getParameters().getReturning();
    if (returning) {
      if (returning.isReferenceTo()) {
        const returnigClass = repo.createOrGetFamixClass(returning.getTypeName());
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

  public analyseInvocations() {
    if (this.methodImplStructure) {
      for (const methodCallChain of this.methodImplStructure.findAllExpressions(Expressions.MethodCallChain)) {
        if (methodCallChain.getFirstChild()!.get() instanceof Expressions.ClassName) {
          // static access
          const famixInvocation = new Invocation(this.repo);
          famixInvocation.setSender(this.famixMethod);
          const className = methodCallChain.getChildren()[0].getFirstToken().getStr();
          const methodName = methodCallChain.findFirstExpression(Expressions.MethodName)!.getFirstToken().getStr();
          const famixReceiverClass = this.repo.createOrGetFamixClass(className);
          let famixReceiverMethod = this.findMethod(famixReceiverClass.getMethods(), methodName);
          if (!famixReceiverMethod) {
            famixReceiverMethod = new Method(this.repo);
            famixReceiverMethod.setName(methodName);
            famixReceiverMethod.setIsStub(true);
            famixReceiverClass.addMethods(famixReceiverMethod);
          }
          famixInvocation.addCandidates(famixReceiverMethod);
        }
      }
    }
  }

  private findMethod(methods: Set<Method>, name: string): Method | undefined {
    for (const m of methods.values()) {
      if (m.getName() === name) {
        return m;
      }
    }
    return undefined;
  }

  public analyseFieldAccess() {
    console.log("--------------------" + this.famixMethod.getName() + "---------------------");
    if (this.methodImplStructure) {
      for (const c of this.methodImplStructure.findAllExpressions(Expressions.FieldChain)) {
        const chain = new ModelChain(c);
        chain.toString();
      }
      for (const t of this.methodImplStructure.findAllExpressions(Expressions.Target)) {
        const chain = new ModelChain(t);
        chain.toString();
      }
      for (const m of this.methodImplStructure.findAllExpressions(Expressions.MethodCallChain)) {
        const chain = new ModelChain(m);
        chain.toString();
      }
    }
  }


}