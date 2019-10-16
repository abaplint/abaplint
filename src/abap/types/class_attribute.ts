import {Visibility} from "./visibility";
import {Identifier} from "./_identifier";
import {Token} from "../tokens/_token";

export class ClassAttribute extends Identifier {
  private readonly visibility: Visibility;
//  private readOnly: boolean;

  constructor(token: Token, visibility: Visibility) {
    super(token);
    this.visibility = visibility;
//    this.readOnly = undefined;
  }

  public getVisibility() {
    return this.visibility;
  }
/*
  public isReadOnly() {
    return this.readOnly;
  }
*/

}