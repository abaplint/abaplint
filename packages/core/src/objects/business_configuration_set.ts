import {AbstractObject} from "./_abstract_object";

export class BusinessConfigurationSet extends AbstractObject {

  public getType(): string {
    return "SCP1";
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
