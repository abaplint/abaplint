import {ExpressionNode} from "../../abap/nodes";
import {MethodParam, MethodParamName, TypeName, TypeParam} from "../../abap/expressions";
import {Identifier} from "./_identifier";

export class MethodParameter extends Identifier {
  private readonly typeName: string;
  private readonly hasRefToToken: boolean;

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

    const typeParamStructure = node.findFirstExpression(TypeParam);
    if (typeParamStructure !== undefined) {
      const typeNameStructure = typeParamStructure.findFirstExpression(TypeName);
      if (typeNameStructure !== undefined) {
        let typeNameString: string = "";
        for (const token of typeNameStructure.getAllTokens()) {
          typeNameString = typeNameString.concat(token.getStr());
        }
        this.typeName = typeNameString;
        this.hasRefToToken = (typeParamStructure.findDirectTokenByText("REF") !== undefined);
      }
    } else {
      this.typeName = "";
    }

  }

  public getTypeName(): string {
    return this.typeName;
  }

  public isReferenceTo(): boolean {
    return this.hasRefToToken;
  }

// todo: pass by reference / pass by value / write protected

}