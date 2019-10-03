import {ExpressionNode} from "../../abap/nodes";
import {FieldChain, MethodCallChain, Target} from "../../abap/expressions";
import {ModelClass} from "./model_class";
import {ModelMethods} from "./model_methods";
import {INode} from "../../abap/nodes/_inode";
import {Attribute} from "./model/famix/attribute";
import {Method} from "./model/famix/method";

export abstract class ModelChain {
  private modelMethod: ModelMethods;
  private debugInfo: string = "";

  constructor(node: ExpressionNode, modelClass: ModelClass, modelMethod: ModelMethods, logging: boolean) {
    if (!(node.get() instanceof MethodCallChain ||
       node.get() instanceof FieldChain ||
       node.get() instanceof Target)) {
      throw new Error("MethodCallChain, FieldChain or Target expected.");
    }
    this.modelMethod = modelMethod;

    const children = node.getChildren();
    let chain = "";
    let text = "";

    let currModelClass = modelClass;
    let firstElementInChain = true;

    for (const child of children) {

      currModelClass = this.analyseNode(child, currModelClass, firstElementInChain);

      chain = chain + child.get().constructor.name + " ";
      text = text + child.getFirstToken().getStr() + "";
      firstElementInChain = false;
    }

    this.addToModel(modelMethod);

    if (logging && this.showInLogOutput()) {
      console.log(node.get().constructor.name + ": " + chain + "(" + text + ") " + this.debugInfo);
    }
  }

  protected abstract analyseNode(node: INode, currClass: ModelClass, isFirstElementInChain: boolean): ModelClass;

  protected abstract addToModel(modelMethod: ModelMethods): void;

  protected showInLogOutput(): boolean {
    return false;
  }

  protected addDebugInfo(info: string) {
    this.debugInfo = this.debugInfo.concat(info);
  }

  protected getFieldOfClass(name: string, modelClass: ModelClass): Attribute | undefined {
    return modelClass.getAttribute(name);
  }

  protected isFieldOfClass(name: string, modelClass: ModelClass): boolean {
    return this.getFieldOfClass(name, modelClass) !== undefined;
  }

  protected getMethodOfClass(name: string, modelClass: ModelClass): Method | undefined {
    return modelClass.getMethod(name);
  }

  protected isParameterOfMethod(node: INode): boolean {
    for (const parameter of this.modelMethod.methodDef.getParameters().getAll()) {
      if (parameter.getName().toLowerCase() === node.getFirstToken().getStr().toLowerCase()) {
        return true;
      }
    }
    return false;
  }


}