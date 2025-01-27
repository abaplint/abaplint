import {AbstractObject} from "./_abstract_object";

export class CDSType extends AbstractObject {

  public getType(): string {
    return "DRTY";
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
