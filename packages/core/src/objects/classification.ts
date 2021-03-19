import {AbstractObject} from "./_abstract_object";

export class Classification extends AbstractObject {

  public getType(): string {
    return "AVAS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 32,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}