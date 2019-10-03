import {ModelChain} from "./model_chain";
import {ModelMethods} from "./model_methods";
import {INode} from "../../abap/nodes/_inode";
import {ModelClass} from "./model_class";
import {ArrowOrDash, ClassName, MethodCall} from "../../abap/expressions";
import {Dash, InstanceArrow, StaticArrow} from "../../abap/tokens";
import {FamixRepository} from "./famix_repository";
import {Invocation} from "./model/famix/invocation";
import {BehaviouralEntity} from "./model/famix/behavioural_entity";
import {ModelRepository} from "./model_repository";

export class ModelMethodChain extends ModelChain {
  private receiver: BehaviouralEntity;

  protected analyseNode(node: INode, currModelClass: ModelClass, isFirstElementInChain: boolean): ModelClass {
    const expression = node.get();
    if (expression instanceof MethodCall) {
      const method = this.getMethodOfClass(node.getFirstToken().getStr(), currModelClass);
      if (method) {
        this.addDebugInfo("method");
        this.receiver = method;
      }

    } else if (expression instanceof ClassName) {
      const nextModelClass = ModelRepository.getRepo().getModelClass(node.getFirstToken().getStr());
      if (nextModelClass !== undefined) {
        this.addDebugInfo("class");
        currModelClass = nextModelClass;
      } else {
        this.addDebugInfo("CLASS_NOT_FOUND");
      }


    } else if ((expression instanceof Dash) || (expression instanceof InstanceArrow) || (expression instanceof StaticArrow)) {
      this.addDebugInfo(expression.getStr());
    } else if (expression instanceof ArrowOrDash) {
      this.addDebugInfo("=->");
    } else {
      this.addDebugInfo("[expression found!]");
    }

    isFirstElementInChain.valueOf();
    return currModelClass;
  }

  protected addToModel(modelMethod: ModelMethods): void {
    if (this.receiver) {
      this.addDebugInfo("  *");
      const famixInvocation = new Invocation(FamixRepository.getFamixRepo());
      famixInvocation.setSender(modelMethod.getFamixMethod());
      famixInvocation.addCandidates(this.receiver);
    }
  }

  protected showInLogOutput(): boolean {
    return true;
  }

}