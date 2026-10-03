import {AbstractObject} from "./_abstract_object";

export class ApplicationDescriptorsFiori extends AbstractObject {

  public getType(): string {
    return "UIAD";
  }

  public getAllowedNaming() {
    return {
      maxLength: 60, // todo
      allowNamespace: true,
    };
  }
}
