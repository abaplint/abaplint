import {AbstractObject} from "./_abstract_object";

export class IACService extends AbstractObject {

  public getType(): string {
    return "IASP";
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