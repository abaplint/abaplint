export abstract class Object {
  private name: string;
  private package: string;

  public abstract getType(): string;

  constructor(name: string, devPackage: string) {
    this.name = name;
    this.package = devPackage;
  }

  public getName(): string {
    return this.name;
  }

  public getPackage() {
    return this.package;
  }

}