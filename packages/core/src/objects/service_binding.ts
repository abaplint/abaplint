import {AbstractObject} from "./_abstract_object";

export class ServiceBinding extends AbstractObject {

  public getType(): string {
    return "SRVB";
  }

  public getAllowedNaming() {
    return {
      maxLength: 26,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}