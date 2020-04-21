import {AbstractObject} from "./_abstract_object";

export class GatewayService extends AbstractObject {

  public getType(): string {
    return "IWSV";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 50,
      allowNamespace: true,
    };
  }
}