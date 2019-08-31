import {Visibility} from "./visibility";
import {Identifier} from "./_identifier";
import {Token} from "../tokens/_token";

export class ClassAttribute extends Identifier {
  private visibility: Visibility;
  private type: string | undefined;
//  private readOnly: boolean;

  constructor(token: Token, visibility: Visibility, type: string | undefined) {
    super(token);
    this.visibility = visibility;
//    this.readOnly = undefined;
    this.type = type;

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