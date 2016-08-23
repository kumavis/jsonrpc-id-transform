const TransformStream = require('readable-stream').Transform
const extend = require('xtend')

module.exports = JsonRpcIdTransformer


function JsonRpcIdTransformer(){
  const self = this
  self._idMap = {}

  self.assignToNewId = createIdTranformer(assignToNewId)
  self.revertToOldId = createIdTranformer(revertToOldId)

  function assignToNewId(oldId){
    var newId = createRandomId()
    self._idMap[newId] = oldId
    return newId
  }

  function revertToOldId(newId){
    var oldId = self._idMap[newId]
    if (oldId === undefined) throw new Error(`JsonRpcIdTransformer - Unknown id "${newId}"`)
    delete self._idMap[newId]
    return oldId
  }

}

function createIdTranformer(idMapFn){
  return new TransformStream({
    objectMode: true,
    transform(input, encoding, cb) {
      var output
      // handle batched messages
      if (Array.isArray(input)) {
        output = input.map(msg => transformMsgId(msg, idMapFn))
      } else {
        output = transformMsgId(input, idMapFn)
      }
      cb(null, output)
    },
  })
}

function transformMsgId(input, idMapFn){
  var msg = extend(input)
  msg.id = idMapFn(msg.id)
  return msg
}

function createRandomId(){
  const extraDigits = 3
  // 13 time digits
  const datePart = new Date().getTime()*Math.pow(10, extraDigits)
  // 3 random digits
  const extraPart = Math.floor(Math.random()*Math.pow(10, extraDigits))
  // 16 digits
  return datePart+extraPart
}
