import {AbstractObject} from "./_abstract_object";

export class BRFPlusSystemApplication extends AbstractObject {

  public getType(): string {
    return "FDT0";
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