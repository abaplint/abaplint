import {Identifier} from "./_identifier";
import {Visibility} from ".";
import {Token} from "../tokens/_token";

export class Alias extends Identifier {
  private visibility: Visibility;
  private component: string;

  constructor(token: Token, visibility: Visibility, component: string) {
    super(token);
    this.component = component;
    this.visibility = visibility;
  }

  public getComponent(): string {
    return this.component;
  }

  public getVisibility(): Visibility {
    return this.visibility;
  }
}