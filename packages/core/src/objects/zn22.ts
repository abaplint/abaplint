import {AbstractObject} from "./_abstract_object";

export class ZN0122 extends AbstractObject {

  public getType(): string {
    return "ZN22";
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