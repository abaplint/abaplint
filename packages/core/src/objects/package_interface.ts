import {AbstractObject} from "./_abstract_object";

export class PackageInterface extends AbstractObject {

  public getType(): string {
    return "PINF";
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
