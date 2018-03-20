'use strict';

var angular = require('angular');

var events = require('./events');

function getExistingAnnotation(annotationUI, id) {
  return annotationUI.getState().annotations.find(function (annot) {
    return annot.id === id;
  });
}

// Wraps the annotation store to trigger events for the CRUD actions
// @ngInject
function annotationMapper($rootScope, annotationUI, store, bridge) {
  function loadAnnotations(annotations, replies) {
    annotations = annotations.concat(replies || []);
    var loaded = [];
    function _load(){
          annotations.forEach(function (annotation) {
            annotation.display_options = {};
            annotation.id = annotation.id.toString();
            if(annotation.type_id){
              var type = $rootScope._types[annotation.type_id];
              if (type){
                annotation.color = type.color;
                annotation.type_action = type.action;
                annotation.type_flashcard_type = type.flashcard_type;
              }
            }
            else{
              annotation.color = 'ffff77';
            }
            var existing = getExistingAnnotation(annotationUI, annotation.id);
            if (existing) {
              $rootScope.$broadcast(events.ANNOTATION_UPDATED, annotation);
              return;
            }
            loaded.push(annotation);
          });
          $rootScope.$broadcast(events.ANNOTATIONS_LOADED, loaded);
    }
    

    // if(typeof $rootScope._types === 'undefined'){
    //   store.types().then(function(result){
    //     $rootScope._types = {}
    //     for(var i=0; i < result.length; i++){
    //       var type = result[i];
    //       $rootScope._types[type.id] = type;
    //     }
    //     bridge.call('loadTypes', result);
    //     _load()
    //     })
    // }else{
          _load()
    // }

  }

  function unloadAnnotations(annotations) {
    var unloaded = annotations.map(function (annotation) {
      var existing = getExistingAnnotation(annotationUI, annotation.id);
      if (existing && annotation !== existing) {
        annotation = angular.copy(annotation, existing);
      }
      return annotation;
    });
    $rootScope.$broadcast(events.ANNOTATIONS_UNLOADED, unloaded);
  }

  function createAnnotation(annotation) {
    $rootScope.$broadcast(events.BEFORE_ANNOTATION_CREATED, annotation);
    return annotation;
  }

  function deleteAnnotation(annotation) {
    return store.annotation.delete({
      id: annotation.id,
    }).then(function () {
      $rootScope.$broadcast(events.ANNOTATION_DELETED, annotation);
      return annotation;
    });
  }

  function flagAnnotation(annot) {
    return store.annotation.flag({
      id: annot.id,
    }).then(function () {
      $rootScope.$broadcast(events.ANNOTATION_FLAGGED, annot);
      return annot;
    });
  }

  return {
    loadAnnotations: loadAnnotations,
    unloadAnnotations: unloadAnnotations,
    createAnnotation: createAnnotation,
    deleteAnnotation: deleteAnnotation,
    flagAnnotation: flagAnnotation,
  };
}


module.exports = annotationMapper;
