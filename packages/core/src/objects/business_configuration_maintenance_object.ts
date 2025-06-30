import {AbstractObject} from "./_abstract_object";

export class BusinessConfigurationMaintenanceObject extends AbstractObject {

  public getType(): string {
    return "SMBC";
  }

  public getAllowedNaming() {
    return {
      maxLength: 60, // todo
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
