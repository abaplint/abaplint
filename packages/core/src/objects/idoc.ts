import {AbstractObject} from "./_abstract_object";

export class Idoc extends AbstractObject {

  public getType(): string {
    return "IDOC";
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
