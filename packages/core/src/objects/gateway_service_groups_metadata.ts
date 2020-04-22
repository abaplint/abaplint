import {AbstractObject} from "./_abstract_object";

export class GatewayServiceGroupsMetadata extends AbstractObject {

  public getType(): string {
    return "IWSG";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 50,
      allowNamespace: true,
    };
  }
}