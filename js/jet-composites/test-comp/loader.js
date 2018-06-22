/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcore', 'text!./test-comp-view.html', './test-comp-viewModel', 'text!./component.json', 'css!./test-comp-styles', 'ojs/ojcomposite'],
  function(oj, view, viewModel, metadata) {
    oj.Composite.register('test-comp', {
      view: {inline: view}, 
      viewModel: {inline: viewModel}, 
      metadata: {inline: JSON.parse(metadata)}
    });
  }
);