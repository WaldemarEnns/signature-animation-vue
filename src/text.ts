import type { VNode } from 'vue'

/**
 * Flatten the text content of default-slot vnodes into a plain string.
 * Handles string children and nested arrays of vnodes.
 */
export function slotText(nodes: (VNode | string)[] | undefined): string {
  if (!nodes) return ''
  let out = ''
  for (const node of nodes) {
    if (typeof node === 'string') {
      out += node
    } else {
      const children = node.children
      if (typeof children === 'string') out += children
      else if (Array.isArray(children)) out += slotText(children as (VNode | string)[])
    }
  }
  return out
}
