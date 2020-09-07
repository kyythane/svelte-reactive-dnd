# DropGroup

`DropGroup` uses [contexts](https://svelte.dev/docs#setContext) to consolidate events from and inject a key into any `DropList`s in its children that do not provide their own `key`.

So for example:

```html
<DropGroup>

</DropGroup>
```
