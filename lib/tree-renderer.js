export default class TreeRenderer
{
  constructor(EOL, border, ansiBorder, ansiPrimitive)
  {
    this.bottomLeft           = ansiBorder(border.bottomLeft)
    this.teeLeft              = ansiBorder(border.teeLeft)
    this.lastBranch           = ansiBorder(border.bottomLeft + border.horizontal + ' ')
    this.lastBranchWithChild  = ansiBorder(border.bottomLeft + border.horizontal + border.horizontal + border.teeUp + border.horizontal + ' ')
    this.midBranch            = ansiBorder(border.teeLeft    + border.horizontal + ' ')
    this.midBranchWithChild   = ansiBorder(border.teeLeft    + border.horizontal + border.horizontal + border.teeUp + border.horizontal + ' ')
    this.deepIndent           = ansiBorder(border.horizontal + border.horizontal + border.horizontal + border.horizontal + ' ')
    this.indentPipe           = ansiBorder(border.vertical + '  ')
    this.indentPad            = '   '
    this.EOL                  = EOL
    this.ansiPrimitive        = ansiPrimitive
  }

  render(input)
  {
    const lines = []
    const stack = new WeakSet()

    const k = this.kind(input)

    if(this.isEmptyContainer(input, k))
    {
      lines.push(this.formatContainer(input, k))
      return lines.join(this.EOL)
    }

    if(k === 'array')
    {
      if(this.isTreeListRoot(input))
      {
        this.enter(stack, input)
        try
        {
          this.renderTreeList(lines, stack, input, '')
        }
        finally
        {
          this.leave(stack, input)
        }
        return lines.join(this.EOL)
      }

      this.renderList(lines, stack, input, '', true, false)
      return lines.join(this.EOL)
    }

    if(k === 'set')
    {
      this.renderList(lines, stack, input, '', true, false)
      return lines.join(this.EOL)
    }

    if(k === 'object' || k === 'map')
    {
      this.renderObject(lines, stack, input, '', k, true)
      return lines.join(this.EOL)
    }

    lines.push(this.formatPrimitive(input))
    return lines.join(this.EOL)
  }

  isTreeListRoot(list)
  {
    let sawTreeNode = false

    for(const el of list)
    {
      if(Array.isArray(el))
      {
        if(!this.isTreeListBranch(el)) return false
        sawTreeNode = true
      }
      else if(this.isPlainObject(el))
      {
        if(!this.isTreeListObjectLeaf(el)) return false
        sawTreeNode = true
      }
      else if(el !== null && typeof el === 'object')
      {
        return false
      }
    }

    return sawTreeNode
  }

  isTreeListBranch(node)
  {
    if(node.length === 0) return false

    const label = node[0]
    if(Array.isArray(label)) return false
    if(label !== null && typeof label === 'object') return false

    for(let i = 1; i < node.length; i++)
    {
      const child = node[i]
      if(Array.isArray(child))
      {
        if(!this.isTreeListBranch(child)) return false
      }
      else if(child !== null && typeof child === 'object')
      {
        return false
      }
    }

    return true
  }

  isTreeListObjectLeaf(obj)
  {
    const keys = Object.keys(obj)
    if(keys.length !== 1) return false
    const v = obj[keys[0]]
    return this.kind(v) === 'leaf'
  }

  renderTreeList(lines, stack, list, prefix)
  {
    for(let i = 0; i < list.length; i++)
    {
      const node = list[i]
      const last = i === list.length - 1

      if(Array.isArray(node))
      {
        this.renderTreeBranch(lines, stack, node, prefix, last)
      }
      else if(this.isPlainObject(node))
      {
        const key = Object.keys(node)[0]
        const v = node[key]
        const edge = last ? this.bottomLeft : this.teeLeft
        lines.push(prefix + edge + this.deepIndent + key + ': ' + this.formatPrimitive(v))
      }
      else
      {
        lines.push(prefix + (last ? this.lastBranch : this.midBranch) + this.formatPrimitive(node))
      }
    }
  }

  renderTreeBranch(lines, stack, node, prefix, last)
  {
    this.enter(stack, node)
    try
    {
      lines.push(prefix + (last ? this.lastBranchWithChild : this.midBranchWithChild) + this.formatPrimitive(node[0]))

      const childPrefix = prefix + (last ? this.indentPad : this.indentPipe)

      for(let i = 1; i < node.length; i++)
      {
        const child = node[i]
        const childLast = i === node.length - 1

        if(Array.isArray(child))
        {
          this.renderTreeBranch(lines, stack, child, childPrefix, childLast)
        }
        else
        {
          lines.push(childPrefix + (childLast ? this.lastBranch : this.midBranch) + this.formatPrimitive(child))
        }
      }
    }
    finally
    {
      this.leave(stack, node)
    }
  }

  renderObjectRoot(obj, k)
  {
    const lines = []
    const stack = new WeakSet()

    if(this.isEmptyContainer(obj, k))
    {
      lines.push(this.formatContainer(obj, k))
      return lines.join(this.EOL)
    }

    this.renderObject(lines, stack, obj, '', k, true)
    return lines.join(this.EOL)
  }

  enter(stack, v)
  {
    if(v === null || typeof v !== 'object') return
    if(stack.has(v)) throw new RangeError('Cyclic structure')
    stack.add(v)
  }

  leave(stack, v)
  {
    if(v === null || typeof v !== 'object') return
    stack.delete(v)
  }

  propPairs(container, containerKind)
  {
    if(containerKind === 'object')
    {
      return Object.keys(container).map(key => ({ label: key, v: container[key] }))
    }

    if(containerKind === 'map')
    {
      const out = []
      for(const [key, v] of container.entries()) out.push({ label: String(key), v })
      return out
    }

    return []
  }

  padLenForPairs(pairs)
  {
    if(pairs.length < 2) return 0

    let maxLen = 0
    let allInline = true

    for(const p of pairs)
    {
      maxLen = Math.max(maxLen, p.label.length)
      const vk = this.kind(p.v)
      if(vk !== 'leaf' && !this.isEmptyContainer(p.v, vk))
      {
        allInline = false
        break
      }
    }

    return allInline ? (maxLen + 1) : 0
  }

  renderObject(lines, stack, container, prefix, containerKind, tailIsLast)
  {
    const pairs = this.propPairs(container, containerKind)
    if(pairs.length === 0) return

    const padLen = this.padLenForPairs(pairs)

    this.enter(stack, container)
    try
    {
      for(let i = 0; i < pairs.length; i++)
      {
        const p = pairs[i]
        const last = i === pairs.length - 1 ? tailIsLast : false
        this.renderProp(lines, stack, p.label, p.v, padLen, prefix, last)
      }
    }
    finally
    {
      this.leave(stack, container)
    }
  }

  renderProp(lines, stack, label, v, padLen, prefix, last)
  {
    const branch = last ? this.lastBranch : this.midBranch
    const k = this.kind(v)
    const key = padLen ? label.padEnd(padLen) : label

    if(k === 'leaf')
    {
      lines.push(prefix + branch + key + ': ' + this.formatPrimitive(v))
      return
    }

    if(this.isEmptyContainer(v, k))
    {
      lines.push(prefix + branch + key + ': ' + this.formatContainer(v, k))
      return
    }

    lines.push(prefix + branch + key + ':')

    const childPrefix = prefix + (last ? this.indentPad : this.indentPipe)

    if(k === 'object' || k === 'map')
    {
      this.renderObject(lines, stack, v, childPrefix, k, true)
      return
    }

    if(k === 'array' || k === 'set')
    {
      this.renderList(lines, stack, v, childPrefix, true, true)
      return
    }

    throw new TypeError(`Unexpected prop value kind: ${k}`)
  }

  listValues(stack, container)
  {
    const out = []
    this.walkList(stack, container, true, out)
    return out
  }

  walkList(stack, v, root, out)
  {
    const k = this.kind(v)

    if(k === 'array')
    {
      if(v.length === 0)
      {
        out.push(v)
        return
      }

      if(!root) this.enter(stack, v)
      try
      {
        for(const el of v) this.walkList(stack, el, false, out)
      }
      finally
      {
        if(!root) this.leave(stack, v)
      }
      return
    }

    if(k === 'set')
    {
      if(v.size === 0)
      {
        out.push(v)
        return
      }

      if(!root) this.enter(stack, v)
      try
      {
        for(const el of v.values()) this.walkList(stack, el, false, out)
      }
      finally
      {
        if(!root) this.leave(stack, v)
      }
      return
    }

    out.push(v)
  }

  renderList(lines, stack, container, prefix, tailIsLast, nestedList)
  {
    this.enter(stack, container)
    try
    {
      const values = this.listValues(stack, container)

      for(let i = 0; i < values.length; i++)
      {
        const v = values[i]
        const last = i === values.length - 1 ? tailIsLast : false
        this.renderListValue(lines, stack, v, prefix, last, nestedList)
      }
    }
    finally
    {
      this.leave(stack, container)
    }
  }

  renderListValue(lines, stack, v, prefix, last, nestedList)
  {
    const branch = last ? this.lastBranch : this.midBranch
    const k = this.kind(v)

    if(k === 'leaf')
    {
      lines.push(prefix + branch + this.formatPrimitive(v))
      return
    }

    if(this.isEmptyContainer(v, k))
    {
      lines.push(prefix + branch + this.formatContainer(v, k))
      return
    }

    if(k === 'object' || k === 'map')
    {
      this.renderArrayObjectElement(lines, stack, v, prefix, last, k, nestedList)
      return
    }

    throw new TypeError(`Unexpected list element kind: ${k}`)
  }

  renderArrayObjectElement(lines, stack, container, prefix, last, containerKind, nestedList)
  {
    const pairs = this.propPairs(container, containerKind)

    if(pairs.length === 0)
    {
      lines.push(prefix + (last ? this.lastBranch : this.midBranch) + this.formatContainer(container, containerKind))
      return
    }

    const edge = last ? this.bottomLeft : this.teeLeft

    if(pairs.length === 1)
    {
      const p = pairs[0]
      const vk = this.kind(p.v)

      if(vk === 'leaf')
      {
        if(nestedList)
        {
          lines.push(prefix + edge + this.deepIndent + p.label + ': ' + this.formatPrimitive(p.v))
        }
        else
        {
          lines.push(prefix + (last ? this.lastBranch : this.midBranch) + p.label + ': ' + this.formatPrimitive(p.v))
        }
        return
      }

      if(this.isEmptyContainer(p.v, vk))
      {
        if(nestedList)
        {
          lines.push(prefix + edge + this.deepIndent + p.label + ': ' + this.formatContainer(p.v, vk))
        }
        else
        {
          lines.push(prefix + (last ? this.lastBranch : this.midBranch) + p.label + ': ' + this.formatContainer(p.v, vk))
        }
        return
      }

      lines.push(prefix + edge + this.deepIndent + p.label + ':')

      const childPrefix = prefix + (last ? this.indentPad : this.indentPipe) + '   '

      this.enter(stack, container)
      try
      {
        if(vk === 'object' || vk === 'map')
        {
          this.renderObject(lines, stack, p.v, childPrefix, vk, true)
          return
        }

        if(vk === 'array' || vk === 'set')
        {
          this.renderList(lines, stack, p.v, childPrefix, true, true)
          return
        }

        throw new TypeError(`Unexpected wrapper value kind: ${vk}`)
      }
      finally
      {
        this.leave(stack, container)
      }
    }

    const padLen = this.padLenForPairs(pairs)

    const promoted = pairs[0]
    const promotedKind = this.kind(promoted.v)
    const promotedInline = promotedKind === 'leaf' || this.isEmptyContainer(promoted.v, promotedKind)

    const headerLabel = promotedInline
      ? (padLen ? promoted.label.padEnd(padLen) : promoted.label) + ': ' +
        (promotedKind === 'leaf' ? this.formatPrimitive(promoted.v) : this.formatContainer(promoted.v, promotedKind))
      : promoted.label + ':'

    lines.push(prefix + (last ? this.lastBranchWithChild : this.midBranchWithChild) + headerLabel)

    const childPrefix = prefix + (last ? this.indentPad : this.indentPipe)
    const hasRest = pairs.length > 1
    const promotedPrefix = hasRest ? (childPrefix + this.indentPipe) : childPrefix

    this.enter(stack, container)
    try
    {
      if(!promotedInline)
      {
        if(promotedKind === 'object' || promotedKind === 'map')
        {
          this.renderObject(lines, stack, promoted.v, promotedPrefix, promotedKind, true)
        }
        else if(promotedKind === 'array' || promotedKind === 'set')
        {
          this.renderList(lines, stack, promoted.v, promotedPrefix, true, true)
        }
        else
        {
          throw new TypeError(`Unexpected promoted value kind: ${promotedKind}`)
        }
      }

      for(let i = 1; i < pairs.length; i++)
      {
        const p = pairs[i]
        const lastChild = i === pairs.length - 1
        this.renderProp(lines, stack, p.label, p.v, padLen, childPrefix, lastChild)
      }
    }
    finally
    {
      this.leave(stack, container)
    }
  }

  kind(v)
  {
    if(v === null) return 'leaf'
    if(Array.isArray(v)) return 'array'
    if(this.isPlainObject(v)) return 'object'
    if(v instanceof Map) return 'map'
    if(v instanceof Set) return 'set'
    return 'leaf'
  }

  isEmptyContainer(v, k)
  {
    if(k === 'array') return v.length === 0
    if(k === 'object') return Object.keys(v).length === 0
    if(k === 'map' || k === 'set') return v.size === 0
    return false
  }

  formatContainer(v, k)
  {
    if(k === 'array') return '[]'
    if(k === 'object') return '{}'
    if(k === 'map') return `Map(${v.size})`
    if(k === 'set') return `Set(${v.size})`
    return String(v)
  }

  isPlainObject(v)
  {
    if(v === null || typeof v !== 'object') return false
    if(Array.isArray(v)) return false
    const proto = Object.getPrototypeOf(v)
    return proto === Object.prototype || proto === null
  }

  formatPrimitive(v)
  {
    return this.ansiPrimitive(v === null ? 'null' : String(v))
  }
}
