import {AbstractObject} from "./_abstract_object";

export class IdocExtension extends AbstractObject {

  public getType(): string {
    return "IEXT";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}