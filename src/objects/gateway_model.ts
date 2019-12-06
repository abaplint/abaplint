import {AbstractObject} from "./_abstract_object";

export class GatewayModel extends AbstractObject {

  public getType(): string {
    return "IWMO";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}