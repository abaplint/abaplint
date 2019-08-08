import {Identifier} from "./_identifier";
import {Scope} from ".";
import {Token} from "../tokens/_token";

export class Alias extends Identifier {
  private scope: Scope;
  private component: string;

  constructor(token: Token, scope: Scope, component: string) {
    super(token);
    this.component = component;
    this.scope = scope;
  }

  public getComponent(): string {
    return this.component;
  }

  public getScope(): Scope {
    return this.scope;
  }
}