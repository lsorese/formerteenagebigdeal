# Markdown Features Demo

This document demonstrates various **Markdown features** supported in the game!

## Headers

### Level 3 Header
#### Level 4 Header
##### Level 5 Header

## Text Formatting

- **Bold text** using double asterisks
- *Italic text* using single asterisks  
- ~~Strikethrough~~ using double tildes
- `Inline code` using backticks

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Code Blocks

```python
def fibonacci(n):
    """Generate Fibonacci sequence"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Example usage
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

## Blockquotes

> This is a blockquote. It can contain multiple lines
> and even **formatted text**.
>
> - It can also contain lists
> - And other markdown elements

## Links and References

Check out [the official Markdown guide](https://www.markdownguide.org/) for more information.

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | All levels |
| Lists | ✅ | Ordered & unordered |
| Code | ✅ | Inline & blocks |
| Tables | ✅ | Basic support |
| Images | ⚠️ | Limited support |

---

## Mathematical Expressions

While not standard Markdown, many parsers support:
- Superscript: E=mc²
- Subscript: H₂O
- Special characters: α, β, γ, π, Σ

**Note**: This markdown renderer provides basic formatting support for an enhanced reading experience in the game!