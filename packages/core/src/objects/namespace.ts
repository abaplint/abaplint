import {AbstractObject} from "./_abstract_object";
import {IAllowedNaming} from "./_iobject";

export class Namespace extends AbstractObject {

  public getType(): string {
    return "NSPC";
  }

  public getAllowedNaming(): IAllowedNaming {
    return {
      maxLength: 10,
      allowNamespace: true,
      customRegex: new RegExp(/^\/[A-Z_\d]{3,8}\/$/i),
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
