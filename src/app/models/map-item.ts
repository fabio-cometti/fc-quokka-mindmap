export interface MapItem {
    id: string;
    title: string;
}

export interface MapCollection {
    item: MapItem;
    children: MapCollection[];
}

export interface RootMapCollection {
    rootItem: MapItem;
    leftChildren: MapCollection[];
    rightChildren: MapCollection[];
}

export interface MapNode {
    id: string;
    title: string;
    isRoot: boolean;
    css?: string;
    parent?: MapNode;
    children: MapNode[];
    position: 'left' | 'right' | 'center';
    isFirstLevel: boolean;
    isNew: boolean;
}