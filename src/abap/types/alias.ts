import {Identifier} from "./_identifier";
import {Visibility} from ".";
import {Token} from "../tokens/_token";

export class Alias extends Identifier {
  private readonly visibility: Visibility;
  private readonly component: string;

  public constructor(token: Token, visibility: Visibility, component: string, filename: string) {
    super(token, filename);
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