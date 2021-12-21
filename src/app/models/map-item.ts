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
    notes?: string;
}