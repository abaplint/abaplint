import {AbstractObject} from "./_abstract_object";

export class IdocExtension extends AbstractObject {

  public getType(): string {
    return "IEXT";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: false,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
