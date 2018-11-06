export interface INode {
  addChild(n: INode): INode;
  setChildren(children: INode[]): INode;
  getChildren(): INode[];
  get(): any;
}
