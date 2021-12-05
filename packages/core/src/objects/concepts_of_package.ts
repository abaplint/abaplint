import {AbstractObject} from "./_abstract_object";
import {IAllowedNaming} from "./_iobject";

export class ConceptsOfPackage extends AbstractObject {

  public getType(): string {
    return "SOTS";
  }

  public getAllowedNaming(): IAllowedNaming {
    return {
      maxLength: 30,
      allowNamespace: true,
      customRegex: new RegExp(/^(\/[A-Z_\d]{3,8}\/)?[A-Z_-\d<> ]+$/i),
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
