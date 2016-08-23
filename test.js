const JsonRpcIdTransformer = require('./index.js')
const Streams = require('mississippi')
const test = require('tape')

test('basic test', function(t){

  var idTransformer = new JsonRpcIdTransformer()

  var midSightings = []
  var midSpy = Streams.through({ objectMode: true }, function(msg, enc, cb){
    midSightings.push(msg)
    cb(null, msg)
  })

  var outSightings = []
  var outSpy = Streams.through({ objectMode: true }, function(msg, enc, cb){
    outSightings.push(msg)
    cb(null, msg)
  })

  var flow = Streams.pipeline.obj(
    idTransformer.assignToNewId,
    midSpy,
    idTransformer.revertToOldId,
    outSpy
  )

  idTransformer.assignToNewId.write({ id: 1 })

  t.equals(midSightings.length, 1)
  t.equals(outSightings.length, 1)

  t.notEquals(midSightings[0].id, 1)
  t.equals(outSightings[0].id, 1)

  t.end()

})

test('batch test', function(t){

  var idTransformer = new JsonRpcIdTransformer()

  var midSightings = []
  var midSpy = Streams.through({ objectMode: true }, function(msg, enc, cb){
    midSightings.push(msg)
    cb(null, msg)
  })

  var outSightings = []
  var outSpy = Streams.through({ objectMode: true }, function(msg, enc, cb){
    outSightings.push(msg)
    cb(null, msg)
  })

  var flow = Streams.pipeline.obj(
    idTransformer.assignToNewId,
    midSpy,
    idTransformer.revertToOldId,
    outSpy
  )

  idTransformer.assignToNewId.write([{ id: 1 }, { id: 2 }])

  t.equals(midSightings.length, 1)
  t.equals(outSightings.length, 1)

  t.equals(midSightings[0].length, 2)
  t.equals(outSightings[0].length, 2)

  t.notEquals(midSightings[0][0].id, 1)
  t.equals(outSightings[0][0].id, 1)

  t.notEquals(midSightings[0][1].id, 2)
  t.equals(outSightings[0][1].id, 2)

  t.end()

})