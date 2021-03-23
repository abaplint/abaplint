import {AbstractObject} from "./_abstract_object";

export class GatewayProject extends AbstractObject {

  public getType(): string {
    return "IWPR";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
