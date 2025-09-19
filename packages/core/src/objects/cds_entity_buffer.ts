import {AbstractObject} from "./_abstract_object";

export class CDSEntityBuffer extends AbstractObject {

  public getType(): string {
    return "DTEB";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
