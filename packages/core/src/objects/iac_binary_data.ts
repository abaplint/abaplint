import {AbstractObject} from "./_abstract_object";

export class IACBinaryData extends AbstractObject {

  public getType(): string {
    return "IAMU";
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