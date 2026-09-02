import { type DocumentType } from "@/lib/api/gql";
import BrowseTreeItem from "@/components/layout/BrowseTreeLayout/BrowseTreeItem";
import TreeAccordion from "@/components/atomic/accordions/TreeAccordion";
import type { browseTreeLayoutFragment } from "./graphql";
import styles from "./BrowseTreeLayout.module.css";

type Node = DocumentType<typeof browseTreeLayoutFragment>["nodes"][number];

interface TreeNode extends Node {
  children?: TreeNode[];
  parentId?: string;
}

export default function BrowseTreeList({ nodes }: Props) {
  const list = nodes.map((node) => ({
    ...node,
    parentId: node.ancestors?.[0]?.id,
    children: undefined,
  }));

  const treeList = listToTree(list);

  function renderList(treeNodes: TreeNode[]) {
    return treeNodes.map((node) =>
      node.children && node.children.length > 0 ? (
        <TreeAccordion
          SummaryComponent={<BrowseTreeItem data={node} />}
          key={node.id}
          id={node.id}
        >
          <div className={styles.listItems}>{renderList(node.children)}</div>
        </TreeAccordion>
      ) : (
        <BrowseTreeItem key={node.id} data={node} />
      ),
    );
  }

  return <>{renderList(treeList)}</>;
}

interface Props {
  nodes: readonly Node[];
}

// Convert the flat list into a tree structure
function listToTree(list: TreeNode[]): TreeNode[] {
  const map: Record<string, number> = {};
  const roots: TreeNode[] = [];
  const treeList: TreeNode[] = [];
  let index = 0;

  // Map out each list node, including missing ancestors
  list.forEach((node) => {
    if (node.ancestors) {
      node.ancestors.forEach((a, i) => {
        // Ancestors missing from the page's flat list still need tree entries
        if (a.id && !map[a.id]) {
          map[a.id] = index;
          index++;
          treeList.push({
            ...a,
            parentId: node.ancestors[i - 1]?.id || undefined,
            children: [],
            ancestors: [],
          });
        }
      });
    }
    map[node.id] = index;
    index++;
    treeList.push({
      ...node,
      parentId: node?.ancestors?.[0]?.id,
      children: [],
    });
  });

  let node;

  treeList.forEach((item) => {
    node = item;
    if (node.parentId) {
      // Dangling branches: a parent id may not resolve to a tree entry
      if (treeList[map[node.parentId]]) {
        treeList[map[node.parentId]].children?.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
