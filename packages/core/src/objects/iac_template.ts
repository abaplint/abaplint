import {AbstractObject} from "./_abstract_object";

export class IACTemplate extends AbstractObject {

  public getType(): string {
    return "IATU";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 100,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}