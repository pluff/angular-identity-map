Book = (plainValue) ->
  @class_name = "Book"
  @id = plainValue.id
  @name = plainValue.name
  @features = plainValue.features
  return

BookList = (plainValue) ->
  @class_name = "BookList"
  @id = plainValue.id
  @items = []
  @parent_book = new Book(plainValue.parent_book) if plainValue.parent_book?
  angular.forEach plainValue.items, (book) =>
    @items.push(new Book(book))
  return

describe "identity-map", ->
  IdentityMap = undefined
  myBook = undefined
  beforeEach ->
    myBook = new Book(id: 1, name: "test book", features: null)

  describe "IdentityMap", ->
    beforeEach ->
      module "identity-map"
      inject ($injector) ->
        IdentityMap = $injector.get("IdentityMap")

    describe ".get", ->
      it "returns mapped entity object", ->
        expect(IdentityMap.map(myBook)).toBe myBook
        expect(IdentityMap.get(myBook)).toBe myBook

      it "allows to get by an entity object", ->
        IdentityMap.map myBook
        expect(IdentityMap.get(new Book(myBook))).toBe myBook

      it "allows to get by direct id and type scalar", ->
        IdentityMap.map myBook
        expect(IdentityMap.get(myBook.id, myBook.class_name)).toBe myBook

      it "returns undefined when attempting to get an object not mapped before", ->
        expect(IdentityMap.get(myBook)).toBe undefined

    describe ".detach", ->
      it "removes object from identity map", ->
        IdentityMap.map myBook
        expect(IdentityMap.get(myBook)).toBe myBook
        IdentityMap.detach myBook
        expect(IdentityMap.get(myBook)).toBe undefined
        expect(myBook.constructor).toBe Book

    describe ".isMappable", ->
      it 'returns true if entity has valid entityType and entityId', ->
        expect(IdentityMap.isMappable(myBook)).toBeTruthy()
      it 'returns false if entity has no valid entityType or entityId', ->
        myBook.class_name = undefined
        expect(IdentityMap.isMappable(myBook)).toBeFalsy()
        myBook.class_name = 'Book'
        myBook.id = undefined
        expect(IdentityMap.isMappable(myBook)).toBeFalsy()

    describe ".map", ->
      describe 'when passed param is not mappable', ->
        describe 'for arrays & objects', ->
          it 'returns same array\object with all elements mapped', ->
            arr = [1, 2]
            IdentityMap.map(arr)
            expect(arr).toEqual([1, 2])

            updatedBook = new Book(myBook)
            updatedBook.name = "Updated name"

            IdentityMap.map(myBook)

            arr = [myBook, updatedBook]
            IdentityMap.map arr
            expect(arr).toEqual([myBook, myBook])

            updatedAgainBook = new Book(myBook)
            test_object = {book: updatedAgainBook}
            IdentityMap.map test_object
            expect(test_object.book).toBe myBook


        describe 'for scalars', ->
          it 'simply returns value back', ->
            expect(IdentityMap.map(1)).toEqual 1
            expect(IdentityMap.map('')).toEqual ''

      describe "when object was not mapped before", ->
        it "adds object to identity map and returns the object", ->
          expect(IdentityMap.map(myBook)).toBe myBook
          expect(IdentityMap.get(myBook)).toBe myBook

        it 'maps all child objects recursively', ->
          IdentityMap.map(myBook)
          coll = new BookList(id: 1, parent_book: {id: myBook.id, name: 'Name updated'}, items: [])
          IdentityMap.map(coll)
          expect(coll.parent_book).toBe(myBook)


      describe "when the same object is already present in the map", ->
        updatedBook = undefined
        beforeEach ->
          IdentityMap.map myBook
          updatedBook = new Book(myBook)
          updatedBook.name = "Updated name"

        it "merges old object attributes with new object attributes", ->
          mappedBook = IdentityMap.map(updatedBook)
          expect(mappedBook.name).toBe updatedBook.name
          expect(mappedBook.features).toBe myBook.features

        it "returns old object reference", ->
          expect(IdentityMap.map(updatedBook)).toBe myBook

        it 'maps all childrens objects too', ->
          book1 = new Book id: 10, name: 'Name'
          book2 = new Book id: 20, name: 'Name'
          IdentityMap.map(book1)
          IdentityMap.map(book2)

          parent_book = new Book id: 30, name: 'Name'
          IdentityMap.map(parent_book)
          collection1 = new BookList id: 1, items: []
          collection1.parent_book = parent_book
          IdentityMap.map(collection1)

          updated_collection = new BookList({id: 1, items: [
            {id: 10, name: 'Name 1'},
            {id: 20, name: 'Name 2'}
          ], parent_book: {id: 30, name: 'Name 3'}})

          IdentityMap.map(updated_collection)
          expect(book1.name).toEqual 'Name 1'
          expect(book2.name).toEqual 'Name 2'
          expect(parent_book.name).toEqual 'Name 3'
          expect(collection1.items).toEqual [book1, book2]

        describe "when passed object is not mappable", ->
          response = undefined
          beforeEach ->
            response = {status: 200, body: updatedBook}

          it 'still maps all object properties', ->
            mapped_response = IdentityMap.map(response)
            expect(mapped_response).toBe response
            expect(mapped_response.body).toBe myBook

    describe ".clear", ->
      it "removes all object from identity map, but keeps object references untouched", ->
        IdentityMap.map myBook
        anotherBook = new Book(id: myBook + 1, name: "another name")
        IdentityMap.map anotherBook
        IdentityMap.clear()
        expect(myBook.constructor).toBe Book
        expect(anotherBook.constructor).toBe Book
        expect(IdentityMap.get(myBook)).toBe undefined
        expect(IdentityMap.get(anotherBook)).toBe undefined

  describe "IdentityMapProvider", ->
    it "allows to configure entityId function", ->
      module "identity-map", (IdentityMapProvider) ->
        IdentityMapProvider.setEntityIdFn (e) ->
          e.name
        return

      inject ($injector) ->
        IdentityMap = $injector.get("IdentityMap")

      anotherBook = new Book(id: myBook.id, name: "name!", features: myBook.features)
      IdentityMap.map myBook
      IdentityMap.map anotherBook
      expect(IdentityMap.get(myBook)).toBe myBook
      expect(IdentityMap.get(anotherBook)).toBe anotherBook

    it "allows to configure entityType function", ->
      module "identity-map", (IdentityMapProvider) ->
        IdentityMapProvider.setEntityTypeFn (e) ->
          e.constructor.toString()
        return

      inject ($injector) ->
        IdentityMap = $injector.get("IdentityMap")

      SuperBook = (plainValue) ->
        @prototype = Book::
        @id = plainValue.id
        @name = plainValue.name
        @features = plainValue.features
        return

      IdentityMap.map myBook
      anotherBook = new SuperBook(myBook)
      IdentityMap.map anotherBook
      expect(IdentityMap.get(myBook)).toBe myBook
      expect(IdentityMap.get(anotherBook)).toBe anotherBook
