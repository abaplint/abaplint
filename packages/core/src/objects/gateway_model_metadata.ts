import {AbstractObject} from "./_abstract_object";

export class GatewayModelMetadata extends AbstractObject {

  public getType(): string {
    return "IWOM";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}