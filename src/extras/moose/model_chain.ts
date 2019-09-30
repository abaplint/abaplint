import {ExpressionNode} from "../../abap/nodes";
import {ClassName, ComponentName, Field, FieldChain, MethodCallChain, Target} from "../../abap/expressions";
import {ModelClass} from "./model_class";
import {ModelMethods} from "./model_methods";
import {INode} from "../../abap/nodes/_inode";
import {Access} from "./model/famix/access";
import {FamixRepository} from "./famix_repository";
import {Attribute} from "./model/famix/attribute";
import {ModelRepository} from "./model_repository";
import {Dash, InstanceArrow, StaticArrow} from "../../abap/tokens";

export class ModelChain {
  private modelClass: ModelClass;
  private modelMethod: ModelMethods;
  private debugInfo: string = "";

  constructor(node: ExpressionNode, modelClass: ModelClass, modelMethod: ModelMethods) {
    if (!(node.get() instanceof MethodCallChain ||
       node.get() instanceof FieldChain ||
       node.get() instanceof Target)) {
      throw new Error("MethodCallChain, FieldChain or Target expected.");
    }
    this.modelClass = modelClass;
    this.modelMethod = modelMethod;

    const children = node.getChildren();
    let chain = "";
    let text = "";

    let currModelClass = this.modelClass;
    let firstElementInChain = true;


    for (const child of children) {

      const childNode = child.get();

      if ((child.get() instanceof Field) || (child.get() instanceof ComponentName)) {

        if (this.isFieldOfClass(child, currModelClass)) {
          this.addDebugInfo("class_field");

          const famixAccess = new Access(FamixRepository.getFamixRepo());
          famixAccess.setAccessor(this.modelMethod.getFamixMethod());
          famixAccess.setVariable(this.getFieldOfClass(child, currModelClass)!);

        } else if (firstElementInChain && (this.isParameterOfMethod(child))) {
          this.addDebugInfo("parameter");

        } else if (firstElementInChain && child.getFirstToken().getStr().toLowerCase().startsWith("l")) {
          this.addDebugInfo("local");

        } else {
          this.addDebugInfo("FIELD_NOT_FOUND");
        }
      } else if (child.get() instanceof ClassName) {
        const nextModelClass = ModelRepository.getRepo().getModelClass(child.getFirstToken().getStr());
        if (nextModelClass !== undefined) {
          this.addDebugInfo("class");
          currModelClass = nextModelClass;
        } else {
          this.addDebugInfo("CLASS_NOT_FOUND");
          console.log("class not found: " + child.getFirstToken().getStr());
        }
      } else if ((childNode instanceof Dash) || (childNode instanceof InstanceArrow) || (childNode instanceof StaticArrow) ) {
        this.addDebugInfo(childNode.getStr());
      } else {
        console.log("other token found!");
      }

      chain = chain + child.get().constructor.name + " ";
      text = text + child.getFirstToken().getStr() + "";
      firstElementInChain = false;
    }

    if (children.length > 1) {
      console.log(node.get().constructor.name + ": " + chain + "(" + text + ") " + this.debugInfo);
    }
  }

  private addDebugInfo(info: string) {
    this.debugInfo = this.debugInfo.concat(info);
  }

  private getFieldOfClass(node: INode, modelClass: ModelClass): Attribute | undefined {
    return modelClass.getAttribute(node.getFirstToken().getStr());
  }

  private isFieldOfClass(node: INode, modelClass: ModelClass): boolean {
    return this.getFieldOfClass(node, modelClass) !== undefined;
  }

  private isParameterOfMethod(node: INode): boolean {
    for (const parameter of this.modelMethod.methodDef.getParameters().getAll()) {
      if (parameter.getName().toLowerCase() === node.getFirstToken().getStr().toLowerCase()) {
        return true;
      }
    }
    return false;
  }


}