;(function() {
  'use strict';

  var React;
  if (typeof require !== 'undefined') {
    React = require('react');
  } else if (typeof window !== 'undefined') {
    React = window.React;
  }

  function callAll(functions) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      functions.filter(Boolean).forEach(function(fn) {
        fn.apply(null, args);
      });
    }
  }

  function DragReorderable() {
    React.Component.apply(this, arguments);
    this.state = {
      itemsWhileDragging: null,
      itemBeingDragged: null
    };
  }

  DragReorderable.propTypes = {
    tag: React.PropTypes.node,
    items: React.PropTypes.array,
    render: React.PropTypes.func,
    onChange: React.PropTypes.func
  };

  DragReorderable.defaultProps = {
    tag: 'div',
    items: [],
    render: Function.prototype,
    onChange: Function.prototype
  };

  DragReorderable.prototype = Object.assign(Object.create(React.Component.prototype), {
    render: function() {
      var relevantItems = this.state.itemsWhileDragging || this.props.items;
      var itemElements = relevantItems.map(this.renderItem, this);
      return React.createElement(this.props.tag, {
        className: [
          'drag-reorderable',
          this.props.className
        ].filter(Boolean).join(' '),
        'data-dragging': !!this.state.itemBeingDragged || null,
        onDragOver: callAll([
          this.props.onDragOver,
          this.handleContainerDragOver.bind(this)
        ]),
        onDrop: callAll([
          this.props.onDrop,
          this.handleContainerDrop.bind(this)
        ])
      }, itemElements);
    },

    componentDidUpdate: function() {
      var rootHasAttr = 'dragReorderableDragging' in document.documentElement.dataset;
      if (this.state.itemBeingDragged === null) {
        if (rootHasAttr) {
          delete document.documentElement.dataset.dragReorderableDragging;
        }
      } else {
        if (!rootHasAttr) {
          document.documentElement.dataset.dragReorderableDragging = true;
        }
      }
    },

    renderItem: function(item) {
      var itemElement = this.props.render.apply(null, arguments);
      var isBeingDragged = this.state.itemBeingDragged === item;
      return React.cloneElement(itemElement, {
        draggable: true,
        'data-being-dragged': isBeingDragged || null,
        onDragStart: callAll([
          itemElement.props.onDragStart,
          this.handleItemDragStart.bind(this, item)
        ]),
        onDragEnd: callAll([
          itemElement.props.onDragEnd,
          this.handleItemDragEnd.bind(this, item)
        ]),
        onDragOver: callAll([
          itemElement.props.onDragOver,
          isBeingDragged ? null : this.handleItemDragOver.bind(this, item)
        ])
      });
    },

    handleItemDragStart: function(item, event) {
        event.dataTransfer.effectAllowed = 'move';
        this.setState({
          itemsWhileDragging: this.props.items.slice(),
          itemBeingDragged: item
        });
    },

    handleItemDragOver: function(item, event) {
      var overRect = event.target.getBoundingClientRect();
      var halfwayPoint;
      var pastHalf;
      if (this.isInline(event.target)) {
        halfwayPoint = overRect.left + (event.target.offsetWidth / 2);
        pastHalf = event.clientX > halfwayPoint;
      } else {
        halfwayPoint = overRect.top + (event.target.offsetHeight / 2);
        pastHalf = event.clientY > halfwayPoint;
      }

      var addToIndex = 0;
      if (pastHalf) {
        addToIndex = 1;
      }

      var PLACEHOLDER = {};
      var items = this.state.itemsWhileDragging;
      items.splice(items.indexOf(item) + addToIndex, 0, PLACEHOLDER);
      items.splice(items.indexOf(this.state.itemBeingDragged), 1);
      items.splice(items.indexOf(PLACEHOLDER), 1, this.state.itemBeingDragged);
      this.setState({
        items: items
      });
    },

    isInline: function(element) {
      var display = getComputedStyle(element).display;
      return display.indexOf('inline') !== -1;
    },

    handleItemDragEnd: function(item) {
      // Give it a bit to ensure the drop handler has been called.
      setTimeout(function() {
        this.setState({
          itemsWhileDragging: null,
          itemBeingDragged: null
        });
      }.bind(this));
    },

    handleContainerDragOver: function(event) {
      // This is required for drop event to fire.
      event.preventDefault();
    },

    handleContainerDrop: function(event) {
      this.props.onChange(this.state.itemsWhileDragging);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = DragReorderable;
  } else if (typeof window !== 'undefined') {
    window.ZUIDragReorderable = DragReorderable;
  }
}());
