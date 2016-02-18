# DragReorderable

This is a React component for simple reordering of items in an array.

It takes the following props:

* `tag`: The container tag to render. Defaults to `"div"`.

* `items`: The array of items you want to be reorderable.

* `render`: The function to render each item. It should return a React element. Make sure it's got a `key` prop!

* `onChange`: The function to call when an item has been successfully dragged and dropped.

`display: block` elements can be dragged vertically, `inline` elements horizontally.

While dragging, the root document element will get a `data-drag-reorderable-dragging` attribute, the container will get a `data-dragging` attribute, and the item being dragged will get a `data-being-dragged` attribute.

## Example

```jsx
  const Whatever = React.createClass({
    getInitialState() {
      return {
        things: [
          {id: 0, content: 'Hello'},
          {id: 1, content: 'World'},
          {id: 2, content: 'Hola'},
          {id: 3, content: 'Mundo'}
        ]
      };
    },

    render() {
      return (
        <DragReorderable
          tag="ul"
          items={this.state.things}
          render={this.renderThing}
          onChange={this.handleThingsReorder}
        />
      };
    },

    renderThing(thing) {
      return (
        <li key={thing.id}>
          <p>The thing is: <code>{thing.content}</code>.</p>
        </li>
      );
    },

    handleThingsReorder(newThings) {
      this.setState({
        things: newThings
      });
    }
  });
```

## TODO:

* Tests!

* Touch event handling
