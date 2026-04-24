'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface TreeNode {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'productType' | 'model' | 'variant';
  children?: TreeNode[];
  data?: any;
  thumbnail?: string;
}

export function ProductTree() {
  const store = useStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildTree = (): TreeNode[] => {
    return store.categories.map(cat => {
      const categoryThumb = '/placeholder.svg';

      return {
      id: cat.id,
      name: cat.name,
      type: 'category' as const,
      data: cat,
      thumbnail: categoryThumb,
      children: store.subcategories
        .filter(s => s.categoryId === cat.id)
        .map(sub => ({
          id: sub.id,
          name: sub.name,
          type: 'subcategory' as const,
          data: sub,
          thumbnail: categoryThumb,
          children: store.productTypes
            .filter(p => p.subcategoryId === sub.id)
            .map(pt => ({
              id: pt.id,
              name: pt.name,
              type: 'productType' as const,
              data: pt,
              thumbnail: categoryThumb,
              children: store.models
                .filter(m => m.productTypeId === pt.id)
                .map(mod => ({
                  id: mod.id,
                  name: mod.name,
                  type: 'model' as const,
                  data: mod,
                  thumbnail: categoryThumb,
                  children: store.brandVariants
                    .filter(b => b.modelId === mod.id)
                    .map(variant => ({
                      id: variant.id,
                      name: `${variant.brand} - ${variant.variantName}`,
                      type: 'variant' as const,
                      data: variant,
                      thumbnail: categoryThumb,
                    })),
                })),
            })),
        })),
      };
    });
  };

  const tree = useMemo(() => buildTree(), [store.categories, store.subcategories, store.productTypes, store.models, store.brandVariants]);

  const TreeNodeComponent = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer ${
            selectedNode?.id === node.id ? 'bg-primary text-primary-foreground' : ''
          }`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {node.thumbnail ? (
            <Image
              src={node.thumbnail}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 rounded-sm object-cover flex-shrink-0"
            />
          ) : (
            <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-sm truncate flex-1">{node.name}</span>

          {node.type === 'variant' && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {formatCurrency(node.data.sellingPrice)}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => (
              <TreeNodeComponent key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (tree.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No products yet. Create a category to get started.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-card p-4 max-h-96 overflow-y-auto">
      {tree.map(node => (
        <TreeNodeComponent key={node.id} node={node} />
      ))}
    </div>
  );
}
