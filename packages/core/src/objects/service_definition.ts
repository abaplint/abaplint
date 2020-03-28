import {AbstractObject} from "./_abstract_object";

export class ServiceDefinition extends AbstractObject {

  public getType(): string {
    return "SRVD";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}