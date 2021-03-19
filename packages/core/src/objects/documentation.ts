import {AbstractObject} from "./_abstract_object";

export class Documentation extends AbstractObject {

  public getType(): string {
    return "DOCV";
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
