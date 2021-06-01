import {AbstractObject} from "./_abstract_object";

export class SAPScriptStyle extends AbstractObject {

  public getType(): string {
    return "STYL";
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