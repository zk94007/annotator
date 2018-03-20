$ = require('jquery')

# Public: Wraps the DOM Nodes within the provided range with a highlight
# element of the specified class and returns the highlight Elements.
#
# normedRange - A NormalizedRange to be highlighted.
# cssClass - A CSS class to use for the highlight (default: 'annotator-hl')
#
# Returns an array of highlight Elements.
exports.highlightRange = (normedRange, cssClass='annotator-hl', color='', annotationId='', replace=undefined) ->
  white = /^\s*$/

  # A custom element name is used here rather than `<span>` to reduce the
  if color
    style = "style='background-color: ##{color}'"
  else
    style = ''
  # likelihood of highlights being hidden by page styling.
  hl = $("<hypothesis-highlight class='#{cssClass} highlight-#{annotationId}' #{style}></hypothesis-highlight>")
  # Ignore text nodes that contain only whitespace characters. This prevents
  # spans being injected between elements that can only contain a restricted
  # subset of nodes such as table rows and lists. This does mean that there
  # may be the odd abandoned whitespace node in a paragraph that is skipped
  # but better than breaking table layouts.
  nodes = $(normedRange.textNodes()).filter((i) -> not white.test @nodeValue)

  res = nodes.wrap(hl).parent().toArray()
  refreshSpaces(normedRange.commonAncestor)
  addReplace(annotationId, replace) if replace?
  return res

addReplace = (annotationId, replace) ->
  styleId = "#style-highlight-#{annotationId}"
  styleClass = ".highlight-#{annotationId}"
  $(styleId).remove();
  $("<style id='#{styleId}' type='text/css'> #{styleClass}{ text-decoration: line-through; } \n" +
    " #{styleClass}::after{ content: '\u00a0#{replace}'; text-decoration: none; display: inline-block; } </style>").appendTo("head");

removeReplace = (annotationId) ->
  styleId = "#style-highlight-#{annotationId}"
  $(styleId).remove();

refreshSpaces = (element) ->
  # make sure that spaces inbetween elements are handled correctly
  if not element.oldWhiteSpace?
    element.oldWhiteSpace = [element.style.whiteSpace]
  window.requestAnimationFrame( ->
    if element.oldWhiteSpace?
      element.style.whiteSpace = element.oldWhiteSpace[0]
      element.oldWhiteSpace = undefined
  )
  element.style.whiteSpace = "pre"

exports.removeHighlights = (highlights) ->
  for item in highlights when item[0].parentNode?
    h = item[0]
    annotationId = item[1]
    refreshSpaces(h.parentNode)
    $(h).replaceWith(h.childNodes)
    removeReplace(annotationId) if annotationId?


# Get the bounding client rectangle of a collection in viewport coordinates.
# Unfortunately, Chrome has issues[1] with Range.getBoundingClient rect or we
# could just use that.
# [1] https://code.google.com/p/chromium/issues/detail?id=324437
exports.getBoundingClientRect = (collection) ->
  # Reduce the client rectangles of the highlights to a bounding box
  rects = collection.map((n) -> n.getBoundingClientRect())
  return rects.reduce (acc, r) ->
    top: Math.min(acc.top, r.top)
    left: Math.min(acc.left, r.left)
    bottom: Math.max(acc.bottom, r.bottom)
    right: Math.max(acc.right, r.right)
