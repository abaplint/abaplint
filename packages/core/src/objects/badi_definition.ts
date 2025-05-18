import {AbstractObject} from "./_abstract_object";

export class BADIDefinition extends AbstractObject {

  public getType(): string {
    return "SXSD";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
