import {AbstractObject} from "./_abstract_object";

export class ZN02 extends AbstractObject {

  public getType(): string {
    return "ZN02";
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