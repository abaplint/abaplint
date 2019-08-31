import {Visibility} from "./visibility";
import {Identifier} from "./_identifier";
import {Token} from "../tokens/_token";

export class ClassAttribute extends Identifier {
  private visibility: Visibility;
  private scope: Scope;
  private type: string | undefined;
//  private readOnly: boolean;

  constructor(token: Token, visibility: Visibility) {
    super(token);
    this.visibility = visibility;
//    this.readOnly = undefined;

    const foundType = node.findFirstExpression(Expressions.Type);
    if (foundType) {
      if ((foundType.getChildren()[1].getFirstToken().getStr() === "REF") &&
          (foundType.getChildren()[1].getFirstToken().getStr() === "TO")) {
        this.type = foundType.findFirstExpression(Expressions.FieldChain)!.findFirstExpression(Expressions.Field)!.getFirstToken().getStr();
      }
    }
  }

  public getVisibility() {
    return this.visibility;
  }

  public getType() {
    return this.type;
  }
/*
  public isReadOnly() {
    return this.readOnly;
  }
*/

}