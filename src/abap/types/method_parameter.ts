import {ExpressionNode} from "../../abap/nodes";
import {MethodParam, MethodParamName, TypeName, TypeParam} from "../../abap/expressions";
import {Identifier} from "./_identifier";

export class MethodParameter extends Identifier {
  private readonly typeName: ExpressionNode | undefined;
  private hasRefToToken: boolean;

  constructor(node: ExpressionNode) {
    if (!(node.get() instanceof MethodParam) && !(node.get() instanceof MethodParamName)) {
      throw new Error("MethodParameter, unexpected input node");
    }
    const name = node.findFirstExpression(MethodParamName);
    if (!name) {
      console.dir(node);
      throw new Error("method_parameter.ts, todo, handle pass by value and reference");
    }
    super(name.getFirstToken());

    const typeParam = node.findFirstExpression(TypeParam);
    if (!typeParam) {
      throw new Error("MethodParameter expected a TypeParam as a child");
    }
    this.typeName = typeParam.findFirstExpression(TypeName);
    this.hasRefToToken = (typeParam.findDirectTokenByText("REF") !== undefined);
  }

  public getTypeName(): string {
    let name: string = "";
    for (const token of this.typeName!.getAllTokens()) {
      name = name.concat(token.getStr());
    }
    return name;
  }

  public isReferenceTo(): boolean {
    return this.hasRefToToken;
  }

// todo: pass by reference / pass by value / write protected

}