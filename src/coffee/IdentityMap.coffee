'use strict'

angular.module("dbaumann.identity-map", [])

.provider("IdentityMap", ->
  @$get = ->
    collection = {}

    # todo more strict implementation of requireConstructor
    collectionKey = (type, requireConstructor=false) ->
      if(requireConstructor && !(angular.isFunction(type) && type.prototype.identity?))
        throw TypeError("expected entity constructor")
      if(angular.isString(type)) then type
      else type.name

    entityKey = (type, entity, requireEntity=true) ->
      if(typeof entity != "object")
        if(requireEntity) then throw TypeError("expected entity")
        else entity
      else (
        if(angular.isFunction(entity.identity)) then entity
        else new type(entity)
      ).identity()
    
    # SINGLETON
    set: (type, replace=false) ->
      cKey = collectionKey(type)
      if(!collection[cKey]?) then collection[cKey] = {}
      (entity) ->
        eKey = entityKey(type, entity)
        if(!collection[cKey][eKey]? || replace) then collection[cKey][eKey] = entity
        undefined

    replace: (type) -> (entity) => @set(type, true)(entity)

    get: (type) ->
      cKey = collectionKey(type)
      if(!collection[cKey]?) then throw Error("'#{cKey}' collection not found")
      (keyOrEntity) ->
        eKey = entityKey(type, keyOrEntity, false)
        collection[cKey][eKey]

    update: (type, branches = []) ->
      collectionKey(type)
      if(branches.length == 0)
        throw Error("no branches provided to IdentityMap.update")

      branches = branches.map((path) ->
        if(angular.isString(path)) then [path] else path
      )

      (entity) =>
        eKey = entityKey(type, entity)
        
        existingTraverse = traverse(@get(type)(eKey))
        
        # type instantiation needed to ensure instantiation of nested entities before merge
        newTraverse = traverse(new type(entity))
        
        for k in branches
          existingTraverse.set(k, newTraverse.get(k))
        
        existingTraverse.value

  undefined
)
