import {AbstractObject} from "./_abstract_object";

export class PackageInterface extends AbstractObject {

  public getType(): string {
    return "PINF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}