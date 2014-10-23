'use strict'
traverse = require("traverse")

angular.module("identity-map", [])

.provider("IdentityMap", ->
  identityMap = {}

  entityType = (entity) ->
    if angular.isDefined(entity.class_name)
      entity.class_name
  entityId = (entity) ->
    if angular.isDefined(entity.id)
      entity.id

  raiseInvalidEntity = ->
    throw Error("Cannot get entityType or entityId for identity-map.");

  $get: ->
    set: (entity) ->
      raiseInvalidEntity() unless @isMappable(entity)

      eType = entityType(entity)
      eId = entityId(entity)

      identityMap[eType] ||= {}
      identityMap[eType][eId] ||= entity
      identityMap[eType][eId]

    get: (entity_or_id, type = null) ->
      if type?
        eType = type
        eId = entity_or_id
      else
        raiseInvalidEntity() unless @isMappable(entity_or_id)
        eType = entityType(entity_or_id)
        eId = entityId(entity_or_id)

      identityMap[eType] ||= {}
      identityMap[eType][eId]

    detach: (entity) ->
      raiseInvalidEntity() unless @isMappable(entity)

      eType = entityType(entity)
      eId = entityId(entity)
      identityMap[eType] ||= {}
      delete identityMap[eType][eId]

    isMappable: (obj) ->
      angular.isObject(obj) && entityType(obj) && entityId(obj)

    map: (obj) ->
      # adds obj if not present and mappable
      # updates entire obj if present
      # adds all mappable children recursively.
      # returns mapped entity.
      unless @isMappable obj
        if Array.isArray(obj)
          angular.forEach obj, (value, key) =>
            obj[key] = @map value
        return obj

      if existingEntity = @get(obj)
        existingTraverse = traverse(existingEntity)
        newTraverse = traverse(obj)
        self = this
        newTraverse.forEach (node) ->
          #FIXME: Make it iterate ONLY over level 1
          existingTraverse.set(@path, self.map(node)) if @level == 1

        existingEntity
      else
        newTraverse = traverse(obj)
        self = this
        newTraverse.forEach (node) ->
          #FIXME: Make it iterate ONLY over level 1
          @update self.map(node) if @level == 1

        @set(obj)

    clear: ->
      identityMap = {}

  setEntityTypeFn: (fn) ->
    entityType = fn
  setEntityIdFn: (fn) ->
    entityId = fn
)
