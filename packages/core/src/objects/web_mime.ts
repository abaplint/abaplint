import {AbstractObject} from "./_abstract_object";
import {IAllowedNaming} from "./_iobject";

export class WebMIME extends AbstractObject {

  public getType(): string {
    return "W3MI";
  }

  public getAllowedNaming(): IAllowedNaming {
    return {
      maxLength: 40,
      allowNamespace: true,
      customRegex: new RegExp(/^[A-Z_-\d/<> ]+$/i),
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
